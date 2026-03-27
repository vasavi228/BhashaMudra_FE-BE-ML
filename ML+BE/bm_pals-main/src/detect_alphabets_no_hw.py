import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from collections import deque, Counter
from pathlib import Path

from utils import (
    load_model, normalize_hand, find_wrong_fingers,
    draw_base_panel, draw_finger_row, draw_mode_badge,
    compose_display, FINGER_NAMES_R, FINGER_NAMES_L, EMPTY_HAND,
    C_BG, C_PANEL, C_GREEN, C_RED, C_GREY, C_VIB, C_DIM, C_ACCENT,
)

# ─────────────────────────────────────────────────────────────
MODELS_DIR       = Path("models")
MODEL_PATH       = MODELS_DIR / "alphabets_model.h5"
LABELS_PATH      = MODELS_DIR / "alphabets_label_map.npy"

SMOOTHING_FRAMES = 8
CONF_THRESH      = 0.75
OCCLUSION_EVERY  = 4      # slightly slower for 26 classes; throttle more
OCCLUSION_DROP   = 0.08
PANEL_W          = 380
# ─────────────────────────────────────────────────────────────


def build_panel(panel, pred_label, confidence,
                right_wrong, left_wrong, right_present, left_present):
    h, w = panel.shape[:2]

    if pred_label:
        if confidence >= CONF_THRESH:         status, sc = "Great form!",    C_GREEN
        elif confidence >= CONF_THRESH * 0.7: status, sc = "Getting there",  (50, 200, 220)
        else:                                 status, sc = "Needs work",      C_RED
    else:
        status, sc = "Show hand(s) for A-Z", C_GREY

    row_y = draw_base_panel(
        panel,
        title       = "ISL Alphabets  A-Z",
        subtitle    = "Both hands  —  alphabets_model.keras",
        model_tag   = f"[alphabets_model.keras]   threshold: {int(CONF_THRESH*100)}%",
        confidence  = confidence,
        thresh      = CONF_THRESH,
        pred_label  = pred_label,
        status_text = status,
        status_col  = sc,
        footer_text = "[Q] quit",
    )

    if pred_label:
        # ── Right hand ────────────────────────────────────
        cv2.putText(panel, "Right hand  (fingers 0-4)",
                    (20, row_y), cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
        row_y += 16
        for i, fname in enumerate(FINGER_NAMES_R):
            is_wrong = (i in right_wrong) if right_present else True
            fconf    = max(0.0, confidence - 0.18) if is_wrong else min(1.0, confidence + 0.06)
            draw_finger_row(panel, 20, row_y + i*34, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            row_w=w-40, row_h=32)
        row_y += 5*34 + 10

        # ── Left hand ─────────────────────────────────────
        cv2.putText(panel, "Left hand  (fingers 5-9)",
                    (20, row_y), cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
        row_y += 16
        for i, fname in enumerate(FINGER_NAMES_L):
            is_wrong = (i in left_wrong) if left_present else True
            fconf    = max(0.0, confidence - 0.18) if is_wrong else min(1.0, confidence + 0.06)
            draw_finger_row(panel, 20, row_y + i*34, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            row_w=w-40, row_h=32)
    else:
        cv2.putText(panel, "No hands detected",
                    (20, row_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)


def main():
    print("\n=== ISL Alphabets Detection  (no hardware) ===\n")
    model, labels = load_model(MODEL_PATH, LABELS_PATH, "Alphabets")

    mp_hands = mp.solutions.hands
    mp_draw  = mp.solutions.drawing_utils
    mp_style = mp.solutions.drawing_styles
    hands    = mp_hands.Hands(
        static_image_mode=False, max_num_hands=2,
        min_detection_confidence=0.65, min_tracking_confidence=0.65,
    )

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    pred_buffer    = deque(maxlen=SMOOTHING_FRAMES)
    conf_buffer    = deque(maxlen=SMOOTHING_FRAMES)
    pred_label     = ""
    confidence     = 0.0
    cached_r_wrong = []
    cached_l_wrong = []
    frame_count    = 0

    while True:
        ret, frame = cap.read()
        if not ret: break

        frame = cv2.flip(frame, 1)
        h, fw  = frame.shape[:2]
        result = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        frame_count += 1

        # ── Detect hands ───────────────────────────────────
        right_lm = left_lm = None
        right_present = left_present = False

        if result.multi_hand_landmarks and result.multi_handedness:
            for lm_obj, hand_info in zip(
                result.multi_hand_landmarks, result.multi_handedness
            ):
                label = hand_info.classification[0].label
                mp_draw.draw_landmarks(
                    frame, lm_obj, mp_hands.HAND_CONNECTIONS,
                    mp_style.get_default_hand_landmarks_style(),
                    mp_style.get_default_hand_connections_style(),
                )
                if label == "Right":
                    right_lm, right_present = lm_obj, True
                else:
                    left_lm,  left_present  = lm_obj, True

        # ── Predict ────────────────────────────────────────
        feat_vec = None
        if right_lm is not None or left_lm is not None:
            r_vec    = normalize_hand(right_lm) if right_lm else EMPTY_HAND
            l_vec    = normalize_hand(left_lm)  if left_lm  else EMPTY_HAND
            feat_vec = np.concatenate([r_vec, l_vec])        # (126,)
            probs    = model.predict(feat_vec.reshape(1,-1), verbose=0)[0]
            idx      = int(np.argmax(probs))
            pred_buffer.append(str(labels[idx]))
            conf_buffer.append(float(probs[idx]))
            pred_label = Counter(pred_buffer).most_common(1)[0][0]
            confidence  = float(np.mean(conf_buffer))
        else:
            pred_buffer.clear(); conf_buffer.clear()
            pred_label, confidence = "", 0.0
            cached_r_wrong, cached_l_wrong = [], []

        # ── Occlusion: find wrong fingers (both hands) ─────
        if (feat_vec is not None and pred_label
                and confidence < CONF_THRESH
                and frame_count % OCCLUSION_EVERY == 0):
            pred_idx = int(np.where(labels == pred_label)[0][0])
            # Right hand: offset 0 in the 126-dim vector
            cached_r_wrong = find_wrong_fingers(
                model, feat_vec, confidence, pred_idx,
                hand_offset=0,  drop_threshold=OCCLUSION_DROP,
            )
            # Left hand: offset 63 in the 126-dim vector
            cached_l_wrong = find_wrong_fingers(
                model, feat_vec, confidence, pred_idx,
                hand_offset=63, drop_threshold=OCCLUSION_DROP,
            )

        if confidence >= CONF_THRESH:
            cached_r_wrong, cached_l_wrong = [], []

        # ── Draw ───────────────────────────────────────────
        cam_w = fw - PANEL_W
        panel = np.zeros((h, PANEL_W, 3), dtype=np.uint8)
        build_panel(panel, pred_label, confidence,
                    cached_r_wrong, cached_l_wrong, right_present, left_present)

        display = compose_display(frame, panel, PANEL_W, cam_w)
        draw_mode_badge(display, "A-Z")
        cv2.imshow("ISL Alphabets — No Hardware", display)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
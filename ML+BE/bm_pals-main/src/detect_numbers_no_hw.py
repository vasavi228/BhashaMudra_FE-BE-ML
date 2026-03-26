"""
detect_numbers_no_hw.py
========================
Live ISL numbers (1-9) detection — no glove needed.

- Loads numbers_model.keras only
- Right hand only
- Per-finger feedback: green = correct position, red = needs adjustment
- Wrong fingers found via occlusion sensitivity (model-driven, no hardcoded patterns)

Press [Q] to quit.
"""

import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
from collections import deque, Counter
from pathlib import Path

from utils import (
    load_model, normalize_hand, find_wrong_fingers,
    draw_base_panel, draw_finger_row, draw_mode_badge,
    compose_display, FINGER_NAMES_R, EMPTY_HAND,
    C_BG, C_PANEL, C_GREEN, C_RED, C_GREY, C_VIB, C_DIM, C_ACCENT,
)

# ─────────────────────────────────────────────────────────────
MODELS_DIR         = Path("models")
MODEL_PATH         = MODELS_DIR / "numbers_model.h5"
LABELS_PATH        = MODELS_DIR / "numbers_label_map.npy"

SMOOTHING_FRAMES   = 8
CONF_THRESH        = 0.75
OCCLUSION_EVERY    = 3      # run occlusion every N frames (it's 5× model calls)
OCCLUSION_DROP     = 0.10
PANEL_W            = 380
# ─────────────────────────────────────────────────────────────


def build_panel(panel, pred_label, confidence, wrong_fingers, right_present):
    w = panel.shape[1]

    if pred_label:
        if confidence >= CONF_THRESH:   status, sc = "Great form!",           C_GREEN
        elif confidence >= CONF_THRESH * 0.7: status, sc = "Getting there",   (50, 200, 220)
        else:                           status, sc = "Needs work",             C_RED
    else:
        status, sc = "Show right hand (1-9)", C_GREY

    row_y = draw_base_panel(
        panel,
        title       = "ISL Numbers  1-9",
        subtitle    = "Right hand only  —  numbers_model.keras",
        model_tag   = f"[numbers_model.keras]   threshold: {int(CONF_THRESH*100)}%",
        confidence  = confidence,
        thresh      = CONF_THRESH,
        pred_label  = pred_label,
        status_text = status,
        status_col  = sc,
        footer_text = "[Q] quit",
    )

    if right_present and pred_label:
        for i, fname in enumerate(FINGER_NAMES_R):
            is_wrong = (i in wrong_fingers)
            fconf    = max(0.0, confidence - 0.20) if is_wrong else min(1.0, confidence + 0.08)
            draw_finger_row(panel, 20, row_y + i * 42, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            row_w=w - 40, row_h=40)
    elif not right_present:
        cv2.putText(panel, "No right hand detected",
                    (20, row_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)
    else:
        cv2.putText(panel, "Waiting for prediction...",
                    (20, row_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)


def main():
    print("\n=== ISL Numbers Detection  (no hardware) ===\n")
    model, labels = load_model(MODEL_PATH, LABELS_PATH, "Numbers")

    mp_hands = mp.solutions.hands
    mp_draw  = mp.solutions.drawing_utils
    mp_style = mp.solutions.drawing_styles
    hands    = mp_hands.Hands(
        static_image_mode=False, max_num_hands=1,
        min_detection_confidence=0.65, min_tracking_confidence=0.65,
    )

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    pred_buffer   = deque(maxlen=SMOOTHING_FRAMES)
    conf_buffer   = deque(maxlen=SMOOTHING_FRAMES)
    pred_label    = ""
    confidence    = 0.0
    cached_wrong  = []
    frame_count   = 0

    while True:
        ret, frame = cap.read()
        if not ret: break

        frame = cv2.flip(frame, 1)
        h, fw  = frame.shape[:2]
        result = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        frame_count += 1

        # ── Detect right hand ──────────────────────────────
        right_lm      = None
        right_present = False

        if result.multi_hand_landmarks and result.multi_handedness:
            for lm_obj, hand_info in zip(
                result.multi_hand_landmarks, result.multi_handedness
            ):
                if hand_info.classification[0].label == "Right":
                    right_lm      = lm_obj
                    right_present = True
                    mp_draw.draw_landmarks(
                        frame, lm_obj, mp_hands.HAND_CONNECTIONS,
                        mp_style.get_default_hand_landmarks_style(),
                        mp_style.get_default_hand_connections_style(),
                    )

        # ── Predict ────────────────────────────────────────
        feat_vec = None
        if right_lm is not None:
            feat_vec = normalize_hand(right_lm)                       # (63,)
            probs    = model.predict(feat_vec.reshape(1,-1), verbose=0)[0]
            idx      = int(np.argmax(probs))
            pred_buffer.append(str(labels[idx]))
            conf_buffer.append(float(probs[idx]))
            pred_label = Counter(pred_buffer).most_common(1)[0][0]
            confidence  = float(np.mean(conf_buffer))
        else:
            pred_buffer.clear(); conf_buffer.clear()
            pred_label, confidence = "", 0.0
            cached_wrong = []

        # ── Occlusion: find wrong fingers ──────────────────
        if (feat_vec is not None and pred_label
                and confidence < CONF_THRESH
                and frame_count % OCCLUSION_EVERY == 0):
            pred_idx     = int(np.where(labels == pred_label)[0][0])
            cached_wrong = find_wrong_fingers(
                model, feat_vec, confidence, pred_idx,
                hand_offset=0, drop_threshold=OCCLUSION_DROP,
            )

        if confidence >= CONF_THRESH:
            cached_wrong = []   # sign is correct — no red fingers

        # ── Draw ───────────────────────────────────────────
        cam_w   = fw - PANEL_W
        panel   = np.zeros((h, PANEL_W, 3), dtype=np.uint8)
        build_panel(panel, pred_label, confidence, cached_wrong, right_present)

        display = compose_display(frame, panel, PANEL_W, cam_w)
        draw_mode_badge(display, "1-9")
        cv2.imshow("ISL Numbers — No Hardware", display)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import serial
import serial.tools.list_ports
import argparse
import time
from collections import deque, Counter
from pathlib import Path

from utils import (
    load_model, normalize_hand, find_wrong_fingers,
    draw_base_panel, draw_finger_row, draw_mode_badge,
    compose_display, FINGER_NAMES_R, FINGER_NAMES_L, EMPTY_HAND,
    C_BG, C_PANEL, C_GREEN, C_RED, C_GREY, C_VIB, C_DIM, C_ACCENT,
    FINGER_LANDMARK_GROUPS,
)

# ─────────────────────────────────────────────────────────────
MODELS_DIR       = Path("models")
MODEL_PATH       = MODELS_DIR / "alphabets_model.h5"
LABELS_PATH      = MODELS_DIR / "alphabets_label_map.npy"

SMOOTHING_FRAMES = 8
OCCLUSION_EVERY  = 4
OCCLUSION_DROP   = 0.08
PANEL_W          = 380
# ─────────────────────────────────────────────────────────────


def worst_finger(model, feat_vec, base_conf, pred_idx,
                 hand_offset=0, drop_threshold=0.05):
    """
    Returns a list with exactly ONE finger index (0-4):
    the finger whose presence is hurting confidence the most.

    Occlude each finger in turn and measure the confidence drop.
    A correctly-positioned finger causes a BIG drop when removed.
    A wrong finger causes a SMALL drop (or rise) — it was confusing
    the model, so hiding it actually helps.

    → Smallest drop = most wrong finger → buzz it.

    Returns [finger_idx] or [] if no finger clears the threshold.
    """
    drops = []
    for finger_idx, lm_indices in enumerate(FINGER_LANDMARK_GROUPS):
        occluded = feat_vec.copy()
        for lm_idx in lm_indices:
            start = hand_offset + lm_idx * 3
            occluded[start: start + 3] = 0.0
        conf_occ = float(
            model.predict(occluded.reshape(1, -1), verbose=0)[0][pred_idx]
        )
        drops.append((base_conf - conf_occ, finger_idx))

    drops.sort(key=lambda x: x[0])
    worst_drop, worst_idx = drops[0]

    if worst_drop < drop_threshold:
        return [worst_idx]
    return []


def build_panel(panel, pred_label, confidence, thresh,
                right_wrong, left_wrong, vibrating_r,
                right_present, left_present, serial_ok, port):
    h, w = panel.shape[:2]

    if pred_label:
        if confidence >= thresh:
            status, sc = "Correct!",               C_GREEN
        elif confidence >= thresh * 0.7:
            status, sc = "Almost — adjust fingers", C_VIB
        else:
            status, sc = "Needs work",              C_RED
    else:
        status, sc = "Show hand(s) for A-Z", C_GREY

    glove_str = f"R-glove: {port}" if serial_ok else "R-glove: not connected"
    glove_col = C_GREEN if serial_ok else C_RED

    row_y = draw_base_panel(
        panel,
        title       = "ISL Alphabets  A-Z  + Glove",
        subtitle    = f"Both hands   {glove_str}",
        model_tag   = f"[alphabets_model.keras]   threshold: {int(thresh*100)}%",
        confidence  = confidence,
        thresh      = thresh,
        pred_label  = pred_label,
        status_text = status,
        status_col  = sc,
        footer_text = "[Q] quit",
    )

    cv2.circle(panel, (w - 14, 26), 5, glove_col, -1)

    if pred_label:
        # ── Right hand (glove active) ─────────────────────
        rh_label = "Right hand  (0-4)  ⚡ glove active" if serial_ok \
                   else "Right hand  (0-4)"
        cv2.putText(panel, rh_label, (20, row_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
        row_y += 16
        for i, fname in enumerate(FINGER_NAMES_R):
            is_wrong = (i in right_wrong) if right_present else True
            is_vib   = (i in vibrating_r)
            fconf    = max(0.0, confidence - 0.18) if is_wrong else min(1.0, confidence + 0.06)
            draw_finger_row(panel, 20, row_y + i*34, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            is_vibrating=is_vib, row_w=w-40, row_h=32)
        row_y += 5*34 + 6

        if vibrating_r and serial_ok:
            names = ", ".join(FINGER_NAMES_R[i] for i in vibrating_r)
            cv2.rectangle(panel, (20, row_y), (w-20, row_y+22), (40,28,56), -1)
            cv2.rectangle(panel, (20, row_y), (w-20, row_y+22), C_VIB, 1)
            cv2.putText(panel, f"⚡ {names}", (28, row_y+15),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, C_VIB, 1, cv2.LINE_AA)
            row_y += 28

        # ── Left hand (visual only) ───────────────────────
        cv2.putText(panel, "Left hand  (5-9)  visual only",
                    (20, row_y + 4), cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
        row_y += 20
        for i, fname in enumerate(FINGER_NAMES_L):
            is_wrong = (i in left_wrong) if left_present else True
            fconf    = max(0.0, confidence - 0.18) if is_wrong else min(1.0, confidence + 0.06)
            draw_finger_row(panel, 20, row_y + i*30, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            is_vibrating=False, row_w=w-40, row_h=28)
    else:
        cv2.putText(panel, "No hands detected",
                    (20, row_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)


def main():
    parser = argparse.ArgumentParser(description="ISL Alphabets + Haptic Glove")
    parser.add_argument("--port",   default="COM13", help="ESP32 serial port")
    parser.add_argument("--baud",   default=115200,  type=int)
    parser.add_argument("--thresh", default=0.75,    type=float)
    args = parser.parse_args()

    print("\n=== ISL Alphabets Detection  (with hardware) ===\n")
    print("NOTE: Right-hand glove active for right-hand fingers.")
    print("      Left-hand fingers shown visually only (no left glove).\n")

    model, labels = load_model(MODEL_PATH, LABELS_PATH, "Alphabets")

    # ── Serial ──────────────────────────────────────────────
    ser, serial_ok = None, False
    try:
        ser = serial.Serial(args.port, args.baud, timeout=1)
        time.sleep(2)
        serial_ok = True
        print(f"[OK]  ESP32 connected on {args.port}")
    except Exception as e:
        avail = [p.device for p in serial.tools.list_ports.comports()]
        print(f"[WARN] Serial failed ({args.port}): {e}")
        if avail: print(f"       Available: {', '.join(avail)}")
        print("       Visual-only mode")

    def send(msg: str):
        """Send a single character to the ESP32."""
        if ser and serial_ok:
            try:
                ser.write((msg + "\n").encode())
            except Exception as e:
                print(f"[WARN] Serial: {e}")

    # ── MediaPipe ───────────────────────────────────────────
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
    cached_r_wrong = []   # always 0 or 1 element
    cached_l_wrong = []   # always 0 or 1 element (visual only)
    vibrating_r    = []
    last_sent      = ""
    last_time      = 0.0
    frame_count    = 0
    COOLDOWN       = 0.4

    while True:
        ret, frame = cap.read()
        if not ret:
            break

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
            feat_vec = np.concatenate([r_vec, l_vec])
            probs    = model.predict(feat_vec.reshape(1, -1), verbose=0)[0]
            idx      = int(np.argmax(probs))
            pred_buffer.append(str(labels[idx]))
            conf_buffer.append(float(probs[idx]))
            pred_label = Counter(pred_buffer).most_common(1)[0][0]
            confidence  = float(np.mean(conf_buffer))
        else:
            pred_buffer.clear()
            conf_buffer.clear()
            pred_label, confidence = "", 0.0
            cached_r_wrong, cached_l_wrong = [], []

        # ── Find single worst finger per hand ──────────────
        if (feat_vec is not None and pred_label
                and confidence < args.thresh
                and frame_count % OCCLUSION_EVERY == 0):
            pred_idx = int(np.where(labels == pred_label)[0][0])
            cached_r_wrong = worst_finger(
                model, feat_vec, confidence, pred_idx,
                hand_offset=0,  drop_threshold=OCCLUSION_DROP,
            )
            cached_l_wrong = worst_finger(
                model, feat_vec, confidence, pred_idx,
                hand_offset=63, drop_threshold=OCCLUSION_DROP,
            )

        if confidence >= args.thresh:
            cached_r_wrong, cached_l_wrong = [], []

        # ── Serial: right-hand worst finger only ───────────
        # Arduino cases: '1'=Thumb '2'=Index '3'=Middle '4'=Ring '5'=Pinky
        # Our finger indices are 0-4, so we add 1 before sending.
        now = time.time()
        vibrating_r = []

        if pred_label and right_present:
            if confidence < args.thresh and cached_r_wrong:
                vibrating_r  = cached_r_wrong
                finger_char  = str(cached_r_wrong[0] + 1)   # 0-indexed → '1'-'5'
                if finger_char != last_sent and (now - last_time) > COOLDOWN:
                    send(finger_char)
                    last_sent, last_time = finger_char, now
                    print(f"→ Buzz R: {finger_char} "
                          f"({FINGER_NAMES_R[cached_r_wrong[0]]})  "
                          f"sign={pred_label}  conf={confidence:.2f}")

            elif confidence >= args.thresh and last_sent != "X":
                send("X")
                last_sent, last_time = "X", now
                print(f"→ Correct! Stop  (sign={pred_label}, conf={confidence:.2f})")

        elif not pred_label and last_sent not in ("", "X"):
            send("X")
            last_sent = "X"

        # ── LEFT GLOVE (future) ────────────────────────────
        # if pred_label and left_present and cached_l_wrong:
        #     left_char = str(cached_l_wrong[0] + 1)   # same 1-5 mapping
        #     send_left(left_char)   # second ESP32

        # ── Draw ───────────────────────────────────────────
        cam_w = fw - PANEL_W
        panel = np.zeros((h, PANEL_W, 3), dtype=np.uint8)
        build_panel(panel, pred_label, confidence, args.thresh,
                    cached_r_wrong, cached_l_wrong, vibrating_r,
                    right_present, left_present, serial_ok, args.port)

        display = compose_display(frame, panel, PANEL_W, cam_w)
        draw_mode_badge(display, "A-Z ⚡", C_VIB if vibrating_r else C_ACCENT)
        cv2.imshow("ISL Alphabets + Glove", display)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    if ser:
        try:
            send("X")
            time.sleep(0.1)
            ser.close()
        except:
            pass
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
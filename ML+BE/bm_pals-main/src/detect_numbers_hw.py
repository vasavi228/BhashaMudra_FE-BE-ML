"""
detect_numbers_hw.py
=====================
Live ISL numbers (1-9) detection + ESP32 haptic glove feedback.

- Loads numbers_model.keras only
- Right hand only
- Wrong fingers found via occlusion sensitivity — no hardcoded patterns
- Sends wrong finger IDs over serial: "024\n" → buzz fingers 0, 2, 4
- Sends "X\n" when confidence crosses threshold (sign correct)

Usage:
  python src/detect_numbers_hw.py --port COM13
  python src/detect_numbers_hw.py --port /dev/ttyUSB0 --baud 115200
  python src/detect_numbers_hw.py --port COM13 --thresh 0.80

Press [Q] to quit.
"""

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
    compose_display, FINGER_NAMES_R,
    C_BG, C_PANEL, C_GREEN, C_RED, C_GREY, C_VIB, C_DIM, C_ACCENT, C_WHITE,
)

# ─────────────────────────────────────────────────────────────
MODELS_DIR       = Path("models")
MODEL_PATH       = MODELS_DIR / "numbers_model.h5"
LABELS_PATH      = MODELS_DIR / "numbers_label_map.npy"

SMOOTHING_FRAMES = 8
OCCLUSION_EVERY  = 3
OCCLUSION_DROP   = 0.10
PANEL_W          = 380
# ─────────────────────────────────────────────────────────────


def build_panel(panel, pred_label, confidence, thresh,
                wrong_fingers, vibrating, right_present, serial_ok, port):
    h, w = panel.shape[:2]

    if pred_label:
        if confidence >= thresh:
            status, sc = "Correct! Glove stopped",        C_GREEN
        elif confidence >= thresh * 0.7:
            status, sc = "Almost — glove guiding fingers", C_VIB
        else:
            status, sc = "Needs work — follow glove buzz", C_RED
    else:
        status, sc = "Show right hand (1-9)", C_GREY

    glove_str = f"Glove: {port}" if serial_ok else "Glove: not connected"
    glove_col = C_GREEN if serial_ok else C_RED

    row_y = draw_base_panel(
        panel,
        title       = "ISL Numbers  1-9  + Glove",
        subtitle    = f"Right hand only   {glove_str}",
        model_tag   = f"[numbers_model.keras]   threshold: {int(thresh*100)}%",
        confidence  = confidence,
        thresh      = thresh,
        pred_label  = pred_label,
        status_text = status,
        status_col  = sc,
        footer_text = "[Q] quit",
    )

    # Glove status dot (top-right of header)
    cv2.circle(panel, (w - 14, 26), 5, glove_col, -1)

    # Finger rows
    if right_present and pred_label:
        for i, fname in enumerate(FINGER_NAMES_R):
            is_wrong  = (i in wrong_fingers)
            is_vib    = (i in vibrating)
            fconf     = max(0.0, confidence - 0.20) if is_wrong else min(1.0, confidence + 0.08)
            draw_finger_row(panel, 20, row_y + i * 42, fname,
                            is_wrong=is_wrong, fconf=fconf,
                            is_vibrating=is_vib, row_w=w - 40, row_h=40)

        # Vibration strip at bottom
        if vibrating and serial_ok:
            names = ", ".join(FINGER_NAMES_R[i] for i in vibrating)
            cv2.rectangle(panel, (20, h-78), (w-20, h-56), (40, 28, 56), -1)
            cv2.rectangle(panel, (20, h-78), (w-20, h-56), C_VIB, 1)
            cv2.putText(panel, f"⚡ Vibrating: {names}", (28, h-62),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.40, C_VIB, 1, cv2.LINE_AA)

    elif not right_present:
        cv2.putText(panel, "No right hand detected",
                    (20, row_y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)


def main():
    parser = argparse.ArgumentParser(description="ISL Numbers + Haptic Glove")
    parser.add_argument("--port",   default="COM13",  help="ESP32 serial port")
    parser.add_argument("--baud",   default=115200,   type=int)
    parser.add_argument("--thresh", default=0.75,     type=float,
                        help="Confidence threshold above which buzzing stops")
    args = parser.parse_args()

    print("\n=== ISL Numbers Detection  (with hardware) ===\n")
    model, labels = load_model(MODEL_PATH, LABELS_PATH, "Numbers")

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
        if avail: print(f"       Available ports: {', '.join(avail)}")
        print("       Running visual-only (no glove feedback)")

    def send(msg: str):
        if ser and serial_ok:
            try: ser.write((msg + "\n").encode())
            except Exception as e: print(f"[WARN] Serial: {e}")

    # ── MediaPipe ───────────────────────────────────────────
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

    pred_buffer  = deque(maxlen=SMOOTHING_FRAMES)
    conf_buffer  = deque(maxlen=SMOOTHING_FRAMES)
    pred_label   = ""
    confidence   = 0.0
    cached_wrong = []
    vibrating    = []
    last_sent    = ""
    last_time    = 0.0
    frame_count  = 0
    COOLDOWN     = 0.4

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
            feat_vec = normalize_hand(right_lm)
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
                and confidence < args.thresh
                and frame_count % OCCLUSION_EVERY == 0):
            pred_idx     = int(np.where(labels == pred_label)[0][0])
            cached_wrong = find_wrong_fingers(
                model, feat_vec, confidence, pred_idx,
                hand_offset=0, drop_threshold=OCCLUSION_DROP,
            )

        if confidence >= args.thresh:
            cached_wrong = []

        # ── Serial logic ───────────────────────────────────
        now = time.time()
        vibrating = []

        if pred_label and right_present:
            if confidence < args.thresh and cached_wrong:
                vibrating = cached_wrong
                msg = "".join(str(i) for i in vibrating)
                if msg != last_sent and (now - last_time) > COOLDOWN:
                    send(msg)
                    last_sent, last_time = msg, now
                    print(f"→ Buzz: {msg}  (sign={pred_label}, conf={confidence:.2f})")

            elif confidence >= args.thresh and last_sent != "X":
                send("X")
                last_sent, last_time = "X", now
                print(f"→ Correct! Stop  (sign={pred_label}, conf={confidence:.2f})")

        elif not pred_label and last_sent not in ("", "X"):
            # Hand left frame — stop vibration
            send("X"); last_sent = "X"

        # ── Draw ───────────────────────────────────────────
        cam_w = fw - PANEL_W
        panel = np.zeros((h, PANEL_W, 3), dtype=np.uint8)
        build_panel(panel, pred_label, confidence, args.thresh,
                    cached_wrong, vibrating, right_present, serial_ok, args.port)

        display = compose_display(frame, panel, PANEL_W, cam_w)
        draw_mode_badge(display, "1-9 ⚡", C_VIB if vibrating else C_ACCENT)
        cv2.imshow("ISL Numbers + Glove", display)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    if ser:
        try: send("X"); time.sleep(0.1); ser.close()
        except: pass
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
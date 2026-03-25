"""
detect_with_hardware.py
=======================
Live ISL detection with ESP32 haptic glove feedback.

MODEL ROUTING — exactly the same as detect_no_hardware.py:
  mode = "numbers"   → numbers_model.keras  → right hand → serial feedback
  mode = "alphabets" → alphabets_model.keras → both hands → visual only

SERIAL PROTOCOL (matches your ESP32 firmware):
  "013\n"  → vibrate fingers 0, 1, 3  (thumb, index, ring)
  "X\n"    → stop all vibration

HARDWARE RULE:
  Serial only fires in NUMBERS mode.
  In alphabets mode the port stays silent — you have no left-hand glove.

Usage:
  python src/detect_with_hardware.py --port COM13
  python src/detect_with_hardware.py --port /dev/ttyUSB0 --baud 115200

Requirements:
  pip install opencv-python mediapipe tensorflow numpy pyserial
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

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
MODELS_DIR            = Path("models")
NUMBERS_MODEL_PATH    = MODELS_DIR / "numbers_model.h5"
NUMBERS_LABELS_PATH   = MODELS_DIR / "numbers_label_map.npy"
ALPHABETS_MODEL_PATH  = MODELS_DIR / "alphabets_model.h5"
ALPHABETS_LABELS_PATH = MODELS_DIR / "alphabets_label_map.npy"

SMOOTHING_FRAMES = 8
COOLDOWN_SEC     = 0.4      # minimum seconds between serial writes
VIBRATE_THRESH   = 0.75     # confidence below this → send wrong fingers to glove
PANEL_W          = 380
TIP_IDS          = [4, 8, 12, 16, 20]
FINGER_NAMES_R   = ["Thumb", "Index", "Middle", "Ring", "Pinky"]
FINGER_NAMES_L   = ["L-Thumb","L-Index","L-Middle","L-Ring","L-Pinky"]

NUMBER_PATTERNS = {
    "1": [0,1,0,0,0],
    "2": [0,1,1,0,0],
    "3": [1,1,1,0,0],
    "4": [0,1,1,1,1],
    "5": [1,1,1,1,1],
    "6": [0,1,1,1,0],
    "7": [0,1,1,0,1],
    "8": [0,1,0,1,1],
    "9": [0,0,1,1,1],
}

# ── Colours (BGR) ────────────────────────────────────────────
C_BG     = (18,  18,  24)
C_PANEL  = (28,  28,  38)
C_ACCENT = (96,  200, 255)
C_GREEN  = (80,  220, 120)
C_RED    = (80,  80,  220)
C_GREY   = (120, 120, 140)
C_WHITE  = (240, 240, 250)
C_GOLD   = (60,  200, 255)
C_DIM    = (60,   60,  75)
C_VIB    = (60,  140, 255)   # orange for "vibrating" highlight


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def load_model(model_path, labels_path, name):
    if not model_path.exists():
        print(f"[WARN] {name} model not found at {model_path}")
        return None, None
    model  = tf.keras.models.load_model(model_path)
    labels = np.load(labels_path, allow_pickle=True)
    print(f"[OK]  {name} model loaded — classes: {list(labels)}")
    return model, labels


def normalize_hand(lm_obj):
    xyz = np.array([[p.x, p.y, p.z] for p in lm_obj.landmark], dtype=np.float32)
    xyz -= xyz[0]
    scale = np.max(np.linalg.norm(xyz, axis=1)) + 1e-6
    xyz  /= scale
    return xyz.flatten()


def get_finger_states(lm, hand_label):
    states = []
    if hand_label == "Right":
        states.append(1 if lm[4].x < lm[3].x else 0)
    else:
        states.append(1 if lm[4].x > lm[3].x else 0)
    for tip in TIP_IDS[1:]:
        states.append(1 if lm[tip].y < lm[tip - 2].y else 0)
    return states


def wrong_fingers(actual, expected):
    return [i for i in range(5) if actual[i] != expected[i]]


# ─────────────────────────────────────────────────────────────
# Drawing
# ─────────────────────────────────────────────────────────────

def put_centered(img, text, cx, cy, fs, color, thickness=1):
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), _ = cv2.getTextSize(text, font, fs, thickness)
    cv2.putText(img, text, (cx - tw//2, cy + th//2), font, fs, color, thickness, cv2.LINE_AA)


def draw_conf_bar(img, x, y, w, h, value, thresh, label="Confidence"):
    cv2.rectangle(img, (x, y), (x+w, y+h), C_DIM, -1)
    cv2.rectangle(img, (x, y), (x+w, y+h), C_GREY, 1)
    fill_w = int(w * value)
    col = C_GREEN if value >= thresh else ((50,200,220) if value >= thresh * 0.7 else C_RED)
    if fill_w > 2:
        cv2.rectangle(img, (x, y), (x + fill_w, y + h), col, -1)
    put_centered(img, f"{int(value*100)}%", x + w//2, y + h//2, 0.52, C_WHITE, 1)
    # Threshold marker
    tx = x + int(w * thresh)
    cv2.line(img, (tx, y-3), (tx, y+h+3), C_WHITE, 1)
    cv2.putText(img, label, (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.40, C_GREY, 1, cv2.LINE_AA)


def draw_finger_row(img, x, y, fname, is_correct, fconf, is_vibrating, row_w, row_h=36):
    if is_vibrating and not is_correct:
        bg  = (60, 38, 28)
        col = C_VIB
    elif is_correct:
        bg  = C_DIM
        col = C_GREEN
    else:
        bg  = (45, 28, 28)
        col = C_RED

    cv2.rectangle(img, (x, y), (x + row_w, y + row_h - 4), bg, -1, cv2.LINE_AA)
    cv2.circle(img, (x + 14, y + row_h // 2 - 2), 6, col, -1, cv2.LINE_AA)

    label = fname + (" ⚡" if is_vibrating and not is_correct else "")
    cv2.putText(img, label, (x + 28, y + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.44, col, 1, cv2.LINE_AA)

    bx, bw, bh = x + 145, row_w - 160, 10
    by = y + (row_h - bh) // 2 - 2
    cv2.rectangle(img, (bx, by), (bx + bw, by + bh), (45, 45, 58), -1)
    fill = int(bw * max(0.0, min(1.0, fconf)))
    if fill > 0:
        cv2.rectangle(img, (bx, by), (bx + fill, by + bh), col, -1)
    cv2.putText(img, f"{int(fconf*100)}%", (bx + bw + 6, by + 9),
                cv2.FONT_HERSHEY_SIMPLEX, 0.37, col, 1, cv2.LINE_AA)


def draw_panel(panel, mode, num_model, alph_model, serial_ok, port_name,
               pred_label, confidence, thresh,
               right_states, left_states, expected_pattern, vibrating):
    h, w = panel.shape[:2]
    panel[:] = C_PANEL

    # ── Header ──────────────────────────────────────────────
    cv2.rectangle(panel, (0, 0), (w, 90), C_BG, -1)
    cv2.putText(panel, "ISL Haptic Glove", (16, 24),
                cv2.FONT_HERSHEY_SIMPLEX, 0.60, C_ACCENT, 1, cv2.LINE_AA)
    mode_label = "Numbers 1-9  (right hand + glove)" if mode == "numbers" \
                 else "Alphabets A-Z  (both hands, visual only)"
    cv2.putText(panel, mode_label, (16, 46),
                cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
    model_tag = "[numbers_model.keras]" if mode == "numbers" else "[alphabets_model.keras]"
    tag_col = C_GREEN if (mode == "numbers" and num_model) or \
                         (mode == "alphabets" and alph_model) else C_RED
    cv2.putText(panel, model_tag, (16, 64),
                cv2.FONT_HERSHEY_SIMPLEX, 0.34, tag_col, 1, cv2.LINE_AA)

    # Serial status
    dot_col = C_GREEN if serial_ok else C_RED
    dot_txt = f"Glove: {port_name}" if serial_ok else "Glove: not connected"
    cv2.circle(panel, (w - 14, 24), 5, dot_col, -1)
    cv2.putText(panel, dot_txt, (16, 80),
                cv2.FONT_HERSHEY_SIMPLEX, 0.34, dot_col, 1, cv2.LINE_AA)
    cv2.line(panel, (0, 90), (w, 90), C_DIM, 1)

    # ── Big sign ────────────────────────────────────────────
    if pred_label:
        cv2.putText(panel, pred_label, (w//2 - 44, 192),
                    cv2.FONT_HERSHEY_SIMPLEX, 4.5, C_GOLD, 4, cv2.LINE_AA)
    else:
        put_centered(panel, "—", w//2, 168, 3, C_DIM, 2)

    # ── Confidence bar ──────────────────────────────────────
    draw_conf_bar(panel, 20, 214, w - 40, 26, confidence if pred_label else 0.0,
                  thresh if mode == "numbers" else 0.80)

    # ── Status ──────────────────────────────────────────────
    if mode == "numbers" and num_model is None:
        status, sc = "numbers_model not trained", C_RED
    elif mode == "alphabets" and alph_model is None:
        status, sc = "alphabets_model not trained", C_RED
    elif pred_label:
        if confidence >= thresh:
            status, sc = "Correct! Glove stopped",           C_GREEN
        elif confidence >= thresh * 0.7:
            status, sc = "Almost — glove guiding fingers",   C_VIB
        else:
            status, sc = "Needs work — follow glove buzz",   C_RED
        if mode == "alphabets":
            status, sc = ("Great form!" if confidence >= 0.80 else "Getting there"), \
                         (C_GREEN if confidence >= 0.80 else (50, 200, 220))
    else:
        status, sc = ("Show right hand" if mode == "numbers" else "Show hand(s)"), C_GREY
    cv2.putText(panel, status, (20, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.44, sc, 1, cv2.LINE_AA)

    # ── Finger analysis ─────────────────────────────────────
    cv2.line(panel, (20, 274), (w - 20, 274), C_DIM, 1)
    cv2.putText(panel, "Finger Analysis", (20, 292),
                cv2.FONT_HERSHEY_SIMPLEX, 0.44, C_ACCENT, 1, cv2.LINE_AA)

    row_y = 300
    row_w = w - 40

    if mode == "numbers":
        if right_states and expected_pattern:
            for i, fname in enumerate(FINGER_NAMES_R):
                correct   = (right_states[i] == expected_pattern[i])
                is_vib    = (i in vibrating)
                fconf     = min(1.0, confidence + 0.08) if correct else max(0.0, confidence - 0.22)
                draw_finger_row(panel, 20, row_y + i * 40, fname, correct, fconf,
                                is_vib, row_w=row_w, row_h=38)
        else:
            cv2.putText(panel, "No right hand detected",
                        (20, row_y + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.42, C_GREY, 1, cv2.LINE_AA)

        # Vibration strip
        if vibrating and serial_ok and pred_label:
            vib_str = "Vibrating: " + ", ".join(FINGER_NAMES_R[i] for i in vibrating)
            cv2.rectangle(panel, (20, h - 78), (w - 20, h - 58), (40, 28, 56), -1)
            cv2.rectangle(panel, (20, h - 78), (w - 20, h - 58), C_VIB, 1)
            cv2.putText(panel, vib_str, (28, h - 62),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.40, C_VIB, 1, cv2.LINE_AA)

    else:  # alphabets — visual only
        hw_note = "Glove inactive in alphabets mode"
        cv2.putText(panel, hw_note, (20, row_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.36, C_GREY, 1, cv2.LINE_AA)
        row_y += 16
        cv2.putText(panel, "Right hand (fingers 0-4)", (20, row_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.34, C_GREY, 1, cv2.LINE_AA)
        row_y += 14
        for i, fname in enumerate(FINGER_NAMES_R):
            present = right_states is not None
            draw_finger_row(panel, 20, row_y + i * 30, fname, present,
                            confidence if present else 0.0, False, row_w=row_w, row_h=30)
        row_y += 5 * 30 + 8
        cv2.putText(panel, "Left hand (fingers 5-9)", (20, row_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.34, C_GREY, 1, cv2.LINE_AA)
        row_y += 14
        for i, fname in enumerate(FINGER_NAMES_L):
            present = left_states is not None
            draw_finger_row(panel, 20, row_y + i * 30, fname, present,
                            confidence if present else 0.0, False, row_w=row_w, row_h=30)

    # ── Footer ──────────────────────────────────────────────
    cv2.line(panel, (0, h - 44), (w, h - 44), C_DIM, 1)
    cv2.putText(panel, "[M] toggle mode    [Q] quit",
                (16, h - 22), cv2.FONT_HERSHEY_SIMPLEX, 0.37, C_GREY, 1, cv2.LINE_AA)


# ─────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port",   default="COM4",  help="ESP32 serial port")
    parser.add_argument("--baud",   default=115200,   type=int)
    parser.add_argument("--thresh", default=0.75,     type=float,
                        help="Confidence threshold above which vibration stops")
    args = parser.parse_args()

    print("\n=== ISL Haptic Glove — Live Detection ===\n")

    # ── Serial ──────────────────────────────────────────────
    ser, serial_ok = None, False
    try:
        ser = serial.Serial(args.port, args.baud, timeout=1)
        time.sleep(2)
        serial_ok = True
        print(f"[OK]  ESP32 connected on {args.port}")
    except Exception as e:
        print(f"[WARN] Serial failed ({args.port}): {e}")
        avail = [p.device for p in serial.tools.list_ports.comports()]
        if avail:
            print(f"       Available ports: {', '.join(avail)}")
        print("       Running in VISUAL ONLY mode — no glove feedback")

    def send(msg):
        """Write a message to serial with error handling."""
        if ser and serial_ok:
            try:
                ser.write((msg + "\n").encode())
            except Exception as e:
                print(f"[WARN] Serial write error: {e}")

    # ── Models ──────────────────────────────────────────────
    num_model,  num_labels  = load_model(NUMBERS_MODEL_PATH,   NUMBERS_LABELS_PATH,   "Numbers")
    alph_model, alph_labels = load_model(ALPHABETS_MODEL_PATH, ALPHABETS_LABELS_PATH, "Alphabets")

    if num_model is None and alph_model is None:
        print("\nERROR: No trained models. Train them first.")
        if ser: ser.close()
        return

    mode = "numbers" if num_model is not None else "alphabets"
    print(f"\nActive mode: {mode}  — [M] to switch, [Q] to quit\n")

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

    EMPTY_HAND   = np.zeros(63, dtype=np.float32)
    pred_buffer  = deque(maxlen=SMOOTHING_FRAMES)
    conf_buffer  = deque(maxlen=SMOOTHING_FRAMES)
    pred_label   = ""
    confidence   = 0.0
    right_states = None
    left_states  = None
    expected_pat = None
    vibrating    = []
    last_sent    = ""
    last_time    = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        h, fw = frame.shape[:2]
        result = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        # ── Parse hands ─────────────────────────────────────
        right_lm = left_lm = None
        right_states = left_states = None

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
                    right_lm     = lm_obj
                    right_states = get_finger_states(lm_obj.landmark, "Right")
                else:
                    left_lm      = lm_obj
                    left_states  = get_finger_states(lm_obj.landmark, "Left")

        # ── Predict ─────────────────────────────────────────
        raw_pred = None
        raw_conf = 0.0

        if mode == "numbers" and num_model is not None:
            if right_lm is not None:
                feat  = normalize_hand(right_lm).reshape(1, -1)
                probs = num_model.predict(feat, verbose=0)[0]
                idx   = int(np.argmax(probs))
                raw_pred = str(num_labels[idx])
                raw_conf = float(probs[idx])
                expected_pat = NUMBER_PATTERNS.get(raw_pred)
            else:
                pred_buffer.clear(); conf_buffer.clear()
                pred_label, confidence = "", 0.0
                expected_pat = None

        elif mode == "alphabets" and alph_model is not None:
            if right_lm is not None or left_lm is not None:
                r_vec = normalize_hand(right_lm) if right_lm else EMPTY_HAND
                l_vec = normalize_hand(left_lm)  if left_lm  else EMPTY_HAND
                feat  = np.concatenate([r_vec, l_vec]).reshape(1, -1)
                probs = alph_model.predict(feat, verbose=0)[0]
                idx   = int(np.argmax(probs))
                raw_pred = str(alph_labels[idx])
                raw_conf = float(probs[idx])
                expected_pat = None
            else:
                pred_buffer.clear(); conf_buffer.clear()
                pred_label, confidence = "", 0.0

        if raw_pred is not None:
            pred_buffer.append(raw_pred)
            conf_buffer.append(raw_conf)
            pred_label = Counter(pred_buffer).most_common(1)[0][0]
            confidence  = float(np.mean(conf_buffer))

        # ── Serial logic (NUMBERS MODE ONLY) ────────────────
        #
        #   confidence < thresh AND wrong fingers exist → buzz those fingers
        #   confidence >= thresh                        → send "X" (stop)
        #   alphabets mode                              → SILENT (no glove)
        #
        vibrating = []
        now = time.time()

        if mode == "numbers" and pred_label and right_states and expected_pat:
            vibrating = wrong_fingers(right_states, expected_pat)

            if confidence < args.thresh and vibrating:
                msg = "".join(str(i) for i in vibrating)
                if msg != last_sent and (now - last_time) > COOLDOWN_SEC:
                    send(msg)
                    last_sent, last_time = msg, now
                    print(f"→ Buzz: {msg}  (pred={pred_label}, conf={confidence:.2f})")

            elif confidence >= args.thresh and last_sent != "X":
                send("X")
                last_sent, last_time = "X", now
                vibrating = []
                print(f"→ Correct! Stop buzz  (pred={pred_label}, conf={confidence:.2f})")

        elif not pred_label and last_sent not in ("", "X"):
            # Hand disappeared — stop vibrating
            send("X")
            last_sent = "X"

        # ── Display ─────────────────────────────────────────
        cam_w   = fw - PANEL_W
        display = np.full((h, fw, 3), C_BG, dtype=np.uint8)
        display[:, :cam_w] = frame[:, :cam_w]
        cv2.line(display, (cam_w, 0), (cam_w, h), C_DIM, 2)

        panel = np.zeros((h, PANEL_W, 3), dtype=np.uint8)
        draw_panel(panel, mode, num_model, alph_model, serial_ok, args.port,
                   pred_label, confidence, args.thresh,
                   right_states, left_states, expected_pat, vibrating)
        display[:, cam_w:] = panel

        badge     = "1-9" if mode == "numbers" else "A-Z"
        badge_col = C_ACCENT if (mode=="numbers" and num_model) or \
                                (mode=="alphabets" and alph_model) else C_RED
        cv2.rectangle(display, (8, 8), (68, 34), C_BG, -1)
        cv2.rectangle(display, (8, 8), (68, 34), badge_col, 1)
        cv2.putText(display, badge, (14, 27),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, badge_col, 1, cv2.LINE_AA)

        cv2.imshow("ISL Haptic Glove System", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('m'):
            mode = "alphabets" if mode == "numbers" else "numbers"
            pred_buffer.clear(); conf_buffer.clear()
            pred_label, confidence = "", 0.0
            expected_pat, vibrating = None, []
            if ser: send("X"); last_sent = "X"
            print(f"[M] Switched → {mode}")

    # ── Cleanup ─────────────────────────────────────────────
    if ser:
        try: send("X"); time.sleep(0.1); ser.close()
        except: pass
    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
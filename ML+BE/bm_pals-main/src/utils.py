"""
utils.py
========
Shared helpers for all ISL detection scripts.
Imported by:
  detect_numbers_no_hw.py
  detect_numbers_hw.py
  detect_alphabets_no_hw.py
  detect_alphabets_hw.py
"""

import cv2
import numpy as np
import tensorflow as tf
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# Colours  (BGR)
# ─────────────────────────────────────────────────────────────
C_BG     = (18,  18,  24)
C_PANEL  = (28,  28,  38)
C_ACCENT = (96,  200, 255)
C_GREEN  = (80,  220, 120)
C_RED    = (80,  80,  220)
C_GREY   = (120, 120, 140)
C_WHITE  = (240, 240, 250)
C_GOLD   = (60,  200, 255)
C_DIM    = (60,   60,  75)
C_VIB    = (60,  140, 255)   # orange — "vibrating" highlight

# ─────────────────────────────────────────────────────────────
# MediaPipe landmark groups per finger
# (used by occlusion analysis — we zero these indices)
# ─────────────────────────────────────────────────────────────
FINGER_LANDMARK_GROUPS = [
    [1,  2,  3,  4],    # Thumb
    [5,  6,  7,  8],    # Index
    [9,  10, 11, 12],   # Middle
    [13, 14, 15, 16],   # Ring
    [17, 18, 19, 20],   # Pinky
]

TIP_IDS        = [4, 8, 12, 16, 20]
FINGER_NAMES_R = ["Thumb",   "Index",   "Middle",   "Ring",   "Pinky"]
FINGER_NAMES_L = ["L-Thumb", "L-Index", "L-Middle", "L-Ring", "L-Pinky"]

EMPTY_HAND = np.zeros(63, dtype=np.float32)   # placeholder when a hand is absent


# ─────────────────────────────────────────────────────────────
# Model loading
# ─────────────────────────────────────────────────────────────

def load_model(model_path: Path, labels_path: Path, name: str):
    """
    Returns (model, labels_array) or raises SystemExit if not found.
    """
    if not model_path.exists():
        print(f"[ERROR] {name} model not found: {model_path}")
        print(f"        Run the training script first.")
        raise SystemExit(1)
    model  = tf.keras.models.load_model(model_path)
    labels = np.load(labels_path, allow_pickle=True)
    print(f"[OK]  {name} model loaded — {len(labels)} classes: {list(labels)}")
    return model, labels


# ─────────────────────────────────────────────────────────────
# Landmark normalisation
# ─────────────────────────────────────────────────────────────

def normalize_hand(lm_obj) -> np.ndarray:
    """
    MediaPipe landmark object → normalised flat (63,) float32 array.
    1. Translate so wrist (landmark 0) is at origin.
    2. Scale so max reach = 1.
    """
    xyz = np.array([[p.x, p.y, p.z] for p in lm_obj.landmark], dtype=np.float32)
    xyz -= xyz[0]
    scale = np.max(np.linalg.norm(xyz, axis=1)) + 1e-6
    xyz  /= scale
    return xyz.flatten()


# ─────────────────────────────────────────────────────────────
# Occlusion-based wrong-finger detection
# ─────────────────────────────────────────────────────────────

def find_wrong_fingers(
    model,
    feat: np.ndarray,
    base_conf: float,
    pred_idx: int,
    hand_offset: int = 0,
    drop_threshold: float = 0.10,
) -> list[int]:
    """
    For ONE hand within a feature vector.

    feat         : full feature vector (63 for numbers, 126 for alphabets)
    base_conf    : model confidence for pred_idx on the unmodified feat
    pred_idx     : class index of the smoothed prediction
    hand_offset  : byte offset in feat where this hand's data starts
                   0  → right hand (or only hand)
                   63 → left hand  (inside 126-dim alphabets vector)
    drop_threshold: if zeroing a finger drops confidence by less than this,
                   that finger is NOT contributing → it's wrong → buzz it

    Returns list of finger indices (0–4) that should be buzzed.
    """
    wrong = []
    for finger_idx, lm_indices in enumerate(FINGER_LANDMARK_GROUPS):
        occluded = feat.copy()
        for lm_idx in lm_indices:
            start = hand_offset + lm_idx * 3
            occluded[start : start + 3] = 0.0

        conf_occ = float(
            model.predict(occluded.reshape(1, -1), verbose=0)[0][pred_idx]
        )
        drop = base_conf - conf_occ
        # Small or negative drop → finger wasn't helping → it's wrong
        if drop < drop_threshold:
            wrong.append(finger_idx)

    return wrong


# ─────────────────────────────────────────────────────────────
# Drawing primitives  (shared across all 4 scripts)
# ─────────────────────────────────────────────────────────────

def put_centered(img, text, cx, cy, fs, color, thick=1):
    font = cv2.FONT_HERSHEY_SIMPLEX
    (tw, th), _ = cv2.getTextSize(text, font, fs, thick)
    cv2.putText(img, text, (cx - tw//2, cy + th//2),
                font, fs, color, thick, cv2.LINE_AA)


def draw_conf_bar(img, x, y, w, h, value, thresh, label="Confidence"):
    """Segmented bar with a threshold tick mark."""
    cv2.rectangle(img, (x, y), (x+w, y+h), C_DIM, -1)
    cv2.rectangle(img, (x, y), (x+w, y+h), C_GREY, 1)
    fill_w = int(w * max(0.0, min(1.0, value)))
    col = C_GREEN if value >= thresh else ((50, 200, 220) if value >= thresh*0.65 else C_RED)
    if fill_w > 2:
        cv2.rectangle(img, (x, y), (x + fill_w, y + h), col, -1)
    put_centered(img, f"{int(value*100)}%", x + w//2, y + h//2, 0.52, C_WHITE, 1)
    # Threshold tick
    tx = x + int(w * thresh)
    cv2.line(img, (tx, y-3), (tx, y+h+3), C_WHITE, 1)
    cv2.putText(img, label, (x, y-8),
                cv2.FONT_HERSHEY_SIMPLEX, 0.40, C_GREY, 1, cv2.LINE_AA)


def draw_finger_row(img, x, y, fname, is_wrong, fconf,
                    is_vibrating=False, row_w=320, row_h=38):
    """Single finger feedback row with dot, name, mini-bar, percentage."""
    if is_vibrating:
        bg, col = (60, 38, 28), C_VIB
    elif is_wrong:
        bg, col = (45, 28, 28), C_RED
    else:
        bg, col = C_DIM, C_GREEN

    cv2.rectangle(img, (x, y), (x + row_w, y + row_h - 4), bg, -1, cv2.LINE_AA)
    cv2.circle(img,   (x + 14, y + row_h//2 - 2), 6, col, -1, cv2.LINE_AA)

    label = fname + (" ⚡" if is_vibrating else "")
    cv2.putText(img, label, (x + 28, y + 22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.44, col, 1, cv2.LINE_AA)

    bx = x + 145
    bw = row_w - 162
    bh = 10
    by = y + (row_h - bh) // 2 - 2
    cv2.rectangle(img, (bx, by), (bx+bw, by+bh), (45, 45, 58), -1)
    fill = int(bw * max(0.0, min(1.0, fconf)))
    if fill > 0:
        cv2.rectangle(img, (bx, by), (bx+fill, by+bh), col, -1)
    cv2.putText(img, f"{int(fconf*100)}%", (bx+bw+6, by+9),
                cv2.FONT_HERSHEY_SIMPLEX, 0.37, col, 1, cv2.LINE_AA)


def draw_base_panel(panel, title, subtitle, model_tag, confidence, thresh,
                    pred_label, status_text, status_col, footer_text):
    """
    Draws the static parts of the right panel that every script shares:
    header, big sign, confidence bar, status line, footer.
    Returns the y-coordinate where the finger section should begin.
    """
    h, w = panel.shape[:2]
    panel[:] = C_PANEL

    # Header
    cv2.rectangle(panel, (0, 0), (w, 76), C_BG, -1)
    cv2.putText(panel, title,    (16, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.60, C_ACCENT, 1, cv2.LINE_AA)
    cv2.putText(panel, subtitle, (16, 46), cv2.FONT_HERSHEY_SIMPLEX, 0.37, C_GREY,   1, cv2.LINE_AA)
    cv2.putText(panel, model_tag,(16, 64), cv2.FONT_HERSHEY_SIMPLEX, 0.34, C_GREEN,  1, cv2.LINE_AA)
    cv2.line(panel, (0, 76), (w, 76), C_DIM, 1)

    # Big predicted sign
    if pred_label:
        cv2.putText(panel, pred_label, (w//2 - 44, 176),
                    cv2.FONT_HERSHEY_SIMPLEX, 4.5, C_GOLD, 4, cv2.LINE_AA)
    else:
        put_centered(panel, "—", w//2, 152, 3, C_DIM, 2)

    # Confidence bar
    draw_conf_bar(panel, 20, 198, w-40, 26, confidence if pred_label else 0.0,
                  thresh, "Confidence")

    # Status
    cv2.putText(panel, status_text, (20, 244),
                cv2.FONT_HERSHEY_SIMPLEX, 0.44, status_col, 1, cv2.LINE_AA)

    # Divider + section title
    cv2.line(panel, (20, 258), (w-20, 258), C_DIM, 1)
    cv2.putText(panel, "Finger Analysis", (20, 276),
                cv2.FONT_HERSHEY_SIMPLEX, 0.44, C_ACCENT, 1, cv2.LINE_AA)

    # Footer
    cv2.line(panel, (0, h-44), (w, h-44), C_DIM, 1)
    cv2.putText(panel, footer_text, (16, h-22),
                cv2.FONT_HERSHEY_SIMPLEX, 0.37, C_GREY, 1, cv2.LINE_AA)

    return 284   # y-start for finger rows


def compose_display(frame, panel, panel_w, cam_w):
    """Stitch camera frame + side panel into one display image."""
    h, fw = frame.shape[:2]
    display = np.full((h, fw, 3), C_BG, dtype=np.uint8)
    display[:, :cam_w] = frame[:, :cam_w]
    cv2.line(display, (cam_w, 0), (cam_w, h), C_DIM, 2)
    display[:, cam_w:] = panel
    return display


def draw_mode_badge(display, text, color=None):
    """Small badge in top-left corner of camera feed."""
    col = color or C_ACCENT
    cv2.rectangle(display, (8, 8), (72, 34), C_BG, -1)
    cv2.rectangle(display, (8, 8), (72, 34), col, 1)
    cv2.putText(display, text, (14, 27),
                cv2.FONT_HERSHEY_SIMPLEX, 0.52, col, 1, cv2.LINE_AA)
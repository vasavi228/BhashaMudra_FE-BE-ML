"""
preprocess_alphabets.py
=======================
Extracts MediaPipe hand landmarks from images in data/isl/alphabets/A–Z.
Uses BOTH hands. Saves landmark arrays + labels to data/alphabets_landmarks.npz.

Feature vector (126,):
  Right hand: 21 × 3 = 63  (fingers 0-4)
  Left  hand: 21 × 3 = 63  (fingers 5-9)
  Missing hand → zeros.

Normalised per-hand: translate to wrist, scale to unit reach.
"""

import os
import cv2
import numpy as np
import mediapipe as mp
from pathlib import Path
import string

# ─────────────────────────────────────────────
DATA_ROOT   = Path("data/isl/alphabets")    # subfolders: A, B, … Z
OUTPUT_FILE = Path("data/alphabets_landmarks.npz")
LABELS      = list(string.ascii_uppercase)  # A … Z
# ─────────────────────────────────────────────

mp_hands  = mp.solutions.hands
hands_det = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.5,
)

EMPTY_HAND = np.zeros(63, dtype=np.float32)   # placeholder when hand absent


def normalize_hand(landmarks_xyz: np.ndarray) -> np.ndarray:
    """(21,3) → normalised flat (63,)"""
    lm = landmarks_xyz.copy()
    lm -= lm[0]
    scale = np.max(np.linalg.norm(lm, axis=1)) + 1e-6
    lm /= scale
    return lm.flatten()


def extract_from_folder(label_str: str) -> list[np.ndarray]:
    folder = DATA_ROOT / label_str
    if not folder.exists():
        print(f"  [WARN] folder not found: {folder}")
        return []

    samples = []
    img_files = list(folder.glob("*"))
    print(f"  {label_str}: {len(img_files)} images found")

    for img_path in img_files:
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = hands_det.process(rgb)

        right_vec = EMPTY_HAND.copy()
        left_vec  = EMPTY_HAND.copy()

        if result.multi_hand_landmarks and result.multi_handedness:
            for lm_obj, hand_info in zip(
                result.multi_hand_landmarks,
                result.multi_handedness
            ):
                label = hand_info.classification[0].label  # "Left" or "Right"
                xyz   = np.array([[p.x, p.y, p.z] for p in lm_obj.landmark],
                                  dtype=np.float32)
                normed = normalize_hand(xyz)
                if label == "Right":
                    right_vec = normed
                else:
                    left_vec = normed

        feature = np.concatenate([right_vec, left_vec])   # (126,)
        samples.append(feature)

    return samples


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    all_X, all_y = [], []
    label_to_idx = {lbl: i for i, lbl in enumerate(LABELS)}

    print("Extracting landmarks for alphabets A-Z …")
    for label_str in LABELS:
        print(f"\nClass {label_str}:")
        samples = extract_from_folder(label_str)
        all_X.extend(samples)
        all_y.extend([label_to_idx[label_str]] * len(samples))

    X = np.array(all_X, dtype=np.float32)
    y = np.array(all_y, dtype=np.int32)

    print(f"\nTotal samples : {len(X)}")
    print(f"Feature shape : {X.shape[1]}")   # should be 126

    np.savez_compressed(OUTPUT_FILE, X=X, y=y, labels=np.array(LABELS))
    print(f"\nSaved → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
"""
preprocess_numbers.py
=====================
Extracts MediaPipe hand landmarks from images in data/isl/numbers/1–9.
Right-hand only. Saves landmark arrays + labels to data/numbers_landmarks.npz.

Each sample = 21 landmarks × 3 coords (x, y, z) = 63 features.
We also normalise: subtract wrist (landmark 0) so the hand is position-invariant,
then divide by the max spread so it is scale-invariant.
"""

import os
import cv2
import numpy as np
import mediapipe as mp
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIG — adjust paths if needed
# ─────────────────────────────────────────────
DATA_ROOT   = Path("data/isl/numbers")   # subfolders: 1, 2, …, 9
OUTPUT_FILE = Path("data/numbers_landmarks.npz")
LABELS      = [str(i) for i in range(1, 10)]   # "1" … "9"
# ─────────────────────────────────────────────

mp_hands  = mp.solutions.hands
hands_det = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5,
)


def normalize_landmarks(landmarks_xyz: np.ndarray) -> np.ndarray:
    """
    landmarks_xyz: (21, 3)
    1. Translate so wrist (index 0) is at origin.
    2. Scale so the max L2 distance from wrist = 1.
    Returns flattened (63,) array.
    """
    lm = landmarks_xyz.copy()
    lm -= lm[0]                         # translate
    scale = np.max(np.linalg.norm(lm, axis=1)) + 1e-6
    lm /= scale                         # scale
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

        if result.multi_hand_landmarks:
            lm = result.multi_hand_landmarks[0].landmark
            xyz = np.array([[p.x, p.y, p.z] for p in lm], dtype=np.float32)  # (21,3)
            samples.append(normalize_landmarks(xyz))

    return samples


def main():
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    all_X, all_y = [], []

    print("Extracting landmarks for numbers 1-9 …")
    for label_str in LABELS:
        print(f"\nClass {label_str}:")
        samples = extract_from_folder(label_str)
        all_X.extend(samples)
        all_y.extend([int(label_str)] * len(samples))

    X = np.array(all_X, dtype=np.float32)
    y = np.array(all_y, dtype=np.int32)

    print(f"\nTotal samples : {len(X)}")
    print(f"Feature shape : {X.shape[1]}")  # should be 63

    np.savez_compressed(OUTPUT_FILE, X=X, y=y, labels=np.array(LABELS))
    print(f"\nSaved → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
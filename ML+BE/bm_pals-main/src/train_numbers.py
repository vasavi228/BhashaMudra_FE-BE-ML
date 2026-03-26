"""
train_numbers.py
================
Trains a Dense Neural Network on the pre-extracted landmark features
for ISL numbers 1-9.

Input : data/numbers_landmarks.npz   (produced by preprocess_numbers.py)
Output: models/numbers_model.keras
        models/numbers_label_map.npy  (maps class index → label string)

Architecture choice:
  - Small MLP — landmark features are already high-level geometric info.
  - BatchNorm + Dropout for regularisation.
  - Softmax output — gives class probabilities we use as confidence.
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from pathlib import Path
import matplotlib.pyplot as plt

# ─────────────────────────────────────────────
DATA_FILE   = Path("data/numbers_landmarks.npz")
MODEL_DIR   = Path("models")
MODEL_PATH  = MODEL_DIR / "numbers_model.h5"
LABEL_PATH  = MODEL_DIR / "numbers_label_map.npy"

EPOCHS      = 80
BATCH_SIZE  = 32
LR          = 1e-3
# ─────────────────────────────────────────────


def build_model(input_dim: int, num_classes: int) -> keras.Model:
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),

        layers.Dense(256),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Dropout(0.3),

        layers.Dense(128),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Dropout(0.2),

        layers.Dense(64),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Dropout(0.1),

        layers.Dense(num_classes, activation="softmax"),
    ], name="numbers_model")
    return model


def plot_history(history, save_path: Path):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    axes[0].plot(history.history["loss"],     label="train")
    axes[0].plot(history.history["val_loss"], label="val")
    axes[0].set_title("Loss"); axes[0].legend()

    axes[1].plot(history.history["accuracy"],     label="train")
    axes[1].plot(history.history["val_accuracy"], label="val")
    axes[1].set_title("Accuracy"); axes[1].legend()

    plt.tight_layout()
    plt.savefig(save_path)
    print(f"Training plot saved → {save_path}")
    plt.close()


def main():
    # ── Load data ──────────────────────────────────────────────────────────
    data = np.load(DATA_FILE)
    X, y_raw = data["X"], data["y"]
    labels   = data["labels"]          # e.g. ["1","2",…,"9"]

    print(f"Loaded {len(X)} samples, {X.shape[1]} features, {len(labels)} classes")

    # ── Encode labels ──────────────────────────────────────────────────────
    le = LabelEncoder()
    le.fit(y_raw)
    y = le.transform(y_raw)
    num_classes = len(le.classes_)

    y_cat = keras.utils.to_categorical(y, num_classes)

    # ── Split ──────────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_cat, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train, y_train, test_size=0.15, random_state=42
    )
    print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    # ── Build & compile ────────────────────────────────────────────────────
    model = build_model(X.shape[1], num_classes)
    model.summary()

    model.compile(
        optimizer=keras.optimizers.Adam(LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    # ── Callbacks ──────────────────────────────────────────────────────────
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy", patience=15, restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=0.5, patience=7, min_lr=1e-5
        ),
    ]

    # ── Train ──────────────────────────────────────────────────────────────
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    # ── Evaluate ───────────────────────────────────────────────────────────
    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"\nTest  →  Loss: {loss:.4f}  |  Accuracy: {acc*100:.2f}%")

    # ── Save ───────────────────────────────────────────────────────────────
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_PATH)
    np.save(LABEL_PATH, labels)    # original string labels ["1" … "9"]
    print(f"Model saved  → {MODEL_PATH}")
    print(f"Label map    → {LABEL_PATH}")

    plot_history(history, MODEL_DIR / "numbers_training.png")


if __name__ == "__main__":
    main()
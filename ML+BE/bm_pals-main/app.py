from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import base64
import tensorflow as tf
from collections import deque, Counter
from pathlib import Path

app = Flask(__name__)
CORS(app)

# ── Load models ──────────────────────────────────────────────
# Fix path to always find models relative to app.py location
import os
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

num_model, num_labels   = None, None
alph_model, alph_labels = None, None

try:
    num_model  = tf.keras.models.load_model(os.path.join(MODELS_DIR, "numbers_model.h5"))
    num_labels = np.load(os.path.join(MODELS_DIR, "numbers_label_map.npy"), allow_pickle=True)
    print("[OK] Numbers model loaded")
except Exception as e:
    print(f"[WARN] Numbers model not loaded: {e}")

try:
    alph_model  = tf.keras.models.load_model(os.path.join(MODELS_DIR, "alphabets_model.h5"))
    alph_labels = np.load(os.path.join(MODELS_DIR, "alphabets_label_map.npy"), allow_pickle=True)
    print("[OK] Alphabets model loaded")
except Exception as e:
    print(f"[WARN] Alphabets model not loaded: {e}")

# ── MediaPipe ────────────────────────────────────────────────
import mediapipe as mp
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.65
)

EMPTY_HAND = np.zeros(63, dtype=np.float32)

def normalize_hand(lm_obj):
    xyz = np.array([[p.x, p.y, p.z] for p in lm_obj.landmark], dtype=np.float32)
    xyz -= xyz[0]
    scale = np.max(np.linalg.norm(xyz, axis=1)) + 1e-6
    xyz /= scale
    return xyz.flatten()

def decode_image(b64_string):
    img_data = b64_string.split(',')[1] if ',' in b64_string else b64_string
    img_bytes = base64.b64decode(img_data)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    return cv2.imdecode(img_array, cv2.IMREAD_COLOR)

# ── Routes ───────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'numbers_model': num_model is not None,
        'alphabets_model': alph_model is not None
    })

@app.route('/api/detect/number', methods=['POST'])
def detect_number():
    if num_model is None:
        return jsonify({'error': 'Numbers model not loaded'}), 500

    try:
        frame = decode_image(request.json['image'])
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if not result.multi_hand_landmarks:
            return jsonify({'detected': False, 'label': None, 'confidence': 0})

        # Find right hand
        right_lm = None
        if result.multi_handedness:
            for lm_obj, hand_info in zip(result.multi_hand_landmarks, result.multi_handedness):
                if hand_info.classification[0].label == "Right":
                    right_lm = lm_obj
                    break

        if right_lm is None:
            return jsonify({'detected': False, 'label': None, 'confidence': 0,
                            'message': 'Show your right hand'})

        feat  = normalize_hand(right_lm).reshape(1, -1)
        probs = num_model.predict(feat, verbose=0)[0]
        idx   = int(np.argmax(probs))
        label = str(num_labels[idx])
        conf  = float(probs[idx])

        return jsonify({
            'detected': True,
            'label': label,
            'confidence': round(conf, 2),
            'correct': conf >= 0.80
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/detect/alphabet', methods=['POST'])
def detect_alphabet():
    if alph_model is None:
        return jsonify({'error': 'Alphabets model not loaded'}), 500

    try:
        frame = decode_image(request.json['image'])
        rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb)

        if not result.multi_hand_landmarks:
            return jsonify({'detected': False, 'label': None, 'confidence': 0})

        right_lm = left_lm = None
        if result.multi_handedness:
            for lm_obj, hand_info in zip(result.multi_hand_landmarks, result.multi_handedness):
                label = hand_info.classification[0].label
                if label == "Right":
                    right_lm = lm_obj
                else:
                    left_lm = lm_obj

        if right_lm is None and left_lm is None:
            return jsonify({'detected': False, 'label': None, 'confidence': 0})

        r_vec = normalize_hand(right_lm) if right_lm else EMPTY_HAND
        l_vec = normalize_hand(left_lm)  if left_lm  else EMPTY_HAND
        feat  = np.concatenate([r_vec, l_vec]).reshape(1, -1)

        probs = alph_model.predict(feat, verbose=0)[0]
        idx   = int(np.argmax(probs))
        label = str(alph_labels[idx])
        conf  = float(probs[idx])

        return jsonify({
            'detected': True,
            'label': label,
            'confidence': round(conf, 2),
            'correct': conf >= 0.80
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
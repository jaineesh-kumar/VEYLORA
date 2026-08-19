"""
CryptML Prediction Engine v2
Hybrid classifier: Rule-based structural analysis + ML statistical classification.

Usage: python predict.py "<hex_data>"
    - Accepts both space-separated hex (A4 23 69) and continuous hex (a42369)
    - Outputs JSON with top predictions, confidence scores, and analysis metadata

This script is called by MLService.java via ProcessBuilder.
All errors go to stderr; only the JSON result goes to stdout.
"""

import sys
import os
import json
import pickle
import re
import numpy as np
from scipy.stats import entropy, chisquare


# ──────────────────────────────────────────────────
#  Input Normalization
# ──────────────────────────────────────────────────

import base64

def normalize_hex_input(raw_input: str) -> bytes:
    """
    Accept hex, base64, or raw binary.
    Returns raw bytes.
    """
    cleaned = re.sub(r'\s+', '', raw_input.strip())
    if len(cleaned) == 0:
        raise ValueError("Empty input")
        
    # Try Hex
    if re.match(r'^[0-9a-fA-F]+$', cleaned) and len(cleaned) % 2 == 0:
        return bytes.fromhex(cleaned)
        
    # Try Base64
    try:
        if re.match(r'^[A-Za-z0-9+/]+={0,2}$', cleaned) and len(cleaned) % 4 == 0:
            return base64.b64decode(cleaned)
    except:
        pass
        
    # Fallback: assume raw binary string
    try:
        return raw_input.encode('latin1')
    except:
        return raw_input.encode('utf-8', errors='ignore')


# ──────────────────────────────────────────────────
#  Feature Extraction (25 features)
# ──────────────────────────────────────────────────

FEATURE_NAMES = [
    'length', 'entropy', 'mean', 'std', 'median',
    'chi2_stat', 'chi2_p_value',
    'unique_bytes', 'unique_ratio',
    'max_freq', 'min_freq', 'freq_range', 'freq_std',
    'mod_8', 'mod_16', 'is_mod_8', 'is_mod_16',
    'first_byte', 'starts_with_0x30', 'is_der',
    'autocorr_1', 'autocorr_2', 'autocorr_8',
    'bit_entropy', 'nibble_chi2', 'rep_8', 'rep_16'
]


def extract_features(data: bytes) -> dict:
    """Extract 25 statistical features from raw bytes."""
    length = len(data)
    if length == 0:
        return {k: 0 for k in FEATURE_NAMES}

    data_int = np.array(list(data), dtype=np.uint8)

    mean_val = float(np.mean(data_int))
    std_val = float(np.std(data_int))
    median_val = float(np.median(data_int))

    freq = [data.count(i) for i in range(256)]
    prob = [f / length for f in freq]
    ent = entropy(prob, base=2)

    expected = [length / 256.0] * 256
    chi2_stat, chi2_p = chisquare(freq, expected)

    unique_bytes = len(set(data))
    unique_ratio = unique_bytes / 256.0

    max_freq = max(freq)
    min_freq = min(freq)
    freq_range = max_freq - min_freq
    freq_std = float(np.std(freq))

    mod_8 = length % 8
    mod_16 = length % 16
    is_mod_8 = 1 if mod_8 == 0 else 0
    is_mod_16 = 1 if mod_16 == 0 else 0

    first_byte = data[0]
    starts_with_0x30 = 1 if first_byte == 0x30 else 0

    is_der = 0
    if first_byte == 0x30 and length > 2:
        if data[1] < 0x80:
            is_der = 1 if data[1] == length - 2 else 0
        elif data[1] == 0x81 and length > 3:
            is_der = 1 if data[2] == length - 3 else 0
        elif data[1] == 0x82 and length > 4:
            is_der = 1 if (data[2] << 8 | data[3]) == length - 4 else 0

    autocorr_1 = autocorr_2 = autocorr_8 = 0.0
    if length > 8:
        try:
            autocorr_1 = float(np.corrcoef(data_int[:-1], data_int[1:])[0, 1])
            if np.isnan(autocorr_1): autocorr_1 = 0.0
        except: autocorr_1 = 0.0
        try:
            autocorr_2 = float(np.corrcoef(data_int[:-2], data_int[2:])[0, 1])
            if np.isnan(autocorr_2): autocorr_2 = 0.0
        except: autocorr_2 = 0.0
        try:
            autocorr_8 = float(np.corrcoef(data_int[:-8], data_int[8:])[0, 1])
            if np.isnan(autocorr_8): autocorr_8 = 0.0
        except: autocorr_8 = 0.0

    bit_counts = [0] * 8
    for byte_val in data:
        for bit_pos in range(8):
            bit_counts[bit_pos] += (byte_val >> bit_pos) & 1
    bit_probs = [c / length for c in bit_counts]
    bit_entropy = -sum(
        p * np.log2(p) + (1 - p) * np.log2(1 - p)
        for p in bit_probs if 0 < p < 1
    ) / 8

    nibble_freq = [0] * 16
    for b in data:
        nibble_freq[b >> 4] += 1
        nibble_freq[b & 0x0F] += 1
    nibble_expected = [length * 2 / 16] * 16
    nibble_chi2, _ = chisquare(nibble_freq, nibble_expected)

    # Block repetition detection
    rep_8 = 0
    rep_16 = 0
    if length >= 16:
        blocks_8 = [data[i:i+8] for i in range(0, length - length % 8, 8)]
        if len(blocks_8) > 1:
            rep_8 = len(blocks_8) - len(set(blocks_8))
            
    if length >= 32:
        blocks_16 = [data[i:i+16] for i in range(0, length - length % 16, 16)]
        if len(blocks_16) > 1:
            rep_16 = len(blocks_16) - len(set(blocks_16))

    return {
        'length': length,
        'entropy': round(ent, 6),
        'mean': round(mean_val, 4),
        'std': round(std_val, 4),
        'median': round(median_val, 4),
        'chi2_stat': round(chi2_stat, 4),
        'chi2_p_value': round(chi2_p, 6),
        'unique_bytes': unique_bytes,
        'unique_ratio': round(unique_ratio, 4),
        'max_freq': max_freq,
        'min_freq': min_freq,
        'freq_range': freq_range,
        'freq_std': round(freq_std, 4),
        'mod_8': mod_8,
        'mod_16': mod_16,
        'is_mod_8': is_mod_8,
        'is_mod_16': is_mod_16,
        'first_byte': first_byte,
        'starts_with_0x30': starts_with_0x30,
        'is_der': is_der,
        'autocorr_1': round(autocorr_1, 6),
        'autocorr_2': round(autocorr_2, 6),
        'autocorr_8': round(autocorr_8, 6),
        'bit_entropy': round(bit_entropy, 6),
        'nibble_chi2': round(nibble_chi2, 4),
        'rep_8': rep_8,
        'rep_16': rep_16,
    }


# ──────────────────────────────────────────────────
#  Layer 2: Rule-Based Deterministic Classification
# ──────────────────────────────────────────────────

import math  # Module-level import for entropy threshold calculations


def rule_based_classify(data: bytes, features: dict) -> list:
    """
    Deterministic classification based on structural properties.
    Returns list of (algorithm, confidence, method) tuples.
    Returns empty list if no rule matches (fallback to ML).
    """
    length = features['length']
    is_mod_8 = features['is_mod_8']
    is_mod_16 = features['is_mod_16']
    mod_8 = features['mod_8']
    mod_16 = features['mod_16']
    starts_with_0x30 = features['starts_with_0x30']
    is_der = features['is_der']
    ent = features['entropy']
    rep_8 = features.get('rep_8', 0)
    rep_16 = features.get('rep_16', 0)
    
    # ─── Adaptive entropy threshold ───
    high_entropy = False
    if length > 0:
        high_entropy = ent > min(7.0, 3.0 if length <= 32 else math.log2(max(length, 2)) - 1.0)

    predictions = []
    
    # ─── Block Repetition (ECB Mode) ───
    if rep_16 > 0 and mod_16 == 0:
        unique_16 = (length // 16) - rep_16
        unique_8 = (length // 8) - rep_8 if rep_8 > 0 else (length // 8)
        if unique_8 == unique_16:
            return [('DES/3DES-ECB', 0.99, 'rule_ecb_repetition')]
        else:
            return [('AES-ECB', 0.99, 'rule_ecb_repetition')]
    if rep_8 > 0 and mod_8 == 0:
        return [('DES/3DES-ECB', 0.99, 'rule_ecb_repetition')]

    # ─── Very small inputs (< 16 bytes) ───
    if length < 16:
        return []

    # ─── ECDH Uncompressed Public Key ───
    if length == 65 and data and data[0] == 0x04:
        return [('ECDH', 0.90, 'rule_ecdh_uncompressed')]

    # ─── Hash functions & Block overlaps (fixed-length outputs) ───
    if length == 16 and high_entropy:
        return [
            ('MD5', 0.86, 'rule_hash_16'),
            ('AES', 0.60, 'rule_hash_16'),
        ]
    
    if length == 20 and high_entropy:
        return [('SHA-1', 0.86, 'rule_hash_20')]
        
    if length == 32 and high_entropy:
        return [
            ('SHA-256', 0.86, 'rule_hash_32'),
            ('SHA3-256', 0.86, 'rule_hash_32'),
            ('ChaCha20', 0.40, 'rule_hash_32'),
        ]

    # ─── DER-encoded signatures (DSA / ECDSA) ───
    if starts_with_0x30 and is_der and length < 200:
        if length <= 73:
            return [
                ('ECDSA', 0.70, 'rule_der_small'),
                ('DSA', 0.30, 'rule_der_small'),
            ]
        else:
            return [
                ('DSA', 0.70, 'rule_der_large'),
                ('ECDSA', 0.30, 'rule_der_large'),
            ]

    if not high_entropy:
        pass

    # ─── RSA (fixed-length output) ───
    if length == 128 and ent > 6.0:
        return [
            ('RSA', 0.50, 'rule_rsa_1024'),
            ('AES', 0.25, 'rule_rsa_1024_alt'),
            ('Diffie-Hellman', 0.25, 'rule_rsa_1024_alt'),
        ]

    if length == 256 and ent > 7.0:
        return [
            ('RSA', 0.80, 'rule_rsa_2048'),
            ('AES', 0.20, 'rule_rsa_2048_alt'),
        ]

    if length == 512 and ent > 7.0:
        return [('RSA', 0.90, 'rule_rsa_4096')]

    # ─── Block ciphers & Stream overlaps (block alignment + high entropy) ───
    if length > 16 and high_entropy:
        if is_mod_16:
            return [
                ('AES', 0.65, 'rule_block_16_ambiguous'),
                ('ChaCha20', 0.40, 'rule_block_16_ambiguous'),
                ('Diffie-Hellman', 0.40, 'rule_block_16_ambiguous'),
            ]
        elif is_mod_8:
            return [
                ('DES', 0.65, 'rule_block_8_ambiguous'),
                ('3DES', 0.65, 'rule_block_8_ambiguous'),
                ('Blowfish', 0.65, 'rule_block_8_ambiguous'),
            ]

    return predictions



# ──────────────────────────────────────────────────
#  Hybrid Classifier
# ──────────────────────────────────────────────────

def classify(data: bytes, model_data: dict = None) -> dict:
    """
    3-layer hybrid classification:
    1. Extract features
    2. Try rule-based classification first
    3. If rules give high confidence, use those; otherwise enhance with ML
    """
    features = extract_features(data)

    # Layer 2: Rule-based
    rule_predictions = rule_based_classify(data, features)

    method = 'rule_based'
    family = 'Unknown'
    predictions = []
    
    is_ambiguous = False
    if features['length'] <= 16:
        is_ambiguous = True

    if rule_predictions:
        top_algo = rule_predictions[0][0]
        top_conf = rule_predictions[0][1]

        # If rule-based is highly confident, use it directly
        if top_conf >= 0.80:
            method = rule_predictions[0][2]
            predictions = rule_predictions
        else:
            # Medium confidence from rules — try to refine with ML
            if model_data:
                ml_predictions = ml_classify(features, model_data)

                # Merge: give 60% weight to rules, 40% to ML
                merged = merge_predictions(rule_predictions, ml_predictions, rule_weight=0.6)
                predictions = merged
                method = 'hybrid'
            else:
                predictions = rule_predictions
    else:
        # No rule matched — rely entirely on ML
        if model_data:
            predictions = ml_classify(features, model_data)
            method = 'ml_only'
        else:
            predictions = [('Unknown', 0.0, 'no_match')]

    # Filter impossible hashes
    HASH_LENGTHS = {'MD5': 16, 'SHA-1': 20, 'SHA-256': 32, 'SHA3-256': 32}
    filtered_preds = []
    for algo, conf, meth in predictions:
        if algo in HASH_LENGTHS and features['length'] != HASH_LENGTHS[algo]:
            continue # physically impossible hash length
        filtered_preds.append((algo, conf, meth))
        
    if not filtered_preds:
        is_ambiguous = True
        filtered_preds = [('Unknown', 0.3, 'filtered_impossible')]
        
    predictions = filtered_preds
    
    # Recalibrate confidence if ambiguous
    # If it's perfectly indistinguishable, rule-based output maxes at 0.40-0.50.
    # The hybrid merged confidence will usually be around 0.50 - 0.70.
    # If the top confidence is below 0.65, we consider it ambiguous.
    if predictions and predictions[0][1] < 0.65:
        is_ambiguous = True

    if is_ambiguous:
        # Scale down confidences to be between 20-60%
        calibrated = []
        for algo, conf, meth in predictions:
            # map conf to max 0.6
            new_conf = min(0.60, 0.2 + (conf * 0.4))
            calibrated.append((algo, round(new_conf, 4), meth))
        predictions = calibrated

    # Determine algorithm family
    if predictions:
        family = get_algorithm_family(predictions[0][0])
        
    insights = []
    if predictions and 'ECB' in predictions[0][0]:
        insights.append("ECB mode detected \u2014 this mode leaks plaintext structure via repeated ciphertext blocks and is not recommended for production use.")
    
    if is_ambiguous:
        insights.append("Input is statistically indistinguishable or too short. Results are ambiguous.")

    # Build analysis metadata
    analysis = {
        'length': features['length'],
        'entropy': features['entropy'],
        'mean': features['mean'],
        'std': features['std'],
        'block_aligned_8': bool(features['is_mod_8']),
        'block_aligned_16': bool(features['is_mod_16']),
        'is_der_encoded': bool(features['is_der']),
        'starts_with_0x30': bool(features['starts_with_0x30']),
        'chi2_p_value': features['chi2_p_value'],
        'classification_method': method,
        'is_ambiguous': is_ambiguous,
        'insights': insights
    }

    return {
        'top_predictions': [
            {'algorithm': algo, 'confidence': round(conf, 4)}
            for algo, conf, _ in predictions[:5]
        ],
        'family': family,
        'analysis': analysis,
    }


def merge_predictions(rule_preds: list, ml_preds: list, rule_weight: float = 0.6) -> list:
    """Merge rule-based and ML predictions with weighted scoring."""
    ml_weight = 1.0 - rule_weight
    scores = {}

    for algo, conf, method in rule_preds:
        scores[algo] = scores.get(algo, 0) + conf * rule_weight

    for algo, conf, method in ml_preds:
        scores[algo] = scores.get(algo, 0) + conf * ml_weight

    # Normalize
    total = sum(scores.values())
    if total > 0:
        scores = {k: v / total for k, v in scores.items()}

    sorted_preds = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [(algo, conf, 'hybrid') for algo, conf in sorted_preds]


def get_algorithm_family(algo_name: str) -> str:
    """Map algorithm name to its family/category."""
    families = {
        'AES': 'Symmetric Block Cipher',
        'AES-ECB': 'Symmetric Block Cipher',
        'AES-CBC': 'Symmetric Block Cipher',
        'AES-CTR': 'Symmetric Block Cipher',
        'DES': 'Symmetric Block Cipher',
        'DES-ECB': 'Symmetric Block Cipher',
        'DES/3DES-ECB': 'Symmetric Block Cipher',
        '3DES': 'Symmetric Block Cipher',
        '3DES-ECB': 'Symmetric Block Cipher',
        'Blowfish': 'Symmetric Block Cipher',
        'RC4': 'Stream Cipher',
        'ChaCha20': 'Stream Cipher',
        'RSA': 'Asymmetric Encryption',
        'DSA': 'Digital Signature',
        'ECDSA': 'Digital Signature',
        'Diffie-Hellman': 'Key Exchange',
        'ECDH': 'Key Exchange',
        'MD5': 'Hash Function',
        'SHA-1': 'Hash Function',
        'SHA-256': 'Hash Function',
        'SHA3-256': 'Hash Function',
    }
    return families.get(algo_name, 'Unknown')


# ──────────────────────────────────────────────────
#  Main Entry Point
# ──────────────────────────────────────────────────

def ml_classify(features: dict, model_data: dict) -> list:
    import numpy as np
    model = model_data['model']
    encoder = model_data['label_encoder']
    feature_names = model_data['feature_names']
    
    X = [features.get(k, 0) for k in feature_names]
    X_arr = np.array(X).reshape(1, -1)
    
    probas = model.predict_proba(X_arr)[0]
    
    # Fix: model.classes_ are already indices if it's scikit-learn, but wait, 
    # encoder.inverse_transform expects the encoded labels.
    # Actually, model.classes_ are the internal classes of the RF model.
    try:
        classes = encoder.inverse_transform(model.classes_)
    except:
        classes = model.classes_
        
    sorted_indices = np.argsort(probas)[::-1]
    
    predictions = []
    for idx in sorted_indices:
        algo = classes[idx]
        conf = float(probas[idx])
        if conf > 0.01:
            predictions.append((algo, conf, 'ml_classify'))
    
    return predictions

def merge_predictions(rule_preds: list, ml_preds: list, rule_weight: float = 0.6) -> list:
    scores = {}
    for algo, conf, _ in rule_preds:
        scores[algo] = scores.get(algo, 0.0) + conf * rule_weight
        
    for algo, conf, _ in ml_preds:
        scores[algo] = scores.get(algo, 0.0) + conf * (1.0 - rule_weight)
        
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [(algo, conf, 'hybrid') for algo, conf in sorted_scores]

if __name__ == '__main__':
    try:
        # Validate arguments
        if len(sys.argv) < 2:
            print("Error: No HEX input provided.", file=sys.stderr)
            sys.exit(1)

        raw_input = sys.argv[1]

        # Normalize input (handles both space-separated and continuous hex)
        data = normalize_hex_input(raw_input)

        # Load ML model (optional — works without it via rules only)
        model_data = None
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(script_dir, 'model.pickle')

        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    loaded = pickle.load(f)

                # Check if this is the new v2 format (dict with 'version' key)
                if isinstance(loaded, dict) and loaded.get('version') == 2:
                    model_data = loaded
                else:
                    # Old v1 model — skip ML, use rules only
                    print("Warning: Old model format detected. Using rule-based classification only.", file=sys.stderr)
            except Exception as e:
                print(f"Warning: Could not load model: {e}. Using rule-based classification only.", file=sys.stderr)

        # Classify
        result = classify(data, model_data)

        # Output JSON to stdout (this is what MLService.java reads)
        print(json.dumps(result))

    except ValueError as e:
        print(f"Input error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


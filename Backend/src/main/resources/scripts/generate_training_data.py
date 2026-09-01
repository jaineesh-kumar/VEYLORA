"""
Generate training data for the CryptML algorithm classifier.
Creates labeled samples for all 15 supported cryptographic algorithms
with realistic data sizes matching the SIH dataset (100-2000 bytes).

Each sample has 20+ statistical features extracted from the ciphertext.
Output: training_data.csv
"""

import os
import csv
import hashlib
import struct
import secrets
import numpy as np
from scipy.stats import entropy, chisquare

# ──────────────────────────────────────────────────
#  Feature Extraction (same as will be used in predict.py)
# ──────────────────────────────────────────────────

def extract_features(data: bytes) -> dict:
    """Extract 20+ statistical features from raw bytes."""
    length = len(data)
    if length == 0:
        return {k: 0 for k in get_feature_names()}

    data_int = np.array(list(data), dtype=np.uint8)

    # Basic stats
    mean_val = float(np.mean(data_int))
    std_val = float(np.std(data_int))
    median_val = float(np.median(data_int))
    
    # Byte frequency distribution
    freq = [data.count(i) for i in range(256)]
    prob = [f / length for f in freq]
    
    # Shannon entropy (bits per byte, max = 8.0)
    ent = entropy(prob, base=2)
    
    # Chi-square test against uniform distribution
    expected = [length / 256.0] * 256
    chi2_stat, chi2_p = chisquare(freq, expected)
    
    # Unique bytes
    unique_bytes = len(set(data))
    unique_ratio = unique_bytes / 256.0
    
    # Byte frequency stats
    max_freq = max(freq)
    min_freq = min(freq)
    freq_range = max_freq - min_freq
    freq_std = float(np.std(freq))
    
    # Block alignment
    mod_8 = length % 8
    mod_16 = length % 16
    is_mod_8 = 1 if mod_8 == 0 else 0
    is_mod_16 = 1 if mod_16 == 0 else 0
    
    # First byte analysis
    first_byte = data[0]
    starts_with_0x30 = 1 if first_byte == 0x30 else 0
    
    # DER/ASN.1 structure check
    is_der = 0
    if first_byte == 0x30 and length > 2:
        if data[1] < 0x80:
            is_der = 1 if data[1] == length - 2 else 0
        elif data[1] == 0x81 and length > 3:
            is_der = 1 if data[2] == length - 3 else 0
        elif data[1] == 0x82 and length > 4:
            is_der = 1 if (data[2] << 8 | data[3]) == length - 4 else 0
    
    # Autocorrelation at various lags
    autocorr_1 = 0.0
    autocorr_2 = 0.0
    autocorr_8 = 0.0
    if length > 8:
        autocorr_1 = float(np.corrcoef(data_int[:-1], data_int[1:])[0, 1]) if length > 1 else 0.0
        autocorr_2 = float(np.corrcoef(data_int[:-2], data_int[2:])[0, 1]) if length > 2 else 0.0
        autocorr_8 = float(np.corrcoef(data_int[:-8], data_int[8:])[0, 1]) if length > 8 else 0.0
        # Fix NaN
        if np.isnan(autocorr_1): autocorr_1 = 0.0
        if np.isnan(autocorr_2): autocorr_2 = 0.0
        if np.isnan(autocorr_8): autocorr_8 = 0.0
    
    # Bit-level entropy (analyze individual bit positions)
    bit_counts = [0] * 8
    for byte_val in data:
        for bit_pos in range(8):
            bit_counts[bit_pos] += (byte_val >> bit_pos) & 1
    bit_probs = [c / length for c in bit_counts]
    bit_entropy = -sum(
        p * np.log2(p) + (1-p) * np.log2(1-p)
        for p in bit_probs if 0 < p < 1
    ) / 8  # Average per-bit entropy

    # Nibble (half-byte) distribution uniformity
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


def get_feature_names():
    return [
        'length', 'entropy', 'mean', 'std', 'median',
        'chi2_stat', 'chi2_p_value',
        'unique_bytes', 'unique_ratio',
        'max_freq', 'min_freq', 'freq_range', 'freq_std',
        'mod_8', 'mod_16', 'is_mod_8', 'is_mod_16',
        'first_byte', 'starts_with_0x30', 'is_der',
        'autocorr_1', 'autocorr_2', 'autocorr_8',
        'bit_entropy', 'nibble_chi2', 'rep_8', 'rep_16'
    ]


# ──────────────────────────────────────────────────
#  Crypto Generators (pure Python, no Java needed)
# ──────────────────────────────────────────────────

def pkcs7_pad(data: bytes, block_size: int) -> bytes:
    pad_len = block_size - (len(data) % block_size)
    return data + bytes([pad_len] * pad_len)


def xor_bytes(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))


# --- Try importing crypto libraries ---
try:
    from Crypto.Cipher import AES as _AES, DES as _DES, DES3 as _DES3, Blowfish as _BF, ARC4 as _RC4, ChaCha20 as _ChaCha20, PKCS1_OAEP
    from Crypto.PublicKey import RSA as _RSA, DSA as _DSA, ECC as _ECC
    from Crypto.Signature import DSS as _DSS
    from Crypto.Hash import SHA256 as _SHA256
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

if not HAS_CRYPTO:
    try:
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.primitives import padding, hashes, serialization
        from cryptography.hazmat.primitives.asymmetric import rsa, dsa, ec, padding as asym_padding, utils
        from cryptography.hazmat.backends import default_backend
        HAS_CRYPTOGRAPHY = True
    except ImportError:
        HAS_CRYPTOGRAPHY = False
else:
    HAS_CRYPTOGRAPHY = False


def gen_aes_cbc(plaintext_size: int) -> bytes:
    """AES (mix of CBC, ECB, CTR)"""
    mode_choice = secrets.randbelow(3)
    key = secrets.token_bytes(32)
    
    if mode_choice == 0:
        # CBC Random
        iv = secrets.token_bytes(16)
        plaintext = secrets.token_bytes(plaintext_size)
        
        if HAS_CRYPTO:
            cipher = _AES.new(key, _AES.MODE_CBC, iv)
            padded = pkcs7_pad(plaintext, 16)
            ciphertext = cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(128).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(padded) + encryptor.finalize()
        else:
            padded = pkcs7_pad(plaintext, 16)
            ciphertext = secrets.token_bytes(len(padded))
        
        return iv + ciphertext
    elif mode_choice == 1:
        # ECB with repeating blocks
        base_block = secrets.token_bytes(16)
        plaintext = base_block * (plaintext_size // 16)
        if len(plaintext) < plaintext_size:
            plaintext += base_block[:plaintext_size - len(plaintext)]
        
        if HAS_CRYPTO:
            cipher = _AES.new(key, _AES.MODE_ECB)
            padded = pkcs7_pad(plaintext, 16)
            return cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(128).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
            encryptor = cipher.encryptor()
            return encryptor.update(padded) + encryptor.finalize()
        else:
            return secrets.token_bytes(plaintext_size + (16 - plaintext_size % 16))
    else:
        # CTR
        nonce = secrets.token_bytes(8)
        plaintext = secrets.token_bytes(plaintext_size)
        if HAS_CRYPTO:
            cipher = _AES.new(key, _AES.MODE_CTR, nonce=nonce)
            return nonce + cipher.encrypt(plaintext)
        elif HAS_CRYPTOGRAPHY:
            cipher = Cipher(algorithms.AES(key), modes.CTR(nonce + b'\x00'*8), backend=default_backend())
            encryptor = cipher.encryptor()
            return nonce + encryptor.update(plaintext) + encryptor.finalize()
        else:
            return nonce + secrets.token_bytes(plaintext_size)


def gen_des_cbc(plaintext_size: int) -> bytes:
    """DES (mix of CBC and ECB)"""
    mode_choice = secrets.randbelow(2)
    key = secrets.token_bytes(8)
    
    if mode_choice == 0:
        iv = secrets.token_bytes(8)
        plaintext = secrets.token_bytes(plaintext_size)
        
        if HAS_CRYPTO:
            cipher = _DES.new(key, _DES.MODE_CBC, iv)
            padded = pkcs7_pad(plaintext, 8)
            ciphertext = cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(64).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.TripleDES(key + key + key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(padded) + encryptor.finalize()
        else:
            padded = pkcs7_pad(plaintext, 8)
            ciphertext = secrets.token_bytes(len(padded))
        
        return iv + ciphertext
    else:
        # ECB repeating
        base_block = secrets.token_bytes(8)
        plaintext = base_block * (plaintext_size // 8)
        if len(plaintext) < plaintext_size:
            plaintext += base_block[:plaintext_size - len(plaintext)]
        
        if HAS_CRYPTO:
            cipher = _DES.new(key, _DES.MODE_ECB)
            padded = pkcs7_pad(plaintext, 8)
            return cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(64).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.TripleDES(key + key + key), modes.ECB(), backend=default_backend())
            encryptor = cipher.encryptor()
            return encryptor.update(padded) + encryptor.finalize()
        else:
            return secrets.token_bytes(plaintext_size + (8 - plaintext_size % 8))


def gen_3des_cbc(plaintext_size: int) -> bytes:
    """3DES (mix of CBC and ECB)"""
    mode_choice = secrets.randbelow(2)
    key = secrets.token_bytes(24)
    
    if mode_choice == 0:
        iv = secrets.token_bytes(8)
        plaintext = secrets.token_bytes(plaintext_size)
        
        if HAS_CRYPTO:
            while True:
                try:
                    cipher = _DES3.new(key, _DES3.MODE_CBC, iv)
                    break
                except ValueError:
                    key = secrets.token_bytes(24)
            padded = pkcs7_pad(plaintext, 8)
            ciphertext = cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(64).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.TripleDES(key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            ciphertext = encryptor.update(padded) + encryptor.finalize()
        else:
            padded = pkcs7_pad(plaintext, 8)
            ciphertext = secrets.token_bytes(len(padded))
        
        return iv + ciphertext
    else:
        # ECB repeating
        base_block = secrets.token_bytes(8)
        plaintext = base_block * (plaintext_size // 8)
        if len(plaintext) < plaintext_size:
            plaintext += base_block[:plaintext_size - len(plaintext)]
        
        if HAS_CRYPTO:
            while True:
                try:
                    cipher = _DES3.new(key, _DES3.MODE_ECB)
                    break
                except ValueError:
                    key = secrets.token_bytes(24)
            padded = pkcs7_pad(plaintext, 8)
            return cipher.encrypt(padded)
        elif HAS_CRYPTOGRAPHY:
            padder = padding.PKCS7(64).padder()
            padded = padder.update(plaintext) + padder.finalize()
            cipher = Cipher(algorithms.TripleDES(key), modes.ECB(), backend=default_backend())
            encryptor = cipher.encryptor()
            return encryptor.update(padded) + encryptor.finalize()
        else:
            return secrets.token_bytes(plaintext_size + (8 - plaintext_size % 8))


def gen_blowfish_cbc(plaintext_size: int) -> bytes:
    """Blowfish-CBC: IV (8 bytes) + ciphertext (padded to 8-byte blocks)"""
    key = secrets.token_bytes(16)
    iv = secrets.token_bytes(8)
    plaintext = secrets.token_bytes(plaintext_size)
    
    if HAS_CRYPTO:
        cipher = _BF.new(key, _BF.MODE_CBC, iv)
        padded = pkcs7_pad(plaintext, 8)
        ciphertext = cipher.encrypt(padded)
    elif HAS_CRYPTOGRAPHY:
        padder = padding.PKCS7(64).padder()
        padded = padder.update(plaintext) + padder.finalize()
        cipher = Cipher(algorithms.Blowfish(key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(padded) + encryptor.finalize()
    else:
        padded = pkcs7_pad(plaintext, 8)
        ciphertext = secrets.token_bytes(len(padded))
    
    return iv + ciphertext


def gen_rc4(plaintext_size: int) -> bytes:
    """RC4: ciphertext only (same length as plaintext, no padding/IV)"""
    key = secrets.token_bytes(16)
    plaintext = secrets.token_bytes(plaintext_size)
    
    if HAS_CRYPTO:
        cipher = _RC4.new(key)
        return cipher.encrypt(plaintext)
    else:
        return secrets.token_bytes(plaintext_size)


def gen_chacha20(plaintext_size: int) -> bytes:
    """ChaCha20: ciphertext only (same length as plaintext)"""
    key = secrets.token_bytes(32)
    nonce = secrets.token_bytes(12)
    plaintext = secrets.token_bytes(plaintext_size)
    
    if HAS_CRYPTO:
        cipher = _ChaCha20.new(key=key, nonce=nonce)
        return cipher.encrypt(plaintext)
    elif HAS_CRYPTOGRAPHY:
        cipher = Cipher(algorithms.ChaCha20(key, nonce + b'\x01\x00\x00\x00'), mode=None, backend=default_backend())
        encryptor = cipher.encryptor()
        return encryptor.update(plaintext) + encryptor.finalize()
    else:
        return secrets.token_bytes(plaintext_size)


_rsa_key = None
def gen_rsa(plaintext_size: int = None) -> bytes:
    """RSA-2048 OAEP: always 256 bytes output"""
    global _rsa_key
    if HAS_CRYPTO:
        if _rsa_key is None:
            _rsa_key = _RSA.generate(2048)
        cipher = PKCS1_OAEP.new(_rsa_key)
        plaintext = secrets.token_bytes(min(plaintext_size or 100, 190))
        return cipher.encrypt(plaintext)
    elif HAS_CRYPTOGRAPHY:
        if _rsa_key is None:
            _rsa_key = rsa.generate_private_key(65537, 2048, default_backend())
        public_key = _rsa_key.public_key()
        plaintext = secrets.token_bytes(min(plaintext_size or 100, 190))
        return public_key.encrypt(
            plaintext,
            asym_padding.OAEP(
                mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
    else:
        return secrets.token_bytes(256)


_dsa_key = None
def gen_dsa_signature(data_size: int = None) -> bytes:
    """DSA signature: DER-encoded, starts with 0x30"""
    global _dsa_key
    if HAS_CRYPTO:
        if _dsa_key is None:
            _dsa_key = _DSA.generate(2048)
        h = _SHA256.new(secrets.token_bytes(data_size or 64))
        signer = _DSS.new(_dsa_key, 'fips-186-3')
        return signer.sign(h)
    elif HAS_CRYPTOGRAPHY:
        if _dsa_key is None:
            _dsa_key = dsa.generate_private_key(2048, default_backend())
        message = secrets.token_bytes(data_size or 64)
        return _dsa_key.sign(message, hashes.SHA256())
    else:
        r = secrets.token_bytes(32)
        s = secrets.token_bytes(32)
        if r[0] & 0x80: r = b'\x00' + r
        if s[0] & 0x80: s = b'\x00' + s
        r_der = b'\x02' + bytes([len(r)]) + r
        s_der = b'\x02' + bytes([len(s)]) + s
        inner = r_der + s_der
        return b'\x30' + bytes([len(inner)]) + inner


_ecdsa_key = None
def gen_ecdsa_signature(data_size: int = None) -> bytes:
    """ECDSA signature: DER-encoded, starts with 0x30, ~70-72 bytes for P-256"""
    global _ecdsa_key
    if HAS_CRYPTO:
        if _ecdsa_key is None:
            _ecdsa_key = _ECC.generate(curve='P-256')
        h = _SHA256.new(secrets.token_bytes(data_size or 64))
        signer = _DSS.new(_ecdsa_key, 'fips-186-3')
        return signer.sign(h)
    elif HAS_CRYPTOGRAPHY:
        if _ecdsa_key is None:
            _ecdsa_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
        message = secrets.token_bytes(data_size or 64)
        return _ecdsa_key.sign(message, ec.ECDSA(hashes.SHA256()))
    else:
        r = secrets.token_bytes(32)
        s = secrets.token_bytes(32)
        if r[0] & 0x80: r = b'\x00' + r
        if s[0] & 0x80: s = b'\x00' + s
        r_der = b'\x02' + bytes([len(r)]) + r
        s_der = b'\x02' + bytes([len(s)]) + s
        inner = r_der + s_der
        return b'\x30' + bytes([len(inner)]) + inner


def gen_dh_key(size: int = None) -> bytes:
    """Diffie-Hellman derived key: 32 bytes"""
    return secrets.token_bytes(32)


def gen_ecdh_key(size: int = None) -> bytes:
    """ECDH derived key: 32 bytes"""
    return secrets.token_bytes(32)


def gen_md5(data_size: int = None) -> bytes:
    """MD5 hash: always 16 bytes"""
    data = secrets.token_bytes(data_size or 64)
    return hashlib.md5(data).digest()


def gen_sha1(data_size: int = None) -> bytes:
    """SHA-1 hash: always 20 bytes"""
    data = secrets.token_bytes(data_size or 64)
    return hashlib.sha1(data).digest()


def gen_sha256(data_size: int = None) -> bytes:
    """SHA-256 hash: always 32 bytes"""
    data = secrets.token_bytes(data_size or 64)
    return hashlib.sha256(data).digest()


def gen_sha3_256(data_size: int = None) -> bytes:
    """SHA3-256 hash: always 32 bytes"""
    data = secrets.token_bytes(data_size or 64)
    return hashlib.sha3_256(data).digest()


# ──────────────────────────────────────────────────
#  Dataset Generation
# ──────────────────────────────────────────────────

ALGORITHMS = {
    'AES': gen_aes_cbc,
    'DES': gen_des_cbc,
    '3DES': gen_3des_cbc,
    'Blowfish': gen_blowfish_cbc,
    'RC4': gen_rc4,
    'ChaCha20': gen_chacha20,
    'RSA': gen_rsa,
    'DSA': gen_dsa_signature,
    'ECDSA': gen_ecdsa_signature,
    'Diffie-Hellman': gen_dh_key,
    'ECDH': gen_ecdh_key,
    'MD5': gen_md5,
    'SHA-1': gen_sha1,
    'SHA-256': gen_sha256,
    'SHA3-256': gen_sha3_256,
}

PLAINTEXT_SIZES = list(range(100, 2001, 50))
SAMPLES_PER_SIZE = 50

FIXED_OUTPUT_ALGOS = {'MD5', 'SHA-1', 'SHA-256', 'SHA3-256', 'Diffie-Hellman', 'ECDH', 'RSA', 'DSA', 'ECDSA'}
SAMPLES_PER_FIXED_ALGO = 3000


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'training_data.csv')
    
    feature_names = get_feature_names()
    header = feature_names + ['algorithm']
    
    total_samples = 0
    
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=header)
        writer.writeheader()
        
        for algo_name, gen_func in ALGORITHMS.items():
            algo_samples = 0
            print(f"Generating samples for {algo_name}...")
            
            if algo_name in FIXED_OUTPUT_ALGOS:
                for i in range(SAMPLES_PER_FIXED_ALGO):
                    try:
                        data_size = secrets.randbelow(1900) + 100
                        ciphertext = gen_func(data_size)
                        features = extract_features(ciphertext)
                        features['algorithm'] = algo_name
                        writer.writerow(features)
                        algo_samples += 1
                    except Exception as e:
                        print(f"  Error generating {algo_name} sample: {e}")
                        continue
            else:
                for pt_size in PLAINTEXT_SIZES:
                    for _ in range(SAMPLES_PER_SIZE):
                        try:
                            ciphertext = gen_func(pt_size)
                            features = extract_features(ciphertext)
                            features['algorithm'] = algo_name
                            writer.writerow(features)
                            algo_samples += 1
                        except Exception as e:
                            print(f"  Error generating {algo_name} sample (size={pt_size}): {e}")
                            continue
            
            total_samples += algo_samples
            print(f"  Generated {algo_samples} samples for {algo_name}")
    
    print(f"\n{'='*60}")
    print(f"Total samples generated: {total_samples}")
    print(f"Output saved to: {output_path}")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()

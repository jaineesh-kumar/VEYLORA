package com.project.backend.Services;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.ChaCha20ParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.*;
import java.security.interfaces.ECPrivateKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.X509EncodedKeySpec;

@Service
public class EncryptionService {

    // Generate random plaintext (16 to 256 bytes)
    private byte[] generateRandomPlaintext() {
        SecureRandom random = new SecureRandom();
        int length = 16 + random.nextInt(241); // Random length between 16-256 bytes
        byte[] plaintext = new byte[length];
        random.nextBytes(plaintext);
        return plaintext;
    }

    // AES-256 Encryption (CBC Mode)
    public String aesEncrypt() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256);
        SecretKey secretKey = keyGen.generateKey();

        byte[] iv = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        byte[] plaintext = generateRandomPlaintext();
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(secretKey.getEncoded(), "AES"), ivSpec);

        byte[] ciphertext = cipher.doFinal(plaintext);

        byte[] encryptedData = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, encryptedData, 0, iv.length);
        System.arraycopy(ciphertext, 0, encryptedData, iv.length, ciphertext.length);

        return bytesToHex(encryptedData);
    }

    // **DES Encryption (CBC Mode)**
    public String desEncrypt() throws Exception {
        // Generate DES Key
        KeyGenerator keyGen = KeyGenerator.getInstance("DES");
        keyGen.init(56);  // DES uses a 56-bit key
        SecretKey secretKey = keyGen.generateKey();

        // Generate IV (8 bytes for DES)
        byte[] iv = new byte[8];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Generate random plaintext
        byte[] plaintext = generateRandomPlaintext();

        // Apply PKCS5 Padding (Equivalent to PKCS7 for DES)
        Cipher cipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

        // Encrypt
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Prepend IV for decryption
        byte[] encryptedData = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, encryptedData, 0, iv.length);
        System.arraycopy(ciphertext, 0, encryptedData, iv.length, ciphertext.length);

        return bytesToHex(encryptedData);
    }


    public String tripleDesEncrypt() throws Exception {
        // Generate a 24-byte (192-bit) Triple DES key
        KeyGenerator keyGen = KeyGenerator.getInstance("DESede");
        keyGen.init(168); // Triple DES uses a 168-bit key (but stored in 24 bytes)
        SecretKey secretKey = keyGen.generateKey();

        // Generate IV (8 bytes for 3DES)
        byte[] iv = new byte[8];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Generate random plaintext
        byte[] plaintext = generateRandomPlaintext();

        // Encrypt using Triple DES in CBC mode with PKCS5 Padding
        Cipher cipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

        byte[] ciphertext = cipher.doFinal(plaintext);

        // Prepend IV for decryption purposes
        byte[] encryptedData = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, encryptedData, 0, iv.length);
        System.arraycopy(ciphertext, 0, encryptedData, iv.length, ciphertext.length);

        return bytesToHex(encryptedData);
    }




    // Blowfish Encryption (CBC Mode, 128-bit Key)
    public String blowfishEncrypt() throws Exception {
        // Generate 128-bit Blowfish key
        KeyGenerator keyGen = KeyGenerator.getInstance("Blowfish");
        keyGen.init(128);
        SecretKey secretKey = keyGen.generateKey();

        // Generate IV (8 bytes for Blowfish)
        byte[] iv = new byte[8];
        SecureRandom random = new SecureRandom();
        random.nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Generate random plaintext
        byte[] plaintext = generateRandomPlaintext();

        // Apply PKCS5 Padding (Java uses PKCS5 for Blowfish, which is equivalent to PKCS7)
        Cipher cipher = Cipher.getInstance("Blowfish/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(secretKey.getEncoded(), "Blowfish"), ivSpec);

        // Encrypt the padded plaintext
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Prepend IV for decryption purposes
        byte[] encryptedData = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, encryptedData, 0, iv.length);
        System.arraycopy(ciphertext, 0, encryptedData, iv.length, ciphertext.length);

        // Return encrypted data in hexadecimal format
        return bytesToHex(encryptedData);
    }


    public String rc4Encrypt(String userInput) throws Exception {
        // Generate a 128-bit (16-byte) key
        byte[] key = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(key);

        // Choose between user input and random plaintext
        byte[] plaintext = (userInput != null && !userInput.isEmpty())
                ? userInput.getBytes()  // Convert user input to bytes
                : generateRandomPlaintext();

        // Initialize RC4 cipher
        Cipher cipher = Cipher.getInstance("RC4");
        SecretKeySpec keySpec = new SecretKeySpec(key, "RC4");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);

        // Encrypt the plaintext
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Return encrypted data in hexadecimal format
        return bytesToHex(ciphertext);
    }




    public String chacha20Encrypt() throws Exception {
        // Generate 256-bit (32-byte) key
        byte[] key = new byte[32];
        SecureRandom random = new SecureRandom();
        random.nextBytes(key);

        // Generate 12-byte nonce (ChaCha20 usually uses a 12-byte nonce)
        byte[] nonce = new byte[12];
        random.nextBytes(nonce);

        // Generate random plaintext
        byte[] plaintext = generateRandomPlaintext();

        // Initialize ChaCha20 cipher
        Cipher cipher = Cipher.getInstance("ChaCha20");
        ChaCha20ParameterSpec paramSpec = new ChaCha20ParameterSpec(nonce, 1); // The counter is usually 1
        SecretKeySpec keySpec = new SecretKeySpec(key, "ChaCha20");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec, paramSpec);

        // Encrypt plaintext
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Return encrypted data in hexadecimal format
        return bytesToHex(ciphertext);
    }


    public String rsaEncrypt() throws Exception {
        // Generate RSA Key Pair
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        PublicKey publicKey = keyPair.getPublic();

        // Generate random plaintext (150 bytes)
        byte[] plaintext = new byte[150];
        SecureRandom.getInstanceStrong().nextBytes(plaintext);

        // Encrypt using RSA with OAEP padding
        Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Return encrypted data in hexadecimal format
        return bytesToHex(ciphertext);
    }


    public String generateDsaSignature() throws Exception {
        // Generate DSA key pair
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("DSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        PrivateKey privateKey = keyPair.getPrivate();

        // Generate a random message (64 bytes)
        byte[] message = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(message);

        // Sign the message using SHA256 with DSA
        Signature signature = Signature.getInstance("SHA256withDSA");
        signature.initSign(privateKey);
        signature.update(message);
        byte[] signedData = signature.sign();

        // Return the signature in hexadecimal format
        return bytesToHex(signedData);
    }



    // ECDSA Signature Generation (Hex Output)
    public String generateEcdsaSignature() throws Exception {
        // Generate ECDSA key pair (using SECP256R1 curve)
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        ECPrivateKey privateKey = (ECPrivateKey) keyPair.getPrivate();

        // Generate a random message (64 bytes)
        byte[] message = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(message);

        // Sign the message using SHA256 with ECDSA
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(privateKey);
        signature.update(message);
        byte[] signedData = signature.sign();

        // Return the signature in hexadecimal format
        return bytesToHex(signedData);
    }

    public String performDiffieHellmanKeyExchange() throws Exception {
        // Generate Diffie-Hellman key pair
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("DiffieHellman");
        keyPairGenerator.initialize(2048);
        KeyPair keyPairA = keyPairGenerator.generateKeyPair();
        KeyPair keyPairB = keyPairGenerator.generateKeyPair();

        // Extract public keys
        byte[] publicKeyA = keyPairA.getPublic().getEncoded();
        byte[] publicKeyB = keyPairB.getPublic().getEncoded();

        // Perform key agreement
        KeyAgreement keyAgreementA = KeyAgreement.getInstance("DiffieHellman");
        keyAgreementA.init(keyPairA.getPrivate());
        keyAgreementA.doPhase(KeyFactory.getInstance("DiffieHellman")
                .generatePublic(new X509EncodedKeySpec(publicKeyB)), true);
        byte[] sharedSecretA = keyAgreementA.generateSecret();

        // Derive a symmetric key from shared secret
        SecretKey derivedKey = new SecretKeySpec(sharedSecretA, 0, 32, "AES");

        // Convert derived key to hex and return
        return bytesToHex(derivedKey.getEncoded());
    }


    public String performECDHKeyExchange() throws Exception {
        // Generate ECDH key pairs for two parties
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(256);
        KeyPair keyPairA = keyPairGenerator.generateKeyPair();
        KeyPair keyPairB = keyPairGenerator.generateKeyPair();

        // Extract public keys
        byte[] publicKeyA = keyPairA.getPublic().getEncoded();
        byte[] publicKeyB = keyPairB.getPublic().getEncoded();

        // Perform key agreement for Party A
        KeyAgreement keyAgreementA = KeyAgreement.getInstance("ECDH");
        keyAgreementA.init(keyPairA.getPrivate());
        keyAgreementA.doPhase(KeyFactory.getInstance("EC")
                .generatePublic(new X509EncodedKeySpec(publicKeyB)), true);
        byte[] sharedSecretA = keyAgreementA.generateSecret();

        // Derive a symmetric key from the shared secret
        SecretKeySpec derivedKey = new SecretKeySpec(sharedSecretA, 0, 32, "AES");

        // Convert derived key to hex and return
        return bytesToHex(derivedKey.getEncoded());
    }


    public String generateMD5Hash() throws NoSuchAlgorithmException {
        // Generate 64 bytes of random data
        byte[] data = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(data);

        // Compute MD5 hash
        MessageDigest md5Digest = MessageDigest.getInstance("MD5");
        byte[] hashBytes = md5Digest.digest(data);

        // Convert hash to hexadecimal format
        return bytesToHex(hashBytes);
    }

    public String generateSHA1Hash() throws NoSuchAlgorithmException {
        // Generate 64 bytes of random data
        byte[] data = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(data);

        // Compute SHA-1 hash
        MessageDigest sha1Digest = MessageDigest.getInstance("SHA-1");
        byte[] hashBytes = sha1Digest.digest(data);

        // Convert hash to hexadecimal format
        return bytesToHex(hashBytes);
    }


    public String generateSHA256Hash() throws NoSuchAlgorithmException {
        // Generate 64 bytes of random data
        byte[] data = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(data);

        // Compute SHA-256 hash
        MessageDigest sha256Digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = sha256Digest.digest(data);

        // Convert hash to hexadecimal format
        return bytesToHex(hashBytes);
    }


    public String generateSHA3_256Hash() throws NoSuchAlgorithmException {
        // Generate 64 bytes of random data
        byte[] data = new byte[64];
        SecureRandom.getInstanceStrong().nextBytes(data);

        // Compute SHA-3-256 hash
        MessageDigest sha3Digest = MessageDigest.getInstance("SHA3-256");
        byte[] hashBytes = sha3Digest.digest(data);

        // Convert hash to hexadecimal format
        return bytesToHex(hashBytes);
    }




    // Helper method to convert byte array to hex
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }
}

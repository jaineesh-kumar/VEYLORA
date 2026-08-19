package com.project.backend.Controllers;

import com.project.backend.Services.EncryptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/encryption")
public class EncryptionController {

    private final EncryptionService encryptionService;

    public EncryptionController(EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    @GetMapping("/aes")
    public ResponseEntity<String> aesEncrypt() {
        try {
            String encryptedData = encryptionService.aesEncrypt();
            return ResponseEntity.ok(encryptedData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during AES encryption: " + e.getMessage());
        }
    }


    @GetMapping("/des")
    public ResponseEntity<String> desEncrypt() throws Exception {
        try {
            String encryptedData = encryptionService.desEncrypt();
            return ResponseEntity.ok(encryptedData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during DES encryption: " + e.getMessage());
        }
    }


    @GetMapping("/3des")
    public ResponseEntity<String> encryptWithTripleDes() {
        try {
            return ResponseEntity.ok(encryptionService.tripleDesEncrypt());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during triple des encryption: " + e.getMessage());
        }
    }

    @GetMapping("/blowfish")
    public ResponseEntity<String> encryptWithBlowfish() {
        try {
            String encryptedData = encryptionService.blowfishEncrypt();
            return ResponseEntity.ok(encryptedData); // Return 200 OK with encrypted data
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during encryption: " + e.getMessage());
        }
    }


    @GetMapping("/rc4")
    public ResponseEntity<String> encryptWithRC4(@RequestParam(required = false) String plaintext) {
        try {
            String encryptedData = encryptionService.rc4Encrypt(plaintext);
            return ResponseEntity.ok(encryptedData); // Return 200 OK with encrypted data
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during encryption: " + e.getMessage());
        }
    }

    @GetMapping("/chacha20")
    public ResponseEntity<String> encryptWithChaCha20() {
        try {
            return ResponseEntity.ok(encryptionService.chacha20Encrypt());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during encryption: " + e.getMessage());
        }
    }

    @GetMapping("/rsa")
    public ResponseEntity<String> encryptWithRSA() {
        try {
            return ResponseEntity.ok(encryptionService.rsaEncrypt());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error during encryption: " + e.getMessage());
        }
    }

    @GetMapping("/dsa")
    public ResponseEntity<String> generateSignature() {
        try {
            String signature = encryptionService.generateDsaSignature();
            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating DSA signature: " + e.getMessage());
        }
    }

    @GetMapping("/ecdsa")
    public ResponseEntity<String> generateSignaturee() {
        try {
            String signature = encryptionService.generateEcdsaSignature();
            return ResponseEntity.ok(signature);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating ECDSA signature: " + e.getMessage());
        }
    }

    @GetMapping("/diffe")
    public ResponseEntity<String> exchangeKeys() {
        try {
            String derivedKey = encryptionService.performDiffieHellmanKeyExchange();
            return ResponseEntity.ok(derivedKey);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during key exchange: " + e.getMessage());
        }
    }

    @GetMapping("/ecdh")
    public ResponseEntity<String> exchangeKeysEcdh() {
        try {
            String derivedKey = encryptionService.performECDHKeyExchange();
            return ResponseEntity.ok(derivedKey);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error during ECDH key exchange: " + e.getMessage());
        }
    }

    @GetMapping("/md5")
    public ResponseEntity<String> getMD5Hash() {
        try {
            String md5Hash = encryptionService.generateMD5Hash();
            return ResponseEntity.ok(md5Hash);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating MD5 hash: " + e.getMessage());
        }
    }

    @GetMapping("/sha1")
    public ResponseEntity<String> getSHA1Hash() {
        try {
            String sha1Hash = encryptionService.generateSHA1Hash();
            return ResponseEntity.ok(sha1Hash);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating SHA-1 hash: " + e.getMessage());
        }
    }


    @GetMapping("/sha256")
    public ResponseEntity<String> getSHA256Hash() {
        try {
            String sha256Hash = encryptionService.generateSHA256Hash();
            return ResponseEntity.ok(sha256Hash);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating SHA-256 hash: " + e.getMessage());
        }
    }


    @GetMapping("/sha3-256")
    public ResponseEntity<String> getSHA3_256Hash() {
        try {
            String sha3Hash = encryptionService.generateSHA3_256Hash();
            return ResponseEntity.ok(sha3Hash);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error generating SHA-3-256 hash: " + e.getMessage());
        }
    }
}

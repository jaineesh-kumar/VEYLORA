package com.project.backend.Controllers;


import com.project.backend.Entities.CryptographicData;
import com.project.backend.Services.CryptographicDataService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/cryptographic-data")
public class CryptographicDataController {

    private final CryptographicDataService cryptographicDataService;
    private static final Logger log = LoggerFactory.getLogger(CryptographicDataController.class);

    @Autowired
    public CryptographicDataController(CryptographicDataService cryptographicDataService) {
        this.cryptographicDataService = cryptographicDataService;
    }


    @GetMapping("/last20")
    public ResponseEntity<List<CryptographicData>> getLast20CryptographicData() {
        log.info("Inside the Cryptographic data controller getLast20CryptographicData");
        List<CryptographicData> data = cryptographicDataService.getLast20EntriesForCurrentUser();
        return ResponseEntity.ok(data);
    }

    @PutMapping("/correctedData/{id}")
    public ResponseEntity<CryptographicData> updateCorrectedData(@PathVariable Long id, @RequestParam Boolean correctedData) {
        log.info("Received request to update correctedData in cryptographic controller for ID: {} to {}", id, correctedData);
        CryptographicData updatedData = cryptographicDataService.updateCorrectedData(id, correctedData);
        return ResponseEntity.ok(updatedData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CryptographicData> getCryptographicDataById(@PathVariable Long id) {
        log.info("Received request to fetch cryptographic data by ID in controller: {}", id);
        CryptographicData data = cryptographicDataService.getCryptographicDataById(id);
        return ResponseEntity.ok(data);
    }

}

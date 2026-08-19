package com.project.backend.Services;

import com.project.backend.Entities.CryptographicData;
import com.project.backend.Repositories.CryptographicDataRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CryptographicDataService {

    private final CryptographicDataRepository cryptographicDataRepository;

    private static final Logger log = LoggerFactory.getLogger(CryptographicDataService.class);

    @Autowired
    public CryptographicDataService(CryptographicDataRepository cryptographicDataRepository) {
        this.cryptographicDataRepository = cryptographicDataRepository;
    }

    public List<CryptographicData> getLast20EntriesForCurrentUser() {
        log.info("Received request for last20 cryptographic data for user in Crpytographicdataservice.");
        String username = getCurrentUsername();
        return cryptographicDataRepository.findLast20ByUsername(username);
    }

    public CryptographicData updateCorrectedData(Long id, Boolean correctedData) {
        log.info("Updating correctedData in cryptographic service for ID: {} to {}", id, correctedData);
        Optional<CryptographicData> existingData = cryptographicDataRepository.findById(id);

        if (existingData.isPresent()) {
            log.info("data is present and can be modified.");
            CryptographicData data = existingData.get();
            data.setCorrectedData(correctedData);
            cryptographicDataRepository.save(data);
            log.info("Updated correctedData successfully for ID: {}", id);
            return data;
        } else {
            log.error("CryptographicData with ID {} not found", id);
            throw new RuntimeException("CryptographicData with ID " + id + " not found");
        }
    }

    public CryptographicData getCryptographicDataById(Long id) {

        log.info("Fetching cryptographic data by ID in the service layer : {}", id);
        return cryptographicDataRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("CryptographicData with ID {} not found", id);
                    return new RuntimeException("CryptographicData with ID " + id + " not found");
                });
    }


    //kind of util function
    private String getCurrentUsername() {
        log.info("inside getCurrentUsername of crpytographicdataservice.");
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            log.info("user principal: " + principal);
            return ((UserDetails) principal).getUsername();
        } else {
            log.info("Some error .");
            return principal.toString();
        }
    }
}




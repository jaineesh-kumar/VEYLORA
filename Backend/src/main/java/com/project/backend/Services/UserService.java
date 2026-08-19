package com.project.backend.Services;


import com.project.backend.Entities.CryptographicData;
import com.project.backend.Entities.UpdateUserRequest;
import com.project.backend.Entities.User;
import com.project.backend.Repositories.CryptographicDataRepository;
import com.project.backend.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final CryptographicDataRepository cryptographicDataRepository;

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    public UserService(UserRepository userRepository,CryptographicDataRepository cryptographicDataRepository) {
        this.userRepository = userRepository;
        this.cryptographicDataRepository = cryptographicDataRepository;
    }


//    public void savePrediction(String inputHex, String predicted ) {
//
//    }

    public ResponseEntity<?> updateUserProfile(String currentUsername, UpdateUserRequest updateRequest) {
        Optional<User> userOptional = userRepository.findByUsername(currentUsername);

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOptional.get();

        // Check if new username is provided and if it is unique
        if (updateRequest.getNewUsername() != null && !updateRequest.getNewUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(updateRequest.getNewUsername())) {
                return ResponseEntity.badRequest().body("Username is already taken");
            }
            user.setUsername(updateRequest.getNewUsername());
        }

        // Update first name and last name
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }

        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }

        userRepository.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }


    public void savePrediction(String inputHex, String predicted) {
        // Get authenticated user
        log.info("Got request to save prediction in user service");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();// Get logged-in user's username

        log.info("Got at start");
        Optional<User> optionalUser = userRepository.findByUsername(username); // Assuming you have a method to find a user by username

        if (optionalUser.isPresent()) {
            log.info("Saving prediction for user {}", username);
            User user = optionalUser.get();

            // Create and save CryptographicData entity
            CryptographicData cryptographicData = new CryptographicData();
            cryptographicData.setData(inputHex);
            cryptographicData.setPredictedAlgorithm(predicted);
            cryptographicData.setUser(user);

            cryptographicDataRepository.save(cryptographicData);
        } else {
            throw new RuntimeException("Error in setting prediction for user. User not found for username: " + username);
        }
    }



    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }
}

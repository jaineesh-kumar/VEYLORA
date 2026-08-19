package com.project.backend.Services;

import com.project.backend.Entities.AuthResponse;
import com.project.backend.Entities.User;
import com.project.backend.Exceptions.InvalidJwtRefreshToken;
import com.project.backend.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class RefreshService {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    private static final Logger log = Logger.getLogger(RefreshService.class.getName());

    @Autowired
    public RefreshService(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public AuthResponse refreshToken(String refreshToken) {
        log.info("Received refresh token request in refresh service.");

        // Extract username from the refresh token
        String username = jwtService.extractUsername(refreshToken);
        log.info("Extracted username from refresh token: " + username);

        // Validate the refresh token
        if (username != null && !jwtService.isTokenExpired(refreshToken)) {
            log.info("Refresh token is valid.");

            // Fetch the user from the database
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found in refresh token."));

            log.info("Able to fetch user from refresh token.");
            // Generate a new access token
            String newAccessToken = jwtService.generateAccessToken(user);

            // Optionally, generate a new refresh token (if you want to rotate refresh tokens)
            String newRefreshToken = jwtService.generateRefreshToken(user);
            log.info("Access token and refresh token generated.");
            // Return the new tokens in the response
            return new AuthResponse(newAccessToken, newRefreshToken);
        } else {
            log.info("Refresh token is invalid or expired.");
            throw new InvalidJwtRefreshToken("Invalid or expired refresh token");
        }
    }



}
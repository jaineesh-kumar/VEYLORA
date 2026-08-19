package com.project.backend.Controllers;

import com.project.backend.Entities.UpdateUserRequest;
import com.project.backend.Entities.User;
import com.project.backend.Services.JwtService;
import com.project.backend.Services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody UpdateUserRequest updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        log.info("User {} is attempting to update their profile.", currentUsername);

        return userService.updateUserProfile(currentUsername, updateRequest);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getUserDetails(@RequestHeader("Authorization") String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            String username = jwtService.extractUsername(token);
            User user = userService.getUserByUsername(username);

            if (user != null) {
                return ResponseEntity.ok(new UserResponse(user.getUsername(), user.getFirstName(), user.getLastName()));
            } else {
                return ResponseEntity.badRequest().body("User not found");
            }
        } catch (Exception e) {
            log.error("Error retrieving user details: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid token");
        }
    }

    private static class UserResponse {
        private String username;
        private String firstName;
        private String lastName;

        public UserResponse(String username, String firstName, String lastName) {
            this.username = username;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public String getUsername() {
            return username;
        }

        public String getFirstName() {
            return firstName;
        }

        public String getLastName() {
            return lastName;
        }
    }
}

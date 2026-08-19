package com.project.backend.Services;

import com.project.backend.Entities.AuthResponse;
import com.project.backend.Entities.LoginRequest;
import com.project.backend.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class LoginService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private static final Logger log = Logger.getLogger(LoginService.class.getName());

    @Autowired
    public LoginService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }


    public AuthResponse login(LoginRequest loginRequest) {
        // we get an authentication object. it validates user's input against its email and password.
//        It checks the credentials against the database.
//                If the credentials are correct, Spring Security:
//        Loads the user details using UserDetailsService.
//        Compares the hashed password using the configured PasswordEncoder.
//        Returns an authenticated Authentication object.
//                If authentication fails (wrong password or email not found), an AuthenticationException is thrown.
        // we cannot keep it in the UserService , as authenticationmanager gets the username from userdetails service.
        log.info("Received login in LoginService");
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        log.info("Authentication successful now getting user via principal.");
        User existingUser = (User) authentication.getPrincipal();
        log.info("User found by username: " + existingUser.getUsername());
       return AuthResponse.builder().accessToken(jwtService.generateAccessToken(existingUser)).refreshToken(jwtService.generateRefreshToken(existingUser)).build();

    }
}
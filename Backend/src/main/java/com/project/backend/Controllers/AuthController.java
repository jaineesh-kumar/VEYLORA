package com.project.backend.Controllers;

import com.project.backend.Entities.AuthResponse;
import com.project.backend.Entities.LoginRequest;
import com.project.backend.Entities.RefreshTokenRequest;
import com.project.backend.Entities.SignupRequest;
import com.project.backend.Services.LoginService;
import com.project.backend.Services.RefreshService;
import com.project.backend.Services.SignupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")  // Allow only your frontend
public class AuthController {

    private final LoginService loginService;

    private final SignupService signupService;

    private final RefreshService refreshService;

    private static final Logger log = Logger.getLogger(AuthController.class.getName());

    @Autowired
    public AuthController(LoginService loginService, SignupService signupService,  RefreshService refreshService) {
       this.signupService = signupService;
       this.loginService = loginService;
       this.refreshService = refreshService;
    }


    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest signupRequest) {
        log.info("Received SignupRequest in the signup controller. ");

        return ResponseEntity.ok(signupService.signup(signupRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("Received LoginRequest in the login controller. ");
        return ResponseEntity.ok(loginService.login(loginRequest));
    }


//
//    @PostMapping("/refresh")
//    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshTokenRequest refreshTokenRequest) {
//        log.info("Received refresh token request in the refresh controller.");
//        // Call the refresh service to handle the logic
//        AuthResponse authResponse = refreshService.refreshToken(refreshTokenRequest.getRefreshToken());
//        return ResponseEntity.ok(authResponse);
//    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        log.info("Received logout request in the logout controller.");

        // Return null tokens in the response.

        return ResponseEntity.ok(new AuthResponse());
    }

    //  @PostMapping("/refresh")
//    public ResponseEntity<AuthResponse> refresh(@RequestBody String refreshToken) {
//        log.info("Received refresh token request in the refresh controller.");
//            // Call the refresh service to handle the logic
//            AuthResponse authResponse = refreshService.refreshToken(refreshToken);
//            return ResponseEntity.ok(authResponse);
//    }

//    @PostMapping("/refresh")
//    public ResponseEntity<AuthResponse> refresh(@RequestBody LoginRequest loginRequest) {
//
//        String username = jwtService.extractUsername(request.getRefreshToken());
//
//        if (! jwtService.isTokenExpired(loginRequest.getRefreshToken())) {
//            String newAccessToken = jwtService.generateAccessToken(username);
//            return ResponseEntity.ok(new AuthResponse(newAccessToken, request.getRefreshToken()));
//        } else {
//            return ResponseEntity.badRequest().body(null);
//        }
//     }


}
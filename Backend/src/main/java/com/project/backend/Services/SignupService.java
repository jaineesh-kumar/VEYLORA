package com.project.backend.Services;


import com.project.backend.Entities.SignupRequest;
import com.project.backend.Entities.User;
import com.project.backend.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class SignupService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Logger log = LoggerFactory.getLogger(SignupService.class);

    @Autowired
    SignupService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public String signup(SignupRequest signupRequest) {
        try {
            log.info("signupRequest received in signup service: {}", signupRequest);

            Optional<User> existingUser = userRepository.findByUsername(signupRequest.getUsername());
            if (existingUser.isPresent()) {
                log.info("Username already taken and hence throwing error");
                throw new BadCredentialsException("Username already taken");
            }

            log.info("Creating a new user object");
            User newUser = new User();
            newUser.setUsername(signupRequest.getUsername());
            newUser.setPassword(passwordEncoder.encode(signupRequest.getPassword()));  // Encode password
            newUser.setFirstName(signupRequest.getFirstName());
            newUser.setLastName(signupRequest.getLastName());
            newUser.setEnabled(true);

            log.info("Going to save new user");
            userRepository.save(newUser);
            log.info("User saved");

            return "User Registered Successfully";

        } catch (BadCredentialsException e) {
            log.error("Error: Username already taken");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken"); // ❌ 409 Conflict
        } catch (Exception e) {
            log.error("Error occurred during signup: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Signup failed, please try again.");
        }
    }



//    public String signup(SignupRequest signupRequest) {
//        log.info("signupRequest received in signup service :{}", signupRequest);
//
//        Optional<User> user = userRepository.findByUsername(signupRequest.getUsername());
//        if(user.isPresent()) {
//            log.info("Username already taken and hence throwing error");
//            throw new BadCredentialsException("Username already taken");
//        }
//        log.info("user's password is going to be encoded now ");
//        user.get().setPassword(passwordEncoder.encode(user.get().getPassword()));
//        log.info("Going to save user");
//        userRepository.save(user.get());
//        log.info("User saved");
//        return "User Registered Successfully";
//    }

}

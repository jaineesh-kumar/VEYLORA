package com.project.backend.ExceptionHandler;

import com.project.backend.Exceptions.BearerTokenNotFoundException;
import com.project.backend.Exceptions.InvalidJwtAccessToken;
import com.project.backend.Exceptions.InvalidJwtRefreshToken;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BearerTokenNotFoundException.class)
    public ResponseEntity<String> handleBearerTokenNotFoundException(BearerTokenNotFoundException exception) {
        logger.info("handleBearerTokenNotFoundException triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("An error occurred: " + exception.getMessage());
    }

    @ExceptionHandler(InvalidJwtAccessToken.class)
    public ResponseEntity<String> handleInvalidJwtAccessToken(InvalidJwtAccessToken exception) {
        logger.info("handleInvalidJwtAccessToken triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("An error occurred: " + exception.getMessage());
    }

    @ExceptionHandler(InvalidJwtRefreshToken.class)
    public ResponseEntity<String> handleInvalidJwtRefreshToken(InvalidJwtRefreshToken exception) {
        logger.info("handleInvalidJwtRefreshToken triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("An error occurred: " + exception.getMessage());
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAnyGeneralException(Exception ex) {
        logger.info("handleAnyGeneralException triggered");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
        logger.info("handleValidationException triggered");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Validation error: " + ex.getBindingResult().getFieldError().getDefaultMessage());
    }

    @ExceptionHandler(ExpiredJwtException.class)
    public ResponseEntity<String> handleExpiredJwtException(ExpiredJwtException ex) {
        logger.info("handleExpiredJwtException triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Token has expired. Please log in again.");
    }

    @ExceptionHandler(MalformedJwtException.class)
    public ResponseEntity<String> handleMalformedJwtException(MalformedJwtException ex) {
        logger.info("handleMalformedJwtException triggered");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Invalid JWT token.");
    }

    @ExceptionHandler(SignatureException.class)
    public ResponseEntity<String> handleSignatureException(SignatureException ex) {
        logger.info("handleSignatureException triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Invalid JWT signature.");
    }

    @ExceptionHandler(UnsupportedJwtException.class)
    public ResponseEntity<String> handleUnsupportedJwtException(UnsupportedJwtException ex) {
        logger.info("handleUnsupportedJwtException triggered");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Unsupported JWT token.");
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<String> handleSecurityException(SecurityException ex) {
        logger.info("handleSecurityException triggered");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Security violation: Invalid JWT signature.");
    }

    @ExceptionHandler(io.jsonwebtoken.JwtException.class)
    public ResponseEntity<String> handleJwtException(io.jsonwebtoken.JwtException ex) {
        logger.info("handleJwtException triggered");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("JWT processing error: " + ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.info("handleIllegalArgumentException triggered");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("JWT token is missing or invalid.");
    }
}

package com.project.backend.Exceptions;

public class InvalidJwtRefreshToken extends RuntimeException {
    public InvalidJwtRefreshToken(String message) {
        super(message);
    }
}

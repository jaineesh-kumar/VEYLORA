package com.project.backend.Exceptions;

public class InvalidJwtAccessToken extends RuntimeException {
    public InvalidJwtAccessToken(String message) {
        super(message);
    }
}

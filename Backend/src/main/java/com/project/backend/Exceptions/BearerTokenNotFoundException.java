package com.project.backend.Exceptions;

public class BearerTokenNotFoundException extends RuntimeException {
    public BearerTokenNotFoundException(String message) {
        super(message);
    }
}

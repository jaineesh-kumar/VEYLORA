package com.project.backend.Entities;


import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRequest {

    @Size(min = 8, message = "Username must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d_]+$",
            message = "Username must contain at least one uppercase letter, one lowercase letter, one number, and only underscores (_) as special characters")
    private String newUsername;

    @Size(min = 2, message = "First name must be at least 2 characters long")
    private String firstName;

    @Size(min = 2, message = "Last name must be at least 2 characters long")
    private String lastName;
}

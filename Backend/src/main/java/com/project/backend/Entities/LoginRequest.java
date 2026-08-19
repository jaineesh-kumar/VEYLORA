package com.project.backend.Entities;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;


@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @Size(min = 8, message = "Username must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d_]+$",
            message = "Invalid username :  must contain at least one uppercase letter, one lowercase letter, one number, and only underscores (_)")
    private String username;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d_]+$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and only underscores (_) ")
    private String password;

}

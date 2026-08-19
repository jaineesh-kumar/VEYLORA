package com.project.backend.Repositories;

import com.project.backend.Entities.User;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

//    boolean existsByUsername(@Size(min = 8, message = "Username must be at least 8 characters long") @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d_]+$",
//            message = "Username must contain at least one uppercase letter, one lowercase letter, one number, and only underscores (_) as special characters") String newUsername);
// Optional<User> FindUserByUsername(String username);

    boolean existsByUsername(String username);
}



package com.project.backend.Repositories;

import com.project.backend.Entities.Algorithm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlgorithmRepository extends JpaRepository<Algorithm, Long> {
    Optional<Algorithm> findByName(String name);

    Algorithm getAlgorithmByName(String name);
}

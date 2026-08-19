package com.project.backend.Services;

import com.project.backend.Entities.Algorithm;
import com.project.backend.Repositories.AlgorithmRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlgorithmService {

    private final AlgorithmRepository algorithmRepository;

    @Autowired
    public AlgorithmService(AlgorithmRepository algorithmRepository) {
        this.algorithmRepository = algorithmRepository;
    }


    public Algorithm getAlgorithm(String algorithmName) {
        return algorithmRepository.getAlgorithmByName(algorithmName);
    }

    // Get all algorithms in a random order
    public List<Algorithm> getAllAlgorithmsRandom() {
        List<Algorithm> algorithms = algorithmRepository.findAll();
        Collections.shuffle(algorithms); // Shuffle in Java
        return algorithms;
    }

    // Get 4 random algorithms excluding a given one
    public List<Algorithm> getRandomAlgorithmsExcluding(String excludedAlgorithm) {
        List<Algorithm> algorithms = algorithmRepository.findAll()
                .stream()
                .filter(a -> !a.getName().equalsIgnoreCase(excludedAlgorithm)) // Exclude provided algorithm
                .collect(Collectors.toList());

        Collections.shuffle(algorithms); // Shuffle the remaining ones
        return algorithms.stream().limit(4).collect(Collectors.toList()); // Pick 4
    }
}


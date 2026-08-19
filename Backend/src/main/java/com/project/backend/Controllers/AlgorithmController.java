package com.project.backend.Controllers;


import com.project.backend.Entities.Algorithm;
import com.project.backend.Services.AlgorithmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/algorithms")
public class AlgorithmController {

    private final AlgorithmService algorithmService;

    public AlgorithmController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    // Endpoint: Get all algorithms in a random order
    @GetMapping("/random")
    public ResponseEntity<List<Algorithm>> getAllAlgorithmsRandom() {
        List<Algorithm> algorithms = algorithmService.getAllAlgorithmsRandom();
        return ResponseEntity.ok(algorithms);
    }


    @GetMapping("/{algo}")
    public ResponseEntity<Algorithm> getAlgorithmsByName(@PathVariable String algo) {
        return ResponseEntity.ok(algorithmService.getAlgorithm(algo));
    }

    // Endpoint: Get 4 random algorithms excluding a specific one
    @GetMapping("/random/exclude")
    public ResponseEntity<List<Algorithm>> getRandomAlgorithmsExcluding(@RequestParam String exclude) {
        List<Algorithm> algorithms = algorithmService.getRandomAlgorithmsExcluding(exclude);
        return ResponseEntity.ok(algorithms);
    }
}

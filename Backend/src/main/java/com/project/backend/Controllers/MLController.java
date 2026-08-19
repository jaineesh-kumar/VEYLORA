package com.project.backend.Controllers;

import com.project.backend.Entities.PredictionResult;
import com.project.backend.Services.MLService;
import com.project.backend.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;


@RestController
@RequestMapping("/api/ml")
public class MLController {

    private final MLService mlService;
    private final UserService userService;
    private static final Logger log = Logger.getLogger(MLController.class.getName());

    @Autowired
    public MLController(MLService mlService, UserService userService) {
        this.userService = userService;
        this.mlService = mlService;
    }

    /**
     * POST /api/ml/predict
     * Accepts: { "input_hex": "A4 23 69 9F ..." } or { "input_hex": "a42369..." }
     * Returns: Full structured PredictionResult with top predictions, confidence, family, analysis.
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predict(@RequestBody Map<String, String> input) {
        log.info("Received prediction request in ML Controller.");

        if (!input.containsKey("input_hex")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing 'input_hex' field"));
        }

        String inputHex = input.get("input_hex").trim();

        // Server-side hex validation (allow spaces, hex chars only)
        String cleaned = inputHex.replaceAll("\\s+", "");
        if (cleaned.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Empty hex input"));
        }
        if (!cleaned.matches("^[0-9a-fA-F]+$")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid hex format: contains non-hex characters"));
        }
        if (cleaned.length() % 2 != 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid hex format: odd number of hex characters"));
        }

        // Get structured prediction
        Optional<PredictionResult> result = mlService.predictAlgorithmStructured(inputHex);

        if (result.isPresent()) {
            PredictionResult prediction = result.get();
            String topAlgorithm = prediction.getTopPredictions().isEmpty()
                    ? "Unknown"
                    : prediction.getTopPredictions().get(0).getAlgorithm();

            log.info("Top prediction: " + topAlgorithm);

            // Save to user history (best-effort, don't fail the response)
            try {
                userService.savePrediction(inputHex, topAlgorithm);
            } catch (Exception e) {
                log.warning("Could not save prediction to user history: " + e.getMessage());
            }

            return ResponseEntity.ok(prediction);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Prediction failed. Check server logs."));
        }
    }
}

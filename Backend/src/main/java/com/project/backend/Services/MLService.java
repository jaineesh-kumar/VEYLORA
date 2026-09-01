package com.project.backend.Services;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.backend.Entities.PredictionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MLService {
    private static final Logger log = LoggerFactory.getLogger(MLService.class);
    private static final String PYTHON_SCRIPT = "src/main/resources/scripts/predict.py";
    private static final String FEEDBACK_SCRIPT = "src/main/resources/scripts/add_feedback.py";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Run predict.py with the given hex input and return the raw JSON string.
     * This is the low-level method that calls the Python process.
     */
    private Optional<String> runPrediction(String inputHex) {
        log.info("Running prediction for hex input (length={}).", inputHex.length());
        try {
            // Detect OS and use the correct Python command
            String pythonCommand = System.getProperty("os.name").toLowerCase().contains("win") ? "python" : "python3";

            ProcessBuilder processBuilder = new ProcessBuilder(pythonCommand, PYTHON_SCRIPT, inputHex);
            // Do NOT merge stderr into stdout — sklearn warnings pollute the prediction output
            processBuilder.redirectErrorStream(false);
            Process process = processBuilder.start();

            // Read stdout (actual prediction result) separately from stderr (warnings)
            BufferedReader stdoutReader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            BufferedReader stderrReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));

            StringBuilder output = new StringBuilder();
            StringBuilder errorOutput = new StringBuilder();

            String line;
            while ((line = stdoutReader.readLine()) != null) {
                output.append(line);
            }
            while ((line = stderrReader.readLine()) != null) {
                errorOutput.append(line).append("\n");
            }

            // Wait for process to finish
            int exitCode = process.waitFor();

            // Log stderr warnings if any (these are non-fatal sklearn version warnings)
            if (errorOutput.length() > 0) {
                log.warn("Python script stderr: {}", errorOutput.toString().trim());
            }

            if (exitCode != 0) {
                log.error("Python script exited with error code: {}. Stderr: {}", exitCode, errorOutput);
                return Optional.empty();
            }

            String result = output.toString().trim();
            if (result.isEmpty()) {
                log.error("Python script returned empty output.");
                return Optional.empty();
            }

            log.info("Prediction result: {}", result);
            return Optional.of(result);
        } catch (Exception e) {
            log.error("Exception caught while predicting algorithm.", e);
            return Optional.empty();
        }
    }

    /**
     * Predict algorithm from hex data and return a structured PredictionResult.
     * Used by the controller to return rich JSON responses to the frontend.
     */
    public Optional<PredictionResult> predictAlgorithmStructured(String inputHex) {
        Optional<String> rawJson = runPrediction(inputHex);
        if (rawJson.isEmpty()) {
            return Optional.empty();
        }

        try {
            JsonNode root = objectMapper.readTree(rawJson.get());

            // Parse top_predictions
            List<PredictionResult.AlgorithmPrediction> predictions = new ArrayList<>();
            JsonNode topPreds = root.get("top_predictions");
            if (topPreds != null && topPreds.isArray()) {
                for (JsonNode pred : topPreds) {
                    predictions.add(new PredictionResult.AlgorithmPrediction(
                            pred.get("algorithm").asText(),
                            pred.get("confidence").asDouble()
                    ));
                }
            }

            // Parse family
            String family = root.has("family") ? root.get("family").asText() : "Unknown";

            // Parse analysis metadata
            PredictionResult.AnalysisMetadata analysis = null;
            JsonNode analysisNode = root.get("analysis");
            if (analysisNode != null) {
                analysis = new PredictionResult.AnalysisMetadata(
                        analysisNode.has("length") ? analysisNode.get("length").asInt() : 0,
                        analysisNode.has("entropy") ? analysisNode.get("entropy").asDouble() : 0,
                        analysisNode.has("mean") ? analysisNode.get("mean").asDouble() : 0,
                        analysisNode.has("std") ? analysisNode.get("std").asDouble() : 0,
                        analysisNode.has("block_aligned_8") && analysisNode.get("block_aligned_8").asBoolean(),
                        analysisNode.has("block_aligned_16") && analysisNode.get("block_aligned_16").asBoolean(),
                        analysisNode.has("is_der_encoded") && analysisNode.get("is_der_encoded").asBoolean(),
                        analysisNode.has("starts_with_0x30") && analysisNode.get("starts_with_0x30").asBoolean(),
                        analysisNode.has("chi2_p_value") ? analysisNode.get("chi2_p_value").asDouble() : 0,
                        analysisNode.has("classification_method") ? analysisNode.get("classification_method").asText() : "unknown",
                        analysisNode.has("is_ambiguous") && analysisNode.get("is_ambiguous").asBoolean(),
                        parseStringList(analysisNode.get("insights"))
                );
            }

            PredictionResult result = PredictionResult.builder()
                    .topPredictions(predictions)
                    .family(family)
                    .analysis(analysis)
                    .build();

            return Optional.of(result);
        } catch (Exception e) {
            log.error("Failed to parse prediction JSON: {}", rawJson.get(), e);
            return Optional.empty();
        }
    }

    /**
     * Legacy method — returns just the raw prediction JSON string.
     * Kept for backward compatibility with savePrediction.
     */
    public Optional<String> predictAlgorithm(String inputHex) {
        return runPrediction(inputHex);
    }
    
    private List<String> parseStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText());
            }
        }
        return list;
    }

    /**
     * Executes the Python script to append feedback to the training data.
     */
    public void saveFeedback(String inputHex, String actualAlgorithm) {
        log.info("Saving feedback for algorithm: {}", actualAlgorithm);
        try {
            String pythonCommand = System.getProperty("os.name").toLowerCase().contains("win") ? "python" : "python3";
            ProcessBuilder processBuilder = new ProcessBuilder(pythonCommand, FEEDBACK_SCRIPT, inputHex, actualAlgorithm);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Feedback script failed with exit code {}: {}", exitCode, output.toString().trim());
            } else {
                log.info("Feedback script success: {}", output.toString().trim());
            }
        } catch (Exception e) {
            log.error("Exception caught while saving feedback.", e);
        }
    }
}

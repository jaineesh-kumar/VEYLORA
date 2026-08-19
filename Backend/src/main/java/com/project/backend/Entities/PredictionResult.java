package com.project.backend.Entities;

import lombok.*;

import java.util.List;
import java.util.Map;

/**
 * DTO for structured prediction response from the ML classifier.
 * Carries top-N predictions with confidence scores and analysis metadata.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PredictionResult {

    private List<AlgorithmPrediction> topPredictions;
    private String family;
    private AnalysisMetadata analysis;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlgorithmPrediction {
        private String algorithm;
        private double confidence;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalysisMetadata {
        private int length;
        private double entropy;
        private double mean;
        private double std;
        private boolean blockAligned8;
        private boolean blockAligned16;
        private boolean isDerEncoded;
        private boolean startsWith0x30;
        private double chi2PValue;
        private String classificationMethod;
        private boolean isAmbiguous;
        private List<String> insights;
    }
}

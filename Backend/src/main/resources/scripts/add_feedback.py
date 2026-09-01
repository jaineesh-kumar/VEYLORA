import sys
import csv
import os
from generate_training_data import extract_features

# Path to the training data CSV
CSV_PATH = os.path.join(os.path.dirname(__file__), "training_data.csv")

def append_feedback(input_hex, actual_algorithm):
    try:
        # Convert hex to bytes
        data = bytes.fromhex(input_hex.replace(" ", ""))
        
        # Extract features
        features = extract_features(data)
        
        # Add the algorithm label
        features['algorithm'] = actual_algorithm
        
        # Define the expected columns to ensure correct order
        fieldnames = [
            'algorithm', 'length', 'entropy', 'mean', 'std', 'median', 'chi2_stat',
            'chi2_p_value', 'unique_bytes', 'unique_ratio', 'max_freq', 'min_freq',
            'freq_range', 'freq_std', 'mod_8', 'mod_16', 'is_mod_8', 'is_mod_16',
            'first_byte', 'starts_with_0x30', 'is_der', 'autocorr_1', 'autocorr_2',
            'autocorr_8', 'bit_entropy', 'nibble_chi2', 'rep_8', 'rep_16'
        ]
        
        file_exists = os.path.isfile(CSV_PATH)
        
        with open(CSV_PATH, 'a', newline='') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            writer.writerow(features)
            
        print(f"Successfully added feedback for {actual_algorithm}")
        
    except ValueError as ve:
        print(f"Error parsing hex: {ve}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error appending feedback: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python add_feedback.py <input_hex> <actual_algorithm>", file=sys.stderr)
        sys.exit(1)
        
    input_hex = sys.argv[1]
    actual_algorithm = sys.argv[2]
    
    append_feedback(input_hex, actual_algorithm)

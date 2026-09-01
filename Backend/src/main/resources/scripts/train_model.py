"""
Train a Random Forest classifier on the generated training data.
Uses 20+ features with cross-validation and per-algorithm accuracy reporting.
Outputs: model.pickle (replaces the old one)
"""

import os
import pickle
import time
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold, train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'training_data.csv')
    model_path = os.path.join(script_dir, 'model.pickle')
    
    print(f"Loading training data from: {data_path}")
    df = pd.read_csv(data_path)
    
    print(f"\nDataset shape: {df.shape}")
    print(f"\nSamples per algorithm:")
    print(df['algorithm'].value_counts().to_string())
    
    # Separate features and labels
    feature_cols = [c for c in df.columns if c != 'algorithm']
    X = df[feature_cols].values
    y = df['algorithm'].values
    
    # Encode labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    
    print(f"\nFeature columns ({len(feature_cols)}):")
    for i, name in enumerate(feature_cols):
        print(f"  [{i:2d}] {name}")
    
    print(f"\nLabel classes ({len(le.classes_)}):")
    for i, name in enumerate(le.classes_):
        print(f"  [{i:2d}] {name}")
    
    # ──────────────────────────────────────────────────
    #  Cross-Validation
    # ──────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  CROSS-VALIDATION (5-fold)")
    print(f"{'='*60}")
    
    clf = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
        class_weight='balanced',  # Handle class imbalance
    )
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(clf, X, y_encoded, cv=cv, scoring='accuracy')
    
    print(f"Cross-validation accuracy: {scores.mean():.4f} (+/- {scores.std():.4f})")
    print(f"Per-fold scores: {[f'{s:.4f}' for s in scores]}")
    
    # ──────────────────────────────────────────────────
    #  Train/Test Split for Detailed Report
    # ──────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  DETAILED CLASSIFICATION REPORT (80/20 split)")
    print(f"{'='*60}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    clf.fit(X_train, y_train)
    y_pred = clf.predict(X_test)
    
    print(classification_report(
        y_test, y_pred,
        target_names=le.classes_,
        digits=3
    ))
    
    # Feature importances
    print(f"\n{'='*60}")
    print("  TOP 10 FEATURE IMPORTANCES")
    print(f"{'='*60}")
    
    importances = clf.feature_importances_
    indices = np.argsort(importances)[::-1]
    for i in range(min(10, len(feature_cols))):
        idx = indices[i]
        print(f"  {feature_cols[idx]:25s}: {importances[idx]:.4f}")
    
    # ──────────────────────────────────────────────────
    #  Train Final Model on ALL Data
    # ──────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  TRAINING FINAL MODEL ON ALL DATA")
    print(f"{'='*60}")
    
    final_clf = RandomForestClassifier(
        n_estimators=500,
        max_depth=None,
        min_samples_split=4,
        min_samples_leaf=2,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1,
        class_weight='balanced',
    )
    final_clf.fit(X, y_encoded)
    
    # Save model + label encoder + feature names as a dict
    model_data = {
        'model': final_clf,
        'label_encoder': le,
        'feature_names': feature_cols,
        'version': 2,  # Mark as v2 model
    }
    
    # Backup old model
    if os.path.exists(model_path):
        old_model_path = os.path.join(script_dir, f'model_backup_{int(time.time())}.pickle')
        os.rename(model_path, old_model_path)
        print(f"  Backed up old model to: {os.path.basename(old_model_path)}")
    
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    model_size = os.path.getsize(model_path)
    print(f"  Saved new model to: {model_path}")
    print(f"  Model size: {model_size / 1024 / 1024:.2f} MB")
    print(f"\n  Training complete!")


if __name__ == '__main__':
    main()

# Face Recognition Models Directory

Place the `face-api.js` model weight files in this directory manually before running face recognition features.

Required model files include:
- `ssd_mobilenetv1_model-weights_manifest.json` and shard files
- `face_landmark_68_model-weights_manifest.json` and shard files
- `face_recognition_model-weights_manifest.json` and shard files
- `tiny_face_detector_model-weights_manifest.json` and shard files

### Note on Verification:
The application intentionally does not download or bundle large binary model weights.
If model files are absent, the application gracefully handles detection status and provides manual override and simulation options for demonstration purposes without crashing.

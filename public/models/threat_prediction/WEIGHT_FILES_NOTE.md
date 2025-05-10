# Important Note About Model Weights

The `weights.bin` file for the TensorFlow.js model should be placed in this directory. This file is typically large (multiple MB) and is not included directly in the repository.

## How to Generate the Weights File:

1. **Option 1: Train the model**
   - Use the `lib/ml/train.ts` module to train the model on real threat data
   - Run `npm run train` or call the training function from an API endpoint
   - The model will automatically save the weights to this directory

2. **Option 2: Use a pre-trained model**
   - You can download pre-trained weights from your ML pipeline
   - Save the binary weights file as `weights.bin` in this directory
   - Ensure the weights match the model architecture in `model.json`

Without this file, the ML prediction functionality will not work properly. The model will attempt to fall back to stored predictions in the database.

## File Size Note:
The weights file for this model is approximately 20-30MB in size, depending on the complexity of the model.
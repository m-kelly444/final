# Echelon Continuous Learning System

Echelon implements a multi-layered continuous learning system to ensure the ML model stays up-to-date with the latest threat intelligence data in a production environment. This document explains the various approaches used.

## Three-Tier Training Approach

Echelon uses a three-tier approach to model training:

### 1. Scheduled Full Retraining (Every 6 Hours)

A complete retraining of the model occurs every 6 hours via a Vercel Cron Job:

- Defined in `vercel.json` with the path `/api/ml/cron-train`
- Implemented in `app/api/ml/cron-train/route.ts`
- Fetches fresh data from threat intelligence APIs
- Combines with historical data from the database
- Performs full model training with 50 epochs
- Saves the updated model to the public directory

This ensures the model is periodically rebuilt from scratch with a comprehensive dataset.

### 2. Real-Time Incremental Updates

The system performs lightweight incremental training when new threat data is fetched:

- Implemented in the threat data API route (`app/api/threats/route.ts`)
- Uses a probabilistic approach (10% chance on each API call) to avoid excessive processing
- Uses `incrementalTraining()` from `lib/ml/continuous-learning.ts`
- Runs in the background (non-blocking) with 5 epochs
- Fine-tunes the existing model with only the new data

This keeps the model updated with the latest threats without waiting for the scheduled retraining.

### 3. Manual Training (As Needed)

System administrators can trigger manual training via the UI:

- Accessible at `/train` in the application
- Provides feedback on training progress and results
- Allows full control over the training process
- Useful for forcing a full retrain after significant events

## Production Implementation Details

### File Storage on Vercel

Since Vercel has a read-only filesystem in production:

1. The model is initially saved during the build process
2. Updates are handled via Vercel Blob Storage:

```typescript
// In production environments (simplified example)
if (process.env.NODE_ENV === 'production') {
  // Save model to Vercel Blob Storage
  const modelBuffer = await model.save(tf.io.withSaveHandler(async modelArtifacts => {
    return modelArtifacts;
  }));
  
  await put('threat-model-weights.bin', modelBuffer.weightData, {
    access: 'public'
  });
  
  await put('threat-model-topology.json', JSON.stringify(modelBuffer.modelTopology), {
    access: 'public',
    contentType: 'application/json'
  });
}
```

### Performance Optimizations

For production systems with high traffic:

1. **Training Queue**: Training jobs are queued and processed asynchronously
2. **Rate Limiting**: API calls for training data are rate-limited to avoid hitting API quotas
3. **Caching**: Model predictions are cached for similar inputs to reduce inference load
4. **Fallback Mechanism**: If model training fails, the system falls back to the previous model

### Monitoring and Validation

The system includes monitoring of model performance:

1. **Prediction Tracking**: Records prediction accuracy when ground truth becomes available
2. **Drift Detection**: Monitors for concept drift in threat patterns
3. **Validation Set**: Uses a held-out validation set to evaluate model quality
4. **Alerting**: Sends alerts if model performance degrades significantly

## Setup for Different Production Environments

### Vercel (Default)

- Uses Vercel Cron Jobs for scheduled training
- Uses Vercel Blob Storage for model weights
- No additional configuration needed beyond `vercel.json`

### AWS

- Use AWS Lambda for the application
- Use S3 for model storage
- Use CloudWatch Events for scheduled training
- Sample configuration in `deploy/aws/serverless.yml`

### Self-Hosted

- Use traditional cron jobs for scheduling
- Use the local filesystem for model storage
- Sample script in `scripts/cron-training.sh`

## Production Environment Variables

Add these to your production environment:

```
ML_TRAINING_ENABLED=true
ML_INCREMENTAL_TRAINING=true
ML_TRAINING_INTERVAL=360  # minutes
CRON_SECRET=your_secure_secret_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token  # for Vercel
```

## Conclusion

This multi-layered approach ensures that the Echelon ML model is always trained with the latest threat intelligence data, providing accurate and up-to-date predictions in a production environment.
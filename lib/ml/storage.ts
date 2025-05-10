/**
 * Simple model storage that works in both development and production
 */
export async function saveModel(model) {
    try {
      if (process.env.NODE_ENV === 'production') {
        // In production, we'll use the filesystem
        // This works because Vercel Functions can write to /tmp
        await model.save('file:///tmp/echelon-model');
        console.log('Model saved to /tmp in production');
      } else {
        // For development
        await model.save('file://./public/models/threat_prediction/model');
        console.log('Model saved to public directory');
      }
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }
  
  export async function loadModel() {
    try {
      if (process.env.NODE_ENV === 'production') {
        return await tf.loadLayersModel('file:///tmp/echelon-model/model.json');
      } else {
        return await tf.loadLayersModel('/models/threat_prediction/model.json');
      }
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load ML model');
    }
  }
import * as tf from '@tensorflow/tfjs';
import { preprocessThreatData } from './preprocess';
import { loadModel } from './model';

/**
 * Continuous learning module for Echelon
 * 
 * This implements incremental training on new threat data as it arrives,
 * without needing to retrain the entire model from scratch.
 */

/**
 * Incrementally train model with new threat data
 * 
 * @param newThreats - Array of new threat data
 * @param epochs - Number of epochs to train (smaller for incremental updates)
 * @returns The updated model
 */
export async function incrementalTraining(newThreats: any[], epochs = 10) {
  try {
    console.log(`Starting incremental training with ${newThreats.length} new threats`);
    
    // Load the existing model
    const model = await loadModel();
    
    // Process the new threats into features and labels
    const { features, labels } = prepareIncrementalData(newThreats);
    
    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    // Train the model incrementally (with fewer epochs and higher learning rate)
    await model.fit(xs, ys, {
      epochs,
      batchSize: 16,
      learningRate: 0.001, // Slightly higher for fine-tuning
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Incremental Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
        },
      },
    });
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    // Save the updated model
    await saveModel(model);
    
    console.log('Incremental training complete');
    return model;
  } catch (error) {
    console.error('Error in incremental training:', error);
    throw error;
  }
}

/**
 * Prepare data for incremental training
 */
function prepareIncrementalData(threats: any[]) {
  // We use the same preprocessing pipeline, but handle it as an incremental update
  const processedData = preprocessThreatData(threats);
  
  // Extract features
  const features = processedData.features;
  
  // Create labels (same format as full training)
  // For this example, we'll predict APT group, attack method, and target combinations
  const aptGroups = [
    'APT28', 'APT29', 'APT33', 'APT41', 
    'Lazarus Group', 'Sandworm', 'Kimsuky'
  ];
  
  const attackMethods = [
    'Phishing', 'Malware Deployment', 'Supply Chain Attack',
    'Zero-day Exploit', 'Ransomware', 'Data Exfiltration',
    'DDoS', 'Brute Force', 'Web Application Attack'
  ];
  
  const targets = [
    'Government', 'Financial', 'Energy Sector', 
    'Healthcare', 'Technology', 'Defense', 
    'Critical Infrastructure', 'Research Institutions'
  ];
  
  // Calculate the number of output classes
  const numClasses = aptGroups.length * attackMethods.length * targets.length;
  
  // Create labels for each threat
  const labels = threats.map(threat => {
    // Initialize zero vector
    const label = new Array(numClasses).fill(0);
    
    // Find indices
    const aptIndex = aptGroups.findIndex(apt => 
      threat.aptGroup.toLowerCase().includes(apt.toLowerCase())
    );
    
    const methodIndex = attackMethods.findIndex(method => 
      threat.attackMethod.toLowerCase().includes(method.toLowerCase())
    );
    
    const targetIndex = targets.findIndex(target => 
      threat.target.toLowerCase().includes(target.toLowerCase())
    );
    
    // Calculate the combined index
    const combinedIndex = 
      (aptIndex !== -1 ? aptIndex : 0) * attackMethods.length * targets.length +
      (methodIndex !== -1 ? methodIndex : 0) * targets.length +
      (targetIndex !== -1 ? targetIndex : 0);
    
    // Set the corresponding class to 1 (one-hot encoding)
    if (combinedIndex < numClasses) {
      label[combinedIndex] = 1;
    }
    
    return label;
  });
  
  return { features, labels };
}

/**
 * Save the incrementally trained model
 */
async function saveModel(model: tf.LayersModel) {
  try {
    // For browser environments
    if (typeof window !== 'undefined') {
      await model.save('localstorage://threat_prediction_model');
      console.log('Incrementally updated model saved to local storage');
    } 
    // For Node.js environments (during build or cron job)
    else {
      await model.save('file://./public/models/threat_prediction/model');
      console.log('Incrementally updated model saved to public directory');
    }
  } catch (error) {
    console.error('Error saving incrementally trained model:', error);
  }
}
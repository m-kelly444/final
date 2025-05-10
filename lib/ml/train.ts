import * as tf from '@tensorflow/tfjs';
import { preprocessThreatData } from './preprocess';

/**
 * Train a new threat prediction model
 * 
 * This function collects historical threat data, processes it, and trains
 * a neural network to predict future APT group activity.
 */
export async function trainModel(threatData: any[], epochs = 50) {
  // Process the training data
  const { features, labels } = prepareTrainingData(threatData);
  
  // Convert to tensors
  const xs = tf.tensor2d(features);
  const ys = tf.tensor2d(labels);
  
  // Create the model
  const model = createModel(features[0].length, labels[0].length);
  
  // Train the model
  await model.fit(xs, ys, {
    epochs,
    batchSize: 32,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs?.loss}, accuracy = ${logs?.acc}`);
      },
    },
  });
  
  // Clean up tensors
  xs.dispose();
  ys.dispose();
  
  // Save the model
  await saveModel(model);
  
  return model;
}

/**
 * Create a neural network model for threat prediction
 */
function createModel(inputDim: number, outputDim: number) {
  // Create a sequential model
  const model = tf.sequential();
  
  // Add a dense input layer
  model.add(tf.layers.dense({
    inputShape: [inputDim],
    units: 128,
    activation: 'relu',
    kernelInitializer: 'glorotNormal',
  }));
  
  // Add dropout for regularization
  model.add(tf.layers.dropout({ rate: 0.3 }));
  
  // Add a hidden layer
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
    kernelInitializer: 'glorotNormal',
  }));
  
  // Add dropout
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  // Add output layer
  model.add(tf.layers.dense({
    units: outputDim,
    activation: 'softmax',
  }));
  
  // Compile the model
  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
  
  return model;
}

/**
 * Save the trained model to the public directory
 */
async function saveModel(model: tf.LayersModel) {
  try {
    // For browser environments
    if (typeof window !== 'undefined') {
      await model.save('localstorage://threat_prediction_model');
      console.log('Model saved to local storage');
    } 
    // For Node.js environments (during build)
    else {
      await model.save('file://./public/models/threat_prediction/model');
      console.log('Model saved to public directory');
    }
  } catch (error) {
    console.error('Error saving model:', error);
  }
}

/**
 * Prepare training data from historical threat data
 */
function prepareTrainingData(threatData: any[]) {
  // Process threat data into feature vectors
  const processedData = preprocessThreatData(threatData);
  
  // Extract features
  const features = processedData.features;
  
  // Create labels (one-hot encoded)
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
  const labels = threatData.map(threat => {
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
 * Run the training process
 * This can be called by a script or API endpoint
 */
export async function runTraining(threatData: any[]) {
  console.log('Starting model training with', threatData.length, 'threats');
  const model = await trainModel(threatData);
  console.log('Model training complete');
  return model;
}
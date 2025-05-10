import * as tf from '@tensorflow/tfjs';
import { preprocessThreatData } from './preprocess';

// Cache the loaded model
let modelCache: tf.LayersModel | null = null;

/**
 * Load the TensorFlow.js model
 */
export async function loadModel() {
  if (modelCache) {
    return modelCache;
  }
  
  try {
    // Load the model from the server
    const model = await tf.loadLayersModel('/models/threat_prediction/model.json');
    modelCache = model;
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load ML model');
  }
}

/**
 * Run a prediction using the model
 */
export async function runPrediction(model: tf.LayersModel, inputData: any) {
  try {
    // Convert input features to tensor
    const inputTensor = tf.tensor2d(inputData.features);
    
    // Run prediction
    const predictions = model.predict(inputTensor) as tf.Tensor;
    
    // Process prediction results
    const predictionData = await processPredictionResults(predictions, inputData.metadata);
    
    // Clean up tensors
    inputTensor.dispose();
    predictions.dispose();
    
    return predictionData;
  } catch (error) {
    console.error('Error running prediction:', error);
    throw new Error('Failed to generate predictions');
  }
}

/**
 * Process raw prediction results into structured data
 */
async function processPredictionResults(predictions: tf.Tensor, metadata: any) {
  // The raw predictions need to be converted from tensor to JS array
  const predictionArray = await predictions.array();
  
  // Lists of APT groups, attack methods, and targets for mapping prediction indices
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
  
  // Flatten predictions and get top N
  const flatPredictions = predictionArray[0];
  const topN = 5;
  
  // Find indices of top N predictions
  const indices = Array.from(Array(flatPredictions.length).keys())
    .sort((a, b) => flatPredictions[b] - flatPredictions[a])
    .slice(0, topN);
  
  // Format predictions
  return indices.map(index => {
    // Calculate indices for apt group, attack method, and target
    const aptIndex = index % aptGroups.length;
    const methodIndex = Math.floor(index / aptGroups.length) % attackMethods.length;
    const targetIndex = Math.floor(index / (aptGroups.length * attackMethods.length)) % targets.length;
    
    // Map to respective values
    const aptGroup = aptGroups[aptIndex];
    const attackMethod = attackMethods[methodIndex];
    const targetType = targets[targetIndex];
    
    // Calculate confidence percentage
    const confidence = Math.round(flatPredictions[index] * 100);
    
    // Generate a description based on the prediction
    const description = generateDescription(aptGroup, attackMethod, targetType, confidence);
    
    return {
      id: index,
      aptGroup,
      attackMethod,
      targetType,
      confidence,
      timestamp: new Date().toISOString(),
      features: metadata?.inputFeatures || [],
      description,
    };
  });
}

/**
 * Generate a natural language description of the prediction
 */
function generateDescription(aptGroup: string, attackMethod: string, targetType: string, confidence: number) {
  // Confidence level text
  let confidenceText = 'possible';
  if (confidence > 85) confidenceText = 'highly likely';
  else if (confidence > 70) confidenceText = 'likely';
  else if (confidence > 50) confidenceText = 'potential';
  
  // Timeframe based on confidence
  let timeframe = 'in the coming weeks';
  if (confidence > 80) timeframe = 'in the near future';
  else if (confidence > 60) timeframe = 'in the next 1-2 months';
  
  // Generate the description
  return `${confidenceText} ${attackMethod.toLowerCase()} campaign by ${aptGroup} targeting ${targetType.toLowerCase()} organizations ${timeframe}. Based on recent threat intelligence and historical attack patterns.`;
}

/**
 * Train or fine-tune the model with new data
 */
export async function trainModel(trainData: any, epochs = 10) {
  try {
    // Load existing model or create new one if doesn't exist
    let model = await loadModel().catch(() => createNewModel());
    
    // Preprocess training data
    const { features, labels } = preprocessTrainingData(trainData);
    
    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    // Configure training
    const optimizer = tf.train.adam(0.001);
    model.compile({
      optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });
    
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
    
    // Update cache
    modelCache = model;
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    // Return the updated model
    return model;
  } catch (error) {
    console.error('Error training model:', error);
    throw new Error('Failed to train ML model');
  }
}

/**
 * Create a new model if one doesn't exist
 */
function createNewModel() {
  const inputSize = 50; // Feature vector size
  const numClasses = 100; // Number of prediction classes
  
  const model = tf.sequential();
  
  // Add layers
  model.add(tf.layers.dense({
    units: 128,
    activation: 'relu',
    inputShape: [inputSize],
  }));
  
  model.add(tf.layers.dropout({ rate: 0.3 }));
  
  model.add(tf.layers.dense({
    units: 64,
    activation: 'relu',
  }));
  
  model.add(tf.layers.dropout({ rate: 0.2 }));
  
  model.add(tf.layers.dense({
    units: numClasses,
    activation: 'softmax',
  }));
  
  return model;
}

/**
 * Preprocess training data
 */
function preprocessTrainingData(data: any) {
  // Implement feature extraction and label encoding
  // This is a placeholder - real implementation would depend on your data structure
  const features = [];
  const labels = [];
  
  // Process each training example
  for (const example of data) {
    const feature = [/* feature values */];
    const label = [/* one-hot encoded label */];
    
    features.push(feature);
    labels.push(label);
  }
  
  return { features, labels };
}
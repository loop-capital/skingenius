// metro.config.js — SKINgenius
// Add .tflite as asset extension for ML models
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add tflite as a recognized asset extension
config.resolver.assetExts.push('tflite');

module.exports = config;

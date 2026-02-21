const mongoose = require('mongoose');

const modelMetadataSchema = new mongoose.Schema({
  modelVersion: { type: String, required: true },
  trainingDate: { type: String, required: true },
  contamination: { type: Number, required: true },
  featureSchema: { type: [String], required: true },
  n_features: Number,
  precision: Number,
  recall: Number,
  f1: Number,
  roc_auc: Number,
  n_train_normal: Number,
  n_validation_normal: Number,
  n_validation_anomaly: Number,
  updatedAt: { type: Date, default: Date.now },
});

modelMetadataSchema.index({ modelVersion: 1 });

module.exports = mongoose.model('ModelMetadata', modelMetadataSchema);

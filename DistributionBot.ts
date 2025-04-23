import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const DistributionBotSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  token_symbol: String,
  delay: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field on save
DistributionBotSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.DistributionBot || mongoose.model('DistributionBot', DistributionBotSchema);

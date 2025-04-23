import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const AirdropSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  bot_uuid: {
    type: String,
    required: true
  },
  wallet_address: {
    type: String,
    required: true
  },
  token_address: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tx_hash: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
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
AirdropSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.Airdrop || mongoose.model('Airdrop', AirdropSchema);

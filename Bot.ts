import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const BotSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['seed', 'trade', 'volume', 'distribution'],
    required: true
  },
  token_name: String,
  token_symbol: String,
  token_address: String,
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
BotSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.Bot || mongoose.model('Bot', BotSchema);

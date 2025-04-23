import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const BotExecutionSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },
  bot_uuid: {
    type: String,
    required: true
  },
  bot_type: {
    type: String,
    enum: ['seed', 'trade', 'volume', 'distribution'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  start_time: Date,
  end_time: Date,
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
BotExecutionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.BotExecution || mongoose.model('BotExecution', BotExecutionSchema);

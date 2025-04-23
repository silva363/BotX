import mongoose from 'mongoose';

const AcceptedTokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    unique: true
  },
  decimals: {
    type: Number,
    default: 18
  },
  pool_address: String,
  pool_name: String,
  pool_symbol: String,
  pool_decimals: Number,
  active: {
    type: Boolean,
    default: true
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
AcceptedTokenSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.models.AcceptedToken || mongoose.model('AcceptedToken', AcceptedTokenSchema);

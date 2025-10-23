import mongoose from 'mongoose';

/**
 * URL Schema for storing shortened URLs
 */
const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clicks: {
    type: Number,
    default: 0
  },
  // Additional metadata for analytics
  lastClicked: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'urls'
});

// Index for better query performance
urlSchema.index({ shortId: 1 });
urlSchema.index({ createdAt: -1 });

// Instance method to increment clicks
urlSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  this.lastClicked = new Date();
  return this.save();
};

// Static method to find active URLs
urlSchema.statics.findActive = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

const Url = mongoose.model('Url', urlSchema);

export default Url;
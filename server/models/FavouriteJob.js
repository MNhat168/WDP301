const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavouriteJobSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  favouriteDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

FavouriteJobSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('FavouriteJob', FavouriteJobSchema);
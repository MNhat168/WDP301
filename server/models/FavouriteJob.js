const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavouriteJobSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job' },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FavouriteJob', FavouriteJobSchema);
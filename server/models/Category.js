import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Category', CategorySchema);

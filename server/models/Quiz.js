const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const QuizSchema = new Schema({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  answers: [{
    answerText: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    answerDate: {
      type: Date,
      default: Date.now
    }
  }],
  userResponses: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    selectedAnswerIndex: {
      type: Number,
      required: true
    },
    responseDate: {
      type: Date,
      default: Date.now
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    status: {
      type: String,
      enum: ['submitted', 'draft', 'reviewed'],
      default: 'submitted'
    }
  }],
  questionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number, 
    default: 5
  }
}, {
  timestamps: true
});

QuizSchema.index({ jobId: 1 });
QuizSchema.index({ 'userResponses.userId': 1 });
QuizSchema.index({ jobId: 1, isActive: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);
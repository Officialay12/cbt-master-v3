const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: Number,
    userAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    section: String
});

const examResultSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    course: {
        type: String,
        required: true,
        enum: ['gst101', 'gns105', 'mth101', 'phy101']
    },
    courseName: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        required: true
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1
    },
    timeUsed: {
        type: String,
        required: true
    },
    answers: [answerSchema],
    sectionStats: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Create indexes
examResultSchema.index({ userId: 1, timestamp: -1 });
examResultSchema.index({ course: 1, score: -1 });
examResultSchema.index({ userId: 1, course: 1 });

// Virtual for performance category
examResultSchema.virtual('performance').get(function() {
    if (this.score >= 80) return 'Excellent';
    if (this.score >= 70) return 'Very Good';
    if (this.score >= 60) return 'Good';
    if (this.score >= 50) return 'Pass';
    return 'Fail';
});

module.exports = mongoose.model('ExamResult', examResultSchema);

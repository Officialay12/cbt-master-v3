const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: ['visit', 'course_start', 'exam_submit', 'screen_view', 'link_click']
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    deviceInfo: {
        userAgent: String,
        screenSize: String,
        platform: String
    }
});

// Create indexes for better query performance
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, timestamp: -1 });

// Virtual for date only (for daily analytics)
analyticsSchema.virtual('date').get(function() {
    return this.timestamp.toISOString().split('T')[0];
});

module.exports = mongoose.model('Analytics', analyticsSchema);

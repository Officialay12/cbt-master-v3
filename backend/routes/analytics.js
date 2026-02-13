const express = require('express');
const router = express.Router();

// In-memory analytics (replace with MongoDB in production)
let analytics = {
    visits: 1247,
    exams: 5432,
    avgScore: 68.5,
    activeToday: 89,
    courseStats: {}
};

// @route   GET /api/analytics/stats
// @desc    Get platform statistics
// @access  Public
router.get('/stats', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                totalUsers: analytics.visits,
                totalAttempts: analytics.exams,
                avgScore: analytics.avgScore,
                activeToday: analytics.activeToday
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics'
        });
    }
});

// @route   POST /api/analytics/track
// @desc    Track user activity
// @access  Public
router.post('/track', (req, res) => {
    try {
        const { eventType, course, userId } = req.body;

        if (eventType === 'visit') {
            analytics.visits += 1;
        } else if (eventType === 'exam_complete') {
            analytics.exams += 1;

            // Track course stats
            if (course) {
                if (!analytics.courseStats[course]) {
                    analytics.courseStats[course] = { attempts: 0, totalScore: 0 };
                }
                analytics.courseStats[course].attempts += 1;
            }
        }

        res.json({
            success: true,
            message: 'Activity tracked successfully'
        });
    } catch (error) {
        console.error('Track error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track activity'
        });
    }
});

// @route   GET /api/analytics/courses
// @desc    Get course popularity stats
// @access  Public
router.get('/courses', (req, res) => {
    try {
        const courseData = [
            { name: 'GST101: Use of English', attempts: 1245, avgScore: 72.3 },
            { name: 'GNS105: Modern Agriculture', attempts: 987, avgScore: 68.1 },
            { name: 'MTH101: Elementary Math I', attempts: 1567, avgScore: 64.8 },
            { name: 'PHY101: General Physics I', attempts: 876, avgScore: 61.2 },
            { name: 'BIO101: General Biology', attempts: 743, avgScore: 70.5 },
            { name: 'COS101: Intro to CS', attempts: 1456, avgScore: 75.4 }
        ];

        res.json({
            success: true,
            data: courseData
        });
    } catch (error) {
        console.error('Course stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course statistics'
        });
    }
});

// @route   GET /api/analytics/realtime
// @desc    Get real-time activity
// @access  Public
router.get('/realtime', (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                activeUsers: Math.floor(Math.random() * 50) + 20,
                examsInProgress: Math.floor(Math.random() * 30) + 10,
                avgResponseTime: Math.floor(Math.random() * 200) + 100
            }
        });
    } catch (error) {
        console.error('Realtime stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch realtime statistics'
        });
    }
});

module.exports = router;

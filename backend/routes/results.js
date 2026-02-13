const express = require('express');
const router = express.Router();

// In-memory results storage
let examResults = [];

// @route   POST /api/results/save
// @desc    Save exam result
// @access  Public
router.post('/save', (req, res) => {
    try {
        const {
            userId,
            course,
            score,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            timeUsed,
            accuracy,
            grade,
            answers,
            timestamp
        } = req.body;

        const result = {
            id: Date.now().toString(),
            userId: userId || 'anonymous',
            course,
            score,
            totalQuestions,
            correctAnswers,
            wrongAnswers,
            timeUsed,
            accuracy,
            grade,
            answers: answers || [],
            timestamp: timestamp || new Date().toISOString(),
            createdAt: new Date()
        };

        // Save to in-memory array
        examResults.push(result);

        // Keep only last 1000 results
        if (examResults.length > 1000) {
            examResults = examResults.slice(-1000);
        }

        res.json({
            success: true,
            message: 'Exam result saved successfully',
            resultId: result.id
        });
    } catch (error) {
        console.error('Save result error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save exam result'
        });
    }
});

// @route   GET /api/results/history/:userId
// @desc    Get user's exam history
// @access  Public
router.get('/history/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        const userResults = examResults
            .filter(r => r.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 20); // Last 20 attempts

        res.json({
            success: true,
            data: userResults
        });
    } catch (error) {
        console.error('History error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam history'
        });
    }
});

// @route   GET /api/results/:resultId
// @desc    Get specific exam result
// @access  Public
router.get('/:resultId', (req, res) => {
    try {
        const { resultId } = req.params;

        const result = examResults.find(r => r.id === resultId);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Result not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam result'
        });
    }
});

// @route   GET /api/results/course/:courseName
// @desc    Get results by course
// @access  Public
router.get('/course/:courseName', (req, res) => {
    try {
        const { courseName } = req.params;

        const courseResults = examResults
            .filter(r => r.course === courseName)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50);

        // Calculate average score
        const avgScore = courseResults.length > 0
            ? courseResults.reduce((sum, r) => sum + r.score, 0) / courseResults.length
            : 0;

        res.json({
            success: true,
            data: {
                results: courseResults,
                totalAttempts: courseResults.length,
                averageScore: Math.round(avgScore * 10) / 10,
                bestScore: courseResults.length > 0
                    ? Math.max(...courseResults.map(r => r.score))
                    : 0
            }
        });
    } catch (error) {
        console.error('Course results error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch course results'
        });
    }
});

// @route   DELETE /api/results/:resultId
// @desc    Delete exam result (admin only)
// @access  Private
router.delete('/:resultId', (req, res) => {
    try {
        const { resultId } = req.params;

        const index = examResults.findIndex(r => r.id === resultId);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                error: 'Result not found'
            });
        }

        examResults.splice(index, 1);

        res.json({
            success: true,
            message: 'Result deleted successfully'
        });
    } catch (error) {
        console.error('Delete result error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete exam result'
        });
    }
});

module.exports = router;

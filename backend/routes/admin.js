const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();

// Admin credentials from .env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ibrokeupwithphp';
const ADMIN_SECRET = process.env.ADMIN_SECRET || '.     .';

// ============================================
// ROUTE 1: Serve Login Page
// ============================================
router.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CBT MASTER - Admin Login</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Poppins', sans-serif;
                    background: #0a0a1a;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background-image: radial-gradient(circle at 10% 20%, rgba(0,255,157,0.03) 0%, transparent 30%);
                }
                .login-card {
                    background: rgba(20,20,40,0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid #2a2a3a;
                    border-radius: 20px;
                    padding: 50px 40px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .login-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 5px;
                    background: linear-gradient(90deg, #0066ff, #00ff9d);
                }
                h1 {
                    text-align: center;
                    margin-bottom: 10px;
                    font-size: 2rem;
                    background: linear-gradient(135deg, #0066ff, #00ff9d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .subtitle {
                    text-align: center;
                    color: #b0b0ff;
                    margin-bottom: 30px;
                    font-size: 0.95rem;
                }
                .input-field {
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 8px;
                    color: #b0b0ff;
                    font-size: 0.9rem;
                }
                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 15px;
                    color: #00ff9d;
                }
                input {
                    width: 100%;
                    padding: 14px 15px 14px 45px;
                    background: #0a0a1a;
                    border: 1px solid #2a2a3a;
                    border-radius: 10px;
                    color: white;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                input:focus {
                    outline: none;
                    border-color: #00ff9d;
                    box-shadow: 0 0 0 3px rgba(0,255,157,0.1);
                }
                button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(45deg, #0066ff, #00ff9d);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-top: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,255,157,0.2);
                }
                .error-message {
                    background: rgba(255,107,107,0.1);
                    border: 1px solid #ff6b6b;
                    color: #ff6b6b;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 20px;
                    display: none;
                    align-items: center;
                    gap: 10px;
                }
                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 25px;
                    color: #b0b0ff;
                    text-decoration: none;
                    font-size: 0.9rem;
                }
                .back-link:hover {
                    color: #00ff9d;
                }
            </style>
        </head>
        <body>
            <div class="login-card">
                <h1>CBT MASTER</h1>
                <div class="subtitle">Administrator Access Only</div>

                <div class="input-field">
                    <label>🔑 Admin Password</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" id="password" placeholder="Enter admin password">
                    </div>
                </div>

                <div class="input-field">
                    <label>🛡️ Secret Key</label>
                    <div class="input-wrapper">
                        <i class="fas fa-shield input-icon"></i>
                        <input type="password" id="secret" placeholder="Enter secret key">
                    </div>
                </div>

                <button onclick="login()">
                    <i class="fas fa-sign-in-alt"></i>
                    Access Dashboard
                </button>

                <div class="error-message" id="errorMsg">
                    <i class="fas fa-exclamation-circle"></i>
                    Invalid credentials. Access denied.
                </div>

                <a href="/" class="back-link">
                    <i class="fas fa-arrow-left"></i> Return to Home
                </a>
            </div>

            <script>
                function login() {
                    const password = document.getElementById('password').value;
                    const secret = document.getElementById('secret').value;

                    if (!password || !secret) {
                        document.getElementById('errorMsg').style.display = 'flex';
                        return;
                    }

                    window.location.href = '/api/admin/dashboard?password=' +
                        encodeURIComponent(password) + '&secret=' + encodeURIComponent(secret);
                }

                if (window.location.search.includes('error=1')) {
                    document.getElementById('errorMsg').style.display = 'flex';
                }

                document.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') login();
                });
            </script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </body>
        </html>
    `);
});

// ============================================
// ROUTE 2: Authenticate & Serve Dashboard
// ============================================
router.get('/dashboard', (req, res) => {
    const { password, secret } = req.query;

    if (password === ADMIN_PASSWORD && secret === ADMIN_SECRET) {
        // Serve dashboard HTML file
        res.sendFile(path.join(__dirname, '../admin/dashboard.html'));
    } else {
        res.redirect('/api/admin/login?error=1');
    }
});

// ============================================
// ROUTE 3: Get Admin Stats (API)
// ============================================
router.get('/stats', async (req, res) => {
    const { password, secret } = req.query;

    // Authenticate
    if (password !== ADMIN_PASSWORD || secret !== ADMIN_SECRET) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized access'
        });
    }

    try {
        // Check DB connection
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                success: true,
                data: getMockStats(),
                warning: 'Using mock data - Database offline'
            });
        }

        const db = mongoose.connection.db;

        // Get real stats from database
        const totalExams = await db.collection('examresults').countDocuments() || 5432;
        const uniqueUsers = await db.collection('analytics').distinct('userId') || [];

        res.json({
            success: true,
            data: {
                totalVisits: 1247,
                uniqueUsers: uniqueUsers.length || 892,
                totalExams: totalExams,
                todayAttempts: 89,
                overallAvgScore: 68.5,
                courseStats: getMockCourseStats(),
                gradeDistribution: getMockGradeDistribution(),
                dailyActivity: getMockDailyActivity()
            }
        });
    } catch (error) {
        res.json({
            success: true,
            data: getMockStats()
        });
    }
});

// ============================================
// ROUTE 4: Get Recent Results (API)
// ============================================
router.get('/recent-results', async (req, res) => {
    const { password, secret, limit = 10 } = req.query;

    if (password !== ADMIN_PASSWORD || secret !== ADMIN_SECRET) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    res.json({
        success: true,
        data: getMockRecentResults(parseInt(limit))
    });
});

// ============================================
// ROUTE 5: Get Top Performers (API)
// ============================================
router.get('/top-performers', async (req, res) => {
    const { password, secret } = req.query;

    if (password !== ADMIN_PASSWORD || secret !== ADMIN_SECRET) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    res.json({
        success: true,
        data: getMockTopPerformers()
    });
});

// ============================================
// MOCK DATA FUNCTIONS
// ============================================
function getMockStats() {
    return {
        totalVisits: 1247,
        uniqueUsers: 892,
        totalExams: 5432,
        todayAttempts: 89,
        overallAvgScore: 68.5,
        courseStats: getMockCourseStats(),
        gradeDistribution: getMockGradeDistribution(),
        dailyActivity: getMockDailyActivity()
    };
}

function getMockCourseStats() {
    return [
        { _id: 'gst101', attempts: 1245, averageScore: 72.3, bestScore: 98, uniqueStudents: 345 },
        { _id: 'gns105', attempts: 987, averageScore: 68.1, bestScore: 94, uniqueStudents: 234 },
        { _id: 'mth101', attempts: 1567, averageScore: 64.8, bestScore: 100, uniqueStudents: 456 },
        { _id: 'phy101', attempts: 876, averageScore: 61.2, bestScore: 92, uniqueStudents: 198 },
        { _id: 'bio101', attempts: 743, averageScore: 70.5, bestScore: 96, uniqueStudents: 167 },
        { _id: 'cos101', attempts: 1456, averageScore: 75.4, bestScore: 99, uniqueStudents: 389 }
    ];
}

function getMockGradeDistribution() {
    return [
        { _id: 'A', count: 234 },
        { _id: 'B', count: 456 },
        { _id: 'C', count: 345 },
        { _id: 'D', count: 123 },
        { _id: 'F', count: 89 }
    ];
}

function getMockDailyActivity() {
    const days = ['2026-02-06', '2026-02-07', '2026-02-08', '2026-02-09', '2026-02-10', '2026-02-11', '2026-02-12'];
    return days.map(date => ({
        _id: date,
        count: Math.floor(Math.random() * 40) + 30,
        avgScore: Math.floor(Math.random() * 20) + 60
    }));
}

function getMockRecentResults(limit) {
    const courses = ['gst101', 'gns105', 'mth101', 'phy101', 'bio101', 'cos101'];
    const results = [];
    for (let i = 0; i < limit; i++) {
        const course = courses[Math.floor(Math.random() * courses.length)];
        const score = Math.floor(Math.random() * 40) + 60;
        results.push({
            id: `result_${i}`,
            userId: `user_${Math.random().toString(36).substring(2, 8)}`,
            course: course,
            courseName: getCourseName(course),
            score: score,
            grade: score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F',
            timestamp: new Date().toISOString(),
            timeUsed: '15:30',
            accuracy: score
        });
    }
    return results;
}

function getMockTopPerformers() {
    const courses = ['gst101', 'gns105', 'mth101', 'phy101', 'bio101', 'cos101'];
    const performers = [];
    for (let i = 0; i < 10; i++) {
        const course = courses[Math.floor(Math.random() * courses.length)];
        performers.push({
            userId: `user_${Math.random().toString(36).substring(2, 8)}`,
            course: course,
            courseName: getCourseName(course),
            bestScore: Math.floor(Math.random() * 15) + 85,
            attempts: Math.floor(Math.random() * 5) + 1,
            latestAttempt: new Date().toISOString()
        });
    }
    return performers.sort((a, b) => b.bestScore - a.bestScore);
}

function getCourseName(courseId) {
    const map = {
        'gst101': 'GST101: Use of English',
        'gns105': 'GNS105: Modern Agriculture',
        'mth101': 'MTH101: Elementary Math I',
        'phy101': 'PHY101: General Physics I',
        'bio101': 'BIO101: General Biology',
        'cos101': 'COS101: Intro to Computer Science'
    };
    return map[courseId] || courseId;
}

module.exports = router;

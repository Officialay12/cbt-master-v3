const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Import routes
const analyticsRoutes = require('../routes/analytics');
const resultsRoutes = require('../routes/results');
const adminRoutes = require('../routes/admin');

// ✅ FIRST: Initialize Express app
const app = express();

// ✅ SECOND: Middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// ✅ THIRD: Serve static files
app.use(express.static(path.join(__dirname, '../../'))); // Go up to root folder

// ✅ FOURTH: Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ayomide0001111_db_user:Ayomide12@cluster0.5ptud6p.mongodb.net/cbtmaster?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log('📦 Database: cbtmaster');
})
.catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    console.log('⚠️ Running in memory-only mode (no database)');
});

// Make mongoose available globally
global.mongoose = mongoose;

// ✅ FIFTH: API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/admin', adminRoutes);

// ✅ SIXTH: Protected Admin Dashboard Route
app.get('/admin', (req, res) => {
    const { password, secret } = req.query;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ibrokeupwithphp';
    const ADMIN_SECRET = process.env.ADMIN_SECRET || '.     .';

    if (password === ADMIN_PASSWORD && secret === ADMIN_SECRET) {
        res.sendFile(path.join(__dirname, '../../admin/dashboard.html'));
    } else {
        res.redirect('/api/admin/login');
    }
});

// ✅ SEVENTH: Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        version: '3.0.0'
    });
});

// ✅ EIGHTH: Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ✅ NINTH: 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// ✅ TENTH: Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 CBT MASTER Server v3.0`);
    console.log('='.repeat(50));
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🔐 Admin Login: http://localhost:${PORT}/api/admin/login`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🩺 Health: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
    console.log(`👨‍💻 Developer: Omole Ayomide David`);
    console.log(`🎯 100-Level Mathematics Student, OOU`);
    console.log('='.repeat(50) + '\n');
});

// ✅ ELEVENTH: Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Closing server...');
    server.close(() => {
        mongoose.connection.close(false, () => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
});

module.exports = app;

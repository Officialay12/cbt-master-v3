const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Sample exam results for seeding
const sampleResults = [
    {
        userId: 'demo_user_1',
        course: 'GST101: Use of English',
        score: 82,
        totalQuestions: 35,
        correctAnswers: 29,
        wrongAnswers: 6,
        timeUsed: '15:23',
        accuracy: 82.9,
        grade: 'A',
        timestamp: new Date('2026-02-10T10:30:00Z')
    },
    {
        userId: 'demo_user_2',
        course: 'MTH101: Elementary Math I',
        score: 71,
        totalQuestions: 35,
        correctAnswers: 25,
        wrongAnswers: 10,
        timeUsed: '18:45',
        accuracy: 71.4,
        grade: 'B',
        timestamp: new Date('2026-02-11T14:20:00Z')
    },
    {
        userId: 'demo_user_3',
        course: 'COS101: Intro to CS',
        score: 94,
        totalQuestions: 35,
        correctAnswers: 33,
        wrongAnswers: 2,
        timeUsed: '12:10',
        accuracy: 94.3,
        grade: 'A',
        timestamp: new Date('2026-02-12T09:15:00Z')
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cbtmaster');
        console.log('📦 Connected to MongoDB');

        // Clear existing data
        await mongoose.connection.db.collection('examresults').deleteMany({});
        await mongoose.connection.db.collection('analytics').deleteMany({});

        // Insert sample data
        await mongoose.connection.db.collection('examresults').insertMany(sampleResults);

        // Insert analytics data
        await mongoose.connection.db.collection('analytics').insertMany([
            { eventType: 'visit', userId: 'demo_user_1', timestamp: new Date() },
            { eventType: 'visit', userId: 'demo_user_2', timestamp: new Date() },
            { eventType: 'exam_complete', userId: 'demo_user_1', course: 'GST101', timestamp: new Date() },
            { eventType: 'exam_complete', userId: 'demo_user_2', course: 'MTH101', timestamp: new Date() }
        ]);

        console.log('✅ Database seeded successfully!');
        console.log(`📊 Inserted ${sampleResults.length} exam results`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();

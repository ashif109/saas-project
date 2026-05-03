const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// DO NOT connect synchronously here. This allows Express to attach route handlers immediately.
// We will connect via a middleware right before the routing layer.

const app = express();

// --- 1. CORS Configuration (MUST BE FIRST) ---
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Handle preflight for all routes explicitly
app.options('*', cors());

// --- 2. Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- 3. Serverless DB Connection Middleware ---
app.use((req, res, next) => {
    // Skip DB connection for preflight OPTIONS requests to avoid CORS timeouts
    if (req.method === 'OPTIONS') {
        return next();
    }
    
    // Use promise-based handling to prevent crashes in serverless environment
    connectDB()
        .then(() => next())
        .catch(err => {
            console.error('CRITICAL: DB Connection Middleware Error:', err);
            // Even if DB fails, we call next to let the error handler catch it later
            // instead of crashing the whole function invocation.
            next();
        });
});

// --- Basic Routes ---
app.get('/', (req, res) => {
    res.send('Pulse API is running...');
});

app.get('/api', (req, res) => {
    res.json({ message: 'Pulse API V1 is online and ready.', status: 'Healthy' });
});

// --- API Routes (Added a small comment to trigger Vercel redeploy) ---
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/academic-years', require('./routes/academicRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/setup', require('./routes/setupRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/scholarships', require('./routes/scholarshipRoutes'));
app.use('/api/marks', require('./routes/marksRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/doubts', require('./routes/doubtRoutes'));

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
    app.listen(PORT, async () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        // Immediately trigger connection instead of waiting for API hit
        await connectDB();
        try {
            const prisma = require('./config/prisma');
            await prisma.$connect();
            console.log('Prisma Engine Connected Successfully!');
        } catch (error) {
            console.error('Prisma Connection Error:', error.message);
        }
    });
}

module.exports = app;

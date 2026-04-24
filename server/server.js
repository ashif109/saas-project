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

// --- CORS Configuration ---
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins for the multi-tenant SaaS frontend dynamically
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
    allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization']
}));

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Serverless DB Connection Middleware ---
// Ensures Vercel waits for DB connection before hitting API routes, avoiding 'buffering timed out'
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- Basic Routes ---
app.get('/', (req, res) => {
    res.send('Pulse API is running...');
});

app.get('/api', (req, res) => {
    res.json({ message: 'Pulse API V1 is online and ready.', status: 'Healthy' });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));

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

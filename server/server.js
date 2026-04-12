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
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://saas-project-steel.vercel.app",
    "https://saas-project-fcu1yvm4y-ashif109s-projects.vercel.app",
    "https://saas-project-git-main-ashif109s-projects.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        const isAllowedHost = allowedOrigins.includes(origin) || allowedOrigins.includes(origin + "/");
        const isVercelPreview = origin.endsWith(".vercel.app");

        if (isAllowedHost || isVercelPreview) {
            callback(null, true);
        } else {
            console.warn(`Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
}

module.exports = app;

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

/* ===============================
   CORS CONFIGURATION (IMPORTANT)
================================= */

const allowedOrigins = [
    "https://financetracker07.netlify.app",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (Postman, mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors());

/* ===============================
   BODY PARSER
================================= */
app.use(express.json());

/* ===============================
   ROUTES
================================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/work-entries', require('./routes/workEntries'));
app.use('/api/salary-payments', require('./routes/salaryPayments'));

/* ===============================
   HEALTH CHECK
================================= */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

/* ===============================
   SERVER START
================================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

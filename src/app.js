import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import healthRoute from './routes/healthcheck.routes.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/error.middleware.js';
// import userRoutes from './routes/user.routes.js';
import accountRoutes from './routes/account.routes.js';
import sessionRoutes from './routes/session.routes.js';
import passport from './config/passport.js'
import logger from './config/logger.js';
import { defaultRateLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// Security middleware - should be first
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });
    
    next();
});

// Body parser middleware
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static("public"))

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || "http://localhost:5173",
    credentials: true,
    methods:["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Authorization","Content-Type"]
}))

// Passport initialization
app.use(passport.initialize());

// Apply default rate limiter to all routes
app.use(defaultRateLimiter);

// Routes
app.use("/api/v1/healthcheck",healthRoute)
app.use('/api/v1/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/sessions', sessionRoutes);

// 404 handler
app.use((req, res, next) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler (must be last)
app.use(errorHandler)
export default app;
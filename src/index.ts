import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import patientRoutes from './routes/patient-routes';
import visitRoutes from './routes/visit-routes';
import medicationRoutes from './routes/medication-routes';
import authRoutes from './routes/auth-routes';
import hospitalRoutes from './routes/hospital-routes';
import userRoutes from './routes/user-routes';
import visitWorkflowRoutes from './routes/visit-workflow-routes';
import logger from './config/logger';
import { keepServerAlive } from './utils/keep-alive';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`${req.method} ${req.path} ${duration}ms`);
  });

  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Med OPD Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Hospital and admin routes
app.use('/api', hospitalRoutes);
app.use('/api', userRoutes);

// Patient, visit, and medication routes (protected)
app.use('/api/patients', patientRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/medications', medicationRoutes);

// Two-stage workflow routes (protected)
app.use('/api', visitWorkflowRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Medical OPD Management System API',
    version: '2.0.0',
    description: 'Multi-tenant hospital management system with two-stage consultation workflow',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
      hospitals: {
        create: 'POST /api/admin/hospitals',
        list: 'GET /api/admin/hospitals',
        get: 'GET /api/hospitals/:id',
      },
      users: {
        create: 'POST /api/hospitals/:hospitalId/users',
        list: 'GET /api/hospitals/:hospitalId/users',
      },
      patients: {
        register: 'POST /api/patients/register',
        list: 'GET /api/patients',
        search: 'GET /api/patients/search',
      },
      visits: {
        pending: 'GET /api/visits/pending',
        create: 'POST /api/visits',
        getById: 'GET /api/visits/:id',
        update: 'PUT /api/visits/:id',
      },
      workflow: {
        nurseQueue: 'GET /api/visits/workflow/nurse/queue',
        doctorQueue: 'GET /api/visits/workflow/doctor/queue',
        startPreConsultation: 'POST /api/visits/workflow/:id/start-pre-consultation',
        updatePreConsultation: 'PUT /api/visits/workflow/:id/pre-consultation',
        completePreConsultation: 'POST /api/visits/workflow/:id/complete-pre-consultation',
        startConsultation: 'POST /api/visits/workflow/:id/start-consultation',
        updateConsultation: 'PUT /api/visits/workflow/:id/consultation',
        finalizeVisit: 'POST /api/visits/workflow/:id/finalize',
        cancelVisit: 'POST /api/visits/workflow/:id/cancel',
        getVisit: 'GET /api/visits/workflow/:id',
      },
      medications: '/api/medications',
      health: '/health',
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, _next: Function) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

keepServerAlive()

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

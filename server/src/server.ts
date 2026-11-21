import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { User } from './models/User';
import { Settings } from './models/Settings';
import { sanitizeInput } from './middleware/sanitize';

// Route imports
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import clientRoutes from './routes/clientRoutes';
import adminRoutes from './routes/adminRoutes';
import serviceRoutes from './routes/serviceRoutes';
import skillRoutes from './routes/skillRoutes';
import contactRoutes from './routes/contactRoutes';
import settingsRoutes from './routes/settingsRoutes';
import statsRoutes from './routes/statsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Enable Mongoose query filter sanitization & trust reverse proxy for accurate IP rate limiting
mongoose.set('sanitizeFilter', true);
app.set('trust proxy', 1);

// Global API rate limiter (protects against abuse & DoS)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP. Please try again later.' }
});

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);
app.use('/api', globalApiLimiter);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Freelance Portfolio & Client Platform API'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/stats', statsRoutes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.'
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message =
    isProd && statusCode >= 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Only accept requests after MongoDB is ready, so the frontend does not receive
// empty or failed responses while the database connection is still starting.
connectDB().then(async () => {
  await Promise.all([
    User.updateMany(
      { role: 'admin', name: 'Alex Rivera' },
      { $set: { name: 'Maron Jake Dinopol' } }
    ),
    User.updateMany(
      { role: 'admin', avatar: { $regex: 'photo-1534528741775-53994a69daeb' } },
      { $set: { avatar: '' } }
    ),
    Settings.updateMany(
      { name: 'Alex Rivera' },
      { $set: { name: 'Maron Jake Dinopol' } }
    ),
    Settings.updateMany(
      { email: 'alex@rivera.dev' },
      { $set: { email: 'cloudyuu124@gmail.com' } }
    ),
    Settings.updateMany(
      { 'socialLinks.github': 'https://github.com' },
      { $set: { 'socialLinks.github': 'https://github.com/ForFunn-gg' } }
    ),
    Settings.updateMany(
      { dedicationPercentage: { $lt: 50 } },
      { $set: { dedicationPercentage: 100 }, $unset: { statsOverrides: 1 } }
    ),
    Settings.updateMany(
      { 'statsOverrides.dedication': { $lt: 50 } },
      { $unset: { statsOverrides: 1 } }
    )
  ]);

  app.listen(PORT, () => {
    console.log(`[Server] Portfolio & Client Management API running on port ${PORT}`);
    console.log(`[Server] Accepting requests from: ${CLIENT_URL}`);
  });
}).catch((error) => {
  console.error('[Server] Startup failed:', error);
  process.exit(1);
});

export default app;

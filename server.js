import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';

// Import routes and models
import urlRoutes from './routes/urlRoutes.js';
import Url from './models/Url.js';

// Load environment variables
dotenv.config();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.BASE_URL] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Replace password placeholder if needed
    const finalMongoURI = mongoURI.includes('<db_password>') 
      ? mongoURI.replace('<db_password>', process.env.DB_PASSWORD || 'your_password_here')
      : mongoURI;

    await mongoose.connect(finalMongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🍃 MongoDB connected successfully');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If cloud connection fails, try local fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🔄 Attempting local MongoDB connection...');
        await mongoose.connect('mongodb://localhost:27017/urlshortener', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('🍃 Local MongoDB connected successfully');
      } catch (localError) {
        console.error('❌ Local MongoDB connection failed:', localError.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Health check route - must be before other routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Home route - Display form and recent URLs (must be before urlRoutes)
app.get('/', async (req, res) => {
  try {
    const { success, shortId } = req.query;
    
    // Fetch recent URLs (limit to 10 most recent)
    const urls = await Url.findActive().limit(10);
    
    // If we have a shortId from redirect, get the URL details
    let urlDetails = null;
    if (shortId) {
      urlDetails = await Url.findOne({ shortId });
    }

    res.render('index', {
      title: 'Home',
      baseUrl: process.env.BASE_URL || 'http://localhost:5000',
      urls,
      success,
      shortId: urlDetails ? urlDetails.shortId : null,
      originalUrl: urlDetails ? urlDetails.originalUrl : null
    });

  } catch (error) {
    console.error('❌ Error loading home page:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Unable to load the page. Please try again later.',
      backUrl: '/'
    });
  }
});

// API route to get all URLs (for potential frontend integration) - must be before urlRoutes
app.get('/api/urls', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const urls = await Url.findActive()
      .skip(skip)
      .limit(limit);
    
    const total = await Url.countDocuments({ isActive: true });

    res.json({
      urls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUrls: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mount URL routes (including /:shortId catch-all) - must be after specific routes
app.use('/', urlRoutes);

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you\'re looking for doesn\'t exist.',
    backUrl: '/'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  
  res.status(500).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end. Please try again later.'
      : error.message,
    backUrl: '/'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('🚀 Smart URL Shortener Server Started');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Visit: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📊 Health check available at /health');
  console.log('─'.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});

export default app;
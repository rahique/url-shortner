import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Url from './models/Url.js';
import { nanoid } from 'nanoid';

// Load environment variables
dotenv.config();

/**
 * Simple test script to verify database connection and basic functionality
 */
async function runTests() {
  try {
    console.log('🧪 Starting URL Shortener Tests...\n');

    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const mongoURI = process.env.MONGO_URI?.replace('<db_password>', process.env.DB_PASSWORD || 'test');
    
    if (!mongoURI || mongoURI.includes('YOUR_PASSWORD_HERE')) {
      console.log('⚠️  Using local MongoDB for testing (no cloud credentials provided)');
      await mongoose.connect('mongodb://localhost:27017/urlshortener_test');
    } else {
      await mongoose.connect(mongoURI);
    }
    
    console.log('✅ Database connected successfully\n');

    // Test 2: Create a test URL
    console.log('2️⃣ Testing URL creation...');
    const testUrl = new Url({
      shortId: nanoid(8),
      originalUrl: 'https://example.com/test-url-' + Date.now()
    });
    
    await testUrl.save();
    console.log(`✅ URL created: ${testUrl.shortId} → ${testUrl.originalUrl}\n`);

    // Test 3: Find and update URL
    console.log('3️⃣ Testing URL lookup and click increment...');
    const foundUrl = await Url.findOne({ shortId: testUrl.shortId });
    if (foundUrl) {
      await foundUrl.incrementClicks();
      console.log(`✅ URL found and clicks incremented: ${foundUrl.clicks} clicks\n`);
    }

    // Test 4: List recent URLs
    console.log('4️⃣ Testing URL listing...');
    const urls = await Url.findActive().limit(5);
    console.log(`✅ Found ${urls.length} active URLs\n`);

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await Url.deleteOne({ shortId: testUrl.shortId });
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! Your URL shortener is ready to use.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure MongoDB is running or update your .env file with correct credentials');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run tests
runTests();
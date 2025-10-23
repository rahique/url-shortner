import express from 'express';
import { nanoid } from 'nanoid';
import validator from 'validator';
import Url from '../models/Url.js';

const router = express.Router();

/**
 * POST /shorten - Create a shortened URL
 */
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl } = req.body;

    // Validate URL
    if (!originalUrl) {
      return res.status(400).render('error', {
        title: 'Error',
        message: 'Please provide a URL to shorten',
        backUrl: '/'
      });
    }

    // Normalize URL - add protocol if missing
    let normalizedUrl = originalUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Validate URL format
    if (!validator.isURL(normalizedUrl, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      return res.status(400).render('error', {
        title: 'Invalid URL',
        message: 'Please enter a valid URL (e.g., https://example.com)',
        backUrl: '/'
      });
    }

    // Check if URL already exists
    let existingUrl = await Url.findOne({ originalUrl: normalizedUrl });
    if (existingUrl) {
      console.log(`📋 Existing URL found: ${existingUrl.shortId}`);
      return res.redirect('/?success=existing&shortId=' + existingUrl.shortId);
    }

    // Generate unique short ID
    let shortId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      shortId = nanoid(8); // Generate 8-character ID
      const existing = await Url.findOne({ shortId });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique short ID');
    }

    // Create new URL record
    const newUrl = new Url({
      shortId,
      originalUrl: normalizedUrl
    });

    await newUrl.save();

    console.log(`✅ URL shortened: ${normalizedUrl} → ${shortId}`);
    res.redirect('/?success=created&shortId=' + shortId);

  } catch (error) {
    console.error('❌ Error shortening URL:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong while shortening your URL. Please try again.',
      backUrl: '/'
    });
  }
});

/**
 * GET /:shortId - Redirect to original URL
 * Only match alphanumeric strings of 6-10 characters (typical nanoid length)
 */
router.get('/:shortId([A-Za-z0-9_-]{6,10})', async (req, res) => {
  try {
    const { shortId } = req.params;

    // Validate shortId format
    if (!shortId || shortId.length < 6) {
      return res.status(404).render('error', {
        title: 'URL Not Found',
        message: 'The shortened URL you\'re looking for doesn\'t exist.',
        backUrl: '/'
      });
    }

    // Find URL and increment clicks
    const url = await Url.findOne({ shortId, isActive: true });

    if (!url) {
      console.log(`❌ Short URL not found: ${shortId}`);
      return res.status(404).render('error', {
        title: 'URL Not Found',
        message: 'The shortened URL you\'re looking for doesn\'t exist or has been deactivated.',
        backUrl: '/'
      });
    }

    // Increment clicks and update last clicked
    await url.incrementClicks();

    console.log(`🔗 Redirecting: ${shortId} → ${url.originalUrl} (${url.clicks} clicks)`);
    
    // Redirect to original URL
    res.redirect(url.originalUrl);

  } catch (error) {
    console.error('❌ Error redirecting:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'Something went wrong while redirecting. Please try again.',
      backUrl: '/'
    });
  }
});

/**
 * GET /api/stats/:shortId - Get URL statistics (JSON API)
 */
router.get('/api/stats/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    
    const url = await Url.findOne({ shortId, isActive: true });
    
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      shortId: url.shortId,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      lastClicked: url.lastClicked
    });

  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
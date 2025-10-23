# BAIUST Computer Club URL Shortener 🔗

A modern, full-featured URL shortener web application built specifically for **BAIUST Computer Club** and the university community. Built with Node.js, Express, EJS, and MongoDB. Create short, memorable links with detailed analytics and a beautiful user interface that reflects our club's identity.

![BAIUST Computer Club URL Shortener](https://via.placeholder.com/800x400/22c55e/white?text=BAIUST+Computer+Club+URL+Shortener)

## 🏫 About BAIUST Computer Club

This URL shortener is proudly developed by the **Computer Club** of **Bangladesh Army International University of Science & Technology (BAIUST)**. It serves our university community with a professional, branded solution for link management.

## ✨ Features

- **🚀 Fast URL Shortening**: Generate short URLs instantly with custom IDs
- **📊 Analytics Dashboard**: Track clicks, creation dates, and usage statistics
- **🎨 BAIUST Branded UI**: Beautiful, responsive design with official club branding
- **🔒 Secure**: Input validation, rate limiting, and security headers
- **🐳 Dockerized**: Easy deployment with Docker and Docker Compose
- **📱 Mobile Friendly**: Responsive design works on all devices
- **🌐 Production Ready**: Configured for cloud deployment (Render, Railway, etc.)
- **🏫 University Focused**: Built specifically for our BAIUST community needs## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: EJS (Embedded JavaScript Templates)
- **Database**: MongoDB with Mongoose ODM
- **ID Generation**: nanoid for unique short IDs
- **Styling**: Modern CSS with gradient backgrounds
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet.js, CORS, input validation

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- Docker and Docker Compose (for containerized deployment)
- MongoDB Atlas account (for cloud database) or local MongoDB

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB credentials
   ```

3. **Start with Docker Compose**

   ```bash
   # Development with local MongoDB
   docker-compose up -d

   # Production mode
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Access the application**
   - Main app: http://localhost:5000
   - MongoDB Express (dev): http://localhost:8081
   - Health check: http://localhost:5000/health

### Option 2: Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Update MONGO_URI with your database connection string
   ```

3. **Start the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/urlshortener
BASE_URL=http://localhost:5000
NODE_ENV=development
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get the connection string
5. Replace `<db_password>` with your actual password
6. Update the `MONGO_URI` in your `.env` file

## 📁 Project Structure

```
url-shortener/
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── Dockerfile             # Docker container configuration
├── docker-compose.yml     # Multi-container setup
├── models/
│   └── Url.js            # MongoDB schema for URLs
├── routes/
│   └── urlRoutes.js      # API routes for URL operations
├── views/
│   ├── index.ejs         # Main page template
│   └── error.ejs         # Error page template
└── public/
    └── style.css         # CSS styles
```

## 🎯 API Endpoints

### Web Routes

- `GET /` - Home page with URL shortener form
- `POST /shorten` - Create a new short URL
- `GET /:shortId` - Redirect to original URL

### API Routes

- `GET /health` - Health check endpoint
- `GET /api/urls` - Get all URLs with pagination
- `GET /api/stats/:shortId` - Get statistics for a specific URL

## 🐳 Docker Commands

```bash
# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Remove volumes (caution: deletes data)
docker-compose down -v

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🚀 Deployment

### Render.com

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Node Version: 18+

### Railway

1. Connect your GitHub repository
2. Set environment variables
3. Railway will auto-detect Node.js and deploy

### Manual Server Deployment

```bash
# Clone and setup
git clone <repository-url>
cd url-shortener
npm install --production

# Set environment variables
export NODE_ENV=production
export MONGO_URI=your-mongodb-connection-string
export BASE_URL=https://yourdomain.com

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "url-shortener"
pm2 startup
pm2 save
```

## 🔍 Monitoring

### Health Check

Visit `/health` to see application status:

```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "Connected",
  "version": "1.0.0"
}
```

### Docker Health Checks

Both the app and MongoDB containers include health checks for monitoring.

## 🔐 Security Features

- **Input Validation**: URL format validation and sanitization
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Properly configured cross-origin requests
- **Rate Limiting**: Protection against abuse (can be added)
- **Error Handling**: Graceful error handling and user feedback

## 🎨 Customization

### Styling

Edit `public/style.css` to customize the appearance:

- Colors and gradients
- Typography and spacing
- Mobile responsiveness
- Animation effects

### Features

- Add user authentication
- Implement custom domains
- Add QR code generation
- Create API rate limiting
- Add bulk URL processing

## 📊 Analytics

The application tracks:

- Total clicks per URL
- Creation timestamps
- Last clicked timestamps
- Active/inactive status

Access analytics through:

- Web interface (main page)
- API endpoint `/api/stats/:shortId`

## 🐛 Troubleshooting

### Common Issues

**Connection Refused**

```bash
# Check if MongoDB is running
docker-compose logs mongo

# Restart services
docker-compose restart
```

**Port Already in Use**

```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
```

**Database Connection Failed**

- Verify MongoDB connection string
- Check network connectivity
- Ensure database user has proper permissions

### Debug Mode

Run with debug logging:

```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [nanoid](https://github.com/ai/nanoid) - ID generator
- [EJS](https://ejs.co/) - Template engine
- [Docker](https://www.docker.com/) - Containerization

---

**BAIUST Computer Club**
# url-shortner

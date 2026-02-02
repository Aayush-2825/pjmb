# 🚀 Quick Start Guide

## Installation (First Time Setup)

```bash
# 1. Install dependencies
npm install

# 2. Install additional security packages (if not already done)
npm install helmet express-rate-limit

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env file with your values
# Required: MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, RESEND_API_KEY
```

## Running the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Important Files

### Configuration
- `.env` - Your environment variables (DO NOT COMMIT)
- `.env.example` - Template for environment variables
- `src/config/logger.js` - Winston logger setup
- `src/config/passport.js` - OAuth strategies

### Security
- `src/middlewares/validate.middleware.js` - Input validation
- `src/middlewares/rateLimit.middleware.js` - Rate limiting
- `src/validators/` - Zod validation schemas

### Documentation
- `README.md` - Full project documentation
- `API_DOCS.md` - API endpoint reference
- `CONTRIBUTING.md` - How to contribute
- `CHANGELOG.md` - Version history

## Common Commands

```bash
# View logs
cat logs/combined.log
cat logs/error.log

# Clear logs
rm -rf logs/*.log

# Check for errors
npm run dev  # Will show any startup errors

# Test specific endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123456"}'
```

## Environment Variables (Required)

```env
# Database
MONGO_URI=mongodb://localhost:27017/your-db

# Security
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Email
RESEND_API_KEY=your-resend-api-key

# App
APP_ORIGIN=http://localhost:3000
CORS_ORIGIN=http://localhost:5173
```

## Rate Limits (Current Settings)

| Endpoint | Limit | Window |
|----------|-------|--------|
| Register | 3 requests | 1 hour |
| Login | 10 requests | 15 minutes |
| 2FA | 5 requests | 10 minutes |
| Password Reset | 3 requests | 1 hour |
| Email Resend | 3 requests | 15 minutes |
| General API | 100 requests | 15 minutes |

## Troubleshooting

### "Cannot find module 'helmet'"
```bash
npm install helmet express-rate-limit
```

### "MONGO_URI is not defined"
```bash
# Check your .env file exists and has MONGO_URI
cat .env | grep MONGO_URI
```

### "Port 3000 already in use"
```bash
# Change PORT in .env or kill existing process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Rate limit errors during development
- Adjust limits in `.env`
- Or clear rate limit cache (restart server)

## Next Steps

1. ✅ Set up your `.env` file
2. ✅ Run `npm run dev`
3. ✅ Test with Postman/Thunder Client
4. ✅ Read full documentation in README.md
5. ✅ Write tests for your use cases

## Useful Links

- 📖 [Full Documentation](README.md)
- 🔌 [API Reference](API_DOCS.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 📝 [Changelog](CHANGELOG.md)
- 📋 [Implementation Details](IMPLEMENTATION.md)

---

**Need Help?** Open an issue or check the documentation!

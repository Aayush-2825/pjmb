# Authentication Backend API

A secure, production-ready authentication backend built with Node.js, Express, MongoDB, and Passport.js. Features include email/password authentication, Google OAuth, two-factor authentication (2FA), session management, and comprehensive security measures.

## ✨ Features

### Authentication
- 🔐 **Email/Password Authentication** - Secure credential-based login with bcrypt hashing
- 🔑 **Google OAuth 2.0** - Single sign-on with Google accounts
- ✉️ **Email Verification** - Verify user email addresses with secure tokens
- 🔄 **Password Reset** - Secure password reset flow with email tokens
- 🔓 **JWT-based Sessions** - Access and refresh token management with rotation

### Security
- 🛡️ **Two-Factor Authentication (2FA)** - TOTP-based 2FA with QR codes
- 🔢 **Recovery Codes** - Backup codes for 2FA account recovery
- 🚦 **Rate Limiting** - Protection against brute force attacks
- 🔒 **Helmet.js** - Security headers (CSP, HSTS, etc.)
- ✅ **Input Validation** - Zod schema validation for all endpoints
- 🔐 **Password Policies** - Enforced strong password requirements
- 🔓 **Account Locking** - Automatic lockout after failed 2FA attempts

### Session Management
- 📱 **Multiple Sessions** - Support for multiple concurrent sessions
- 🔍 **Session Tracking** - Track device, IP, and user agent
- ⏰ **Session Expiration** - Automatic session cleanup with TTL indexes
- 🗑️ **Session Revocation** - Revoke individual or all sessions

### Logging & Monitoring
- 📝 **Winston Logger** - Structured logging with multiple transports
- 📊 **Request Logging** - Track all API requests with timing
- ⚠️ **Error Logging** - Comprehensive error tracking and stack traces
- 🔍 **Audit Trails** - Log sensitive operations

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/your-database
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   RESEND_API_KEY=your-resend-api-key
   APP_ORIGIN=http://localhost:3000
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

Base URL: `/api/v1`

### Authentication Endpoints

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

**Response (2FA Required):**
```json
{
  "success": true,
  "data": {
    "mfaRequired": true
  },
  "message": "2FA code required"
}
```

#### Login with 2FA
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "loginCode": "123456"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <accessToken>
```

### Email Verification

#### Verify Email
```http
POST /api/v1/auth/verify/email?code=<verification-code>
```

#### Resend Verification Email
```http
POST /api/v1/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Password Reset

#### Request Password Reset
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password?code=<reset-code>
Content-Type: application/json

{
  "password": "NewSecurePass123"
}
```

### Two-Factor Authentication

All 2FA endpoints require authentication via `Authorization: Bearer <accessToken>`.

#### Setup 2FA
```http
POST /api/v1/auth/2fa/setup
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otpAuthUrl": "otpauth://totp/...",
    "qrCode": "data:image/png;base64,..."
  },
  "message": "Scan QR and verify OTP"
}
```

#### Enable 2FA
```http
POST /api/v1/auth/2fa/enable
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recoveryCodes": ["abc123", "def456", ...]
  },
  "message": "2FA enabled — save recovery codes"
}
```

⚠️ **Important:** Display recovery codes to the user immediately. They cannot be retrieved later.

#### Verify 2FA (Test)
```http
POST /api/v1/auth/2fa/verify
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "otp": "123456"
}
```

#### Disable 2FA
```http
POST /api/v1/auth/2fa/disable
Authorization: Bearer <accessToken>
```

#### Get 2FA Status
```http
GET /api/v1/auth/2fa/status
Authorization: Bearer <accessToken>
```

### Session Management

#### List All Sessions
```http
GET /api/v1/sessions
Authorization: Bearer <accessToken>
```

#### Revoke Specific Session
```http
DELETE /api/v1/sessions/<session-id>
Authorization: Bearer <accessToken>
```

#### Revoke All Sessions
```http
DELETE /api/v1/sessions
Authorization: Bearer <accessToken>
```

### Google OAuth

#### Initiate Google Login
```http
GET /api/v1/auth/google
```
Redirects to Google OAuth consent screen.

#### Google Callback (handled automatically)
```http
GET /api/v1/auth/google/callback
```

## 🛡️ Security Features

### Rate Limiting
Different endpoints have different rate limits:
- **Registration**: 3 requests per hour per IP
- **Login**: 10 attempts per 15 minutes per IP
- **2FA Verification**: 5 attempts per 10 minutes per IP
- **Password Reset**: 3 requests per hour per IP
- **Email Resend**: 3 requests per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Security Headers (via Helmet)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### 2FA Lockout Policy
- After 5 failed 2FA attempts, account is locked for 10 minutes
- Recovery codes can be used as backup
- Each recovery code is single-use

## 📁 Project Structure

```
src/
├── config/
│   ├── logger.js          # Winston logger configuration
│   └── passport.js         # Passport strategies (Google OAuth)
├── controllers/
│   ├── account.controller.js
│   ├── auth.controller.js
│   ├── healthcheck.controller.js
│   ├── session.controller.js
│   └── twofactor.controller.js
├── db/
│   └── index.js            # MongoDB connection
├── middlewares/
│   ├── error.middleware.js # Global error handler
│   ├── rateLimit.middleware.js # Rate limiting configs
│   ├── requireAuth.js      # JWT authentication middleware
│   └── validate.middleware.js # Zod validation middleware
├── models/
│   ├── account.model.js    # Account schema (credentials/OAuth)
│   ├── session.model.js    # Session schema
│   ├── user.model.js       # User schema
│   └── verification.model.js # Verification tokens
├── routes/
│   ├── account.routes.js
│   ├── auth.routes.js
│   ├── healthcheck.routes.js
│   ├── session.routes.js
│   └── user.routes.js
├── utils/
│   ├── api-error.js        # Custom error class
│   ├── api-response.js     # Standardized response format
│   ├── async-handler.js    # Async error wrapper
│   ├── bcrypt.js           # Password hashing utilities
│   ├── constants.js        # Application constants
│   ├── date-time.js        # Date manipulation helpers
│   ├── generate-secret.js  # 2FA secret generation
│   ├── jwt.js              # JWT token utilities
│   ├── recovery-code.js    # Recovery code utilities
│   ├── sendMail.js         # Email sending (Resend)
│   └── Token.js            # Verification token utilities
├── validators/
│   ├── auth.validator.js   # Auth endpoint schemas
│   ├── session.validator.js # Session endpoint schemas
│   └── twofactor.validator.js # 2FA endpoint schemas
├── app.js                  # Express app configuration
└── index.js                # Server entry point
```

## 🔧 Configuration

### Environment Variables

See [`.env.example`](.env.example) for all available configuration options.

**Required variables:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `RESEND_API_KEY` - API key for email service
- `APP_ORIGIN` - Your application URL
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)

**Optional variables:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `LOG_LEVEL` - Logging level (default: info)
- `LOG_FILE_PATH` - Log directory (default: ./logs)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `${APP_ORIGIN}/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Email Service (Resend)

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Verify your domain (for production)
4. Add API key to `.env`

## 📊 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

Log files rotate when they reach 5MB, keeping 5 historical files.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Note:** Test suite is currently being developed. Jest and Supertest are configured.

## 🐛 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `423` - Locked (e.g., 2FA account locked)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique secrets for JWT keys
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB replica set (recommended)
- [ ] Configure Redis for session storage (optional)
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Enable automated backups
- [ ] Review and adjust rate limits

### Docker Deployment (Coming Soon)

A Dockerfile and docker-compose.yml will be added for easy containerized deployment.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

ISC License

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Passport.js](http://www.passportjs.org/)
- [Mongoose](https://mongoosejs.com/)
- [Winston](https://github.com/winstonjs/winston)
- [Helmet](https://helmetjs.github.io/)
- [Zod](https://zod.dev/)
- [Speakeasy](https://github.com/speakeasyjs/speakeasy)

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Made with ❤️ using Node.js and Express

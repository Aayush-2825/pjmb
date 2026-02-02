# 🚀 Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Configuration
- [ ] Create production `.env` file
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique `JWT_SECRET` (min 64 characters)
- [ ] Use strong, unique `JWT_REFRESH_SECRET` (min 64 characters)
- [ ] Configure production `MONGO_URI` (preferably Atlas/managed service)
- [ ] Set production `APP_ORIGIN` to actual domain
- [ ] Configure `CORS_ORIGIN` with actual frontend URL(s)
- [ ] Set up `RESEND_API_KEY` with verified domain
- [ ] Set `FROM_EMAIL` with verified domain email

### Database
- [ ] Use MongoDB replica set or managed service
- [ ] Set up database backups (automated)
- [ ] Configure connection pooling
- [ ] Set up database monitoring
- [ ] Create indexes (automatically done on first run)
- [ ] Test database connection from production server

### Security
- [ ] Enable HTTPS/SSL (required!)
- [ ] Configure proper CORS origins (no wildcards)
- [ ] Review and adjust rate limits for production traffic
- [ ] Set up firewall rules
- [ ] Ensure secrets are in environment variables (not hardcoded)
- [ ] Review security headers configuration
- [ ] Enable content security policy
- [ ] Set up DDoS protection (Cloudflare, etc.)

### Google OAuth (if using)
- [ ] Update Google OAuth redirect URI with production domain
- [ ] Test OAuth flow in production-like environment
- [ ] Verify Google client ID and secret are production credentials

### Email Configuration
- [ ] Verify domain in Resend
- [ ] Set up SPF, DKIM, DMARC records
- [ ] Test email delivery
- [ ] Configure email templates
- [ ] Set up email monitoring

### Logging
- [ ] Configure log retention policy
- [ ] Set up log aggregation (CloudWatch, DataDog, etc.)
- [ ] Configure log alerts for errors
- [ ] Test log rotation
- [ ] Ensure sensitive data is not logged

### Monitoring & Alerts
- [ ] Set up application monitoring (New Relic, Sentry, etc.)
- [ ] Configure error tracking and notifications
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up database monitoring
- [ ] Create alerts for:
  - [ ] High error rates
  - [ ] High response times
  - [ ] Database connection issues
  - [ ] High memory/CPU usage
  - [ ] Failed authentication attempts spike

## Deployment

### Code Preparation
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm audit` - no critical vulnerabilities
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md
- [ ] Create git tag for release
- [ ] Build production bundle (if applicable)

### Server Setup
- [ ] Node.js LTS version installed
- [ ] PM2 or similar process manager configured
- [ ] Nginx or similar reverse proxy configured
- [ ] SSL certificates installed and configured
- [ ] Firewall configured (only necessary ports open)
- [ ] Set up auto-restart on crash
- [ ] Configure server monitoring

### Initial Deployment
- [ ] Deploy code to production server
- [ ] Install dependencies: `npm ci --production`
- [ ] Create logs directory: `mkdir logs`
- [ ] Set proper file permissions
- [ ] Start application: `npm start` or `pm2 start`
- [ ] Verify application is running
- [ ] Check logs for errors: `cat logs/error.log`

### Post-Deployment Testing
- [ ] Test health check endpoint
- [ ] Test user registration
- [ ] Test login flow
- [ ] Test email sending
- [ ] Test 2FA setup and verification
- [ ] Test session management
- [ ] Test Google OAuth (if enabled)
- [ ] Test password reset flow
- [ ] Test rate limiting
- [ ] Test error responses
- [ ] Load test critical endpoints

### Monitoring (First 24 Hours)
- [ ] Monitor error logs continuously
- [ ] Check response times
- [ ] Verify email delivery
- [ ] Monitor database performance
- [ ] Check memory/CPU usage
- [ ] Verify rate limiting is working
- [ ] Check for any security issues

## Post-Deployment

### Documentation
- [ ] Update production API documentation
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

### Backup & Recovery
- [ ] Verify database backups are running
- [ ] Test database restore procedure
- [ ] Document disaster recovery plan
- [ ] Set up backup monitoring

### Performance
- [ ] Review and optimize slow queries
- [ ] Implement caching where needed
- [ ] Consider CDN for static assets
- [ ] Monitor and optimize bundle size

### Security Audit
- [ ] Run security scan (npm audit, Snyk)
- [ ] Review authentication flows
- [ ] Test rate limiting effectiveness
- [ ] Review CORS configuration
- [ ] Check for exposed secrets
- [ ] Review user permissions

## Rollback Plan

If issues occur:

1. **Immediate Issues**
   ```bash
   # Stop the application
   pm2 stop all
   
   # Revert to previous version
   git checkout <previous-tag>
   npm ci --production
   pm2 start all
   ```

2. **Database Issues**
   - Have backup ready
   - Document rollback steps
   - Test rollback in staging first

3. **Communication**
   - Notify users of issues
   - Post status updates
   - Document the incident

## Production Environment Variables

```env
# Required Production Settings
NODE_ENV=production
PORT=3000

# Security (use strong, unique values)
JWT_SECRET=<64+ character random string>
JWT_REFRESH_SECRET=<64+ character random string>

# Database (use connection string with auth)
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Application URLs
APP_ORIGIN=https://yourdomain.com
CORS_ORIGIN=https://app.yourdomain.com

# Email (verified domain)
RESEND_API_KEY=<production-api-key>
FROM_EMAIL=noreply@yourdomain.com

# OAuth (production credentials)
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>

# Logging
LOG_LEVEL=warn
LOG_FILE_PATH=/var/log/app

# Rate Limiting (adjust based on traffic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Production Commands

```bash
# Start with PM2
pm2 start src/index.js --name auth-api

# Check status
pm2 status

# View logs
pm2 logs auth-api

# Restart
pm2 restart auth-api

# Stop
pm2 stop auth-api

# Save PM2 config
pm2 save

# Auto-start on server reboot
pm2 startup
```

## Nginx Configuration Example

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Final Checks

- [ ] All items above completed
- [ ] Team notified of deployment
- [ ] Monitoring dashboards open
- [ ] Emergency contacts available
- [ ] Rollback plan ready
- [ ] Documentation updated

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Version:** _______________

**Notes:** _______________

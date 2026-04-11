# Backend API Documentation

Base URL: `/api/v1`

## Response Envelope

Success responses use a consistent envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Success",
  "sucess": true
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "body.email", "message": "Invalid email format" }
  ]
}
```

Notes:
- The success envelope includes the field `sucess` (spelling from code).
- Error responses use `success: false`.

## Common Errors and Rate Limits

Common error status codes:
- `400` validation errors or missing fields
- `401` invalid credentials or expired session
- `403` email not verified
- `404` resource not found
- `409` conflict (e.g., user already exists)
- `423` 2FA temporarily locked after too many failed attempts
- `429` rate limit exceeded

Rate limits:
- Default (all routes): 100 requests per 15 minutes per IP (configurable via `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`)
- `POST /auth/register`: 3 per hour per IP
- `POST /auth/login`: 10 per 15 minutes per IP (successful logins not counted)
- `POST /auth/forgot-password`: 3 per hour per IP
- `POST /auth/resend-verification`: 3 per 15 minutes per IP
- `POST /auth/2fa/verify`: 5 per 10 minutes per IP (successful verifications not counted)

## Authentication

### Register
**POST** `/auth/register`

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Validation:
- `name`: 3-60 chars
- `email`: valid email
- `password`: 8-100 chars, at least 1 lowercase, 1 uppercase, 1 number

Response: `201 Created`
```json
{
  "statusCode": 201,
  "data": { "user": { "id": "...", "email": "john@example.com" } },
  "message": "Verify your email.",
  "sucess": true
}
```

### Login
**POST** `/auth/login`

Body:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Optional 2FA fields:
```json
{
  "loginCode": "123456"
}
```
or
```json
{
  "recoveryCode": "..."
}
```

Validation:
- `email`: valid email
- `password`: required
- `loginCode`: 6 digits (optional)
- `recoveryCode`: string (optional)

Response (success): `200 OK`
```json
{
  "statusCode": 200,
  "data": { "accessToken": "...", "refreshToken": "..." },
  "message": "Login successful",
  "sucess": true
}
```

Response (2FA required): `200 OK`
```json
{
  "statusCode": 200,
  "data": { "mfaRequired": true },
  "message": "2FA code required",
  "sucess": true
}
```

Error (locked): `423 Locked`
```json
{
  "success": false,
  "message": "2FA account is temporarily locked due to too many failed attempts",
  "errors": []
}
```

### Logout
**POST** `/auth/logout`

Headers: `Authorization: Bearer <accessToken>`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Logged out",
  "sucess": true
}
```

### Refresh Token (Rotation)
**POST** `/auth/refresh`

Body:
```json
{ "refreshToken": "..." }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "accessToken": "...", "refreshToken": "..." },
  "message": "Refreshed",
  "sucess": true
}
```

Errors:
- `401` if missing/invalid token
- `401` with message "Security alert: Token reuse detected" when reuse is detected

### Verify Email
**POST** `/auth/verify/email?code=<verificationCode>`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "user": { "id": "..." } },
  "message": "Verified",
  "sucess": true
}
```

### Resend Verification Email
**POST** `/auth/resend-verification`

Body:
```json
{ "email": "john@example.com" }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Email sent",
  "sucess": true
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Body:
```json
{ "email": "john@example.com" }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Email sent if account exists",
  "sucess": true
}
```

### Reset Password
**POST** `/auth/reset-password?code=<resetCode>`

Body:
```json
{ "password": "SecurePass123" }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Password reset successful",
  "sucess": true
}
```

### Current User
**GET** `/auth/me`

Headers: `Authorization: Bearer <accessToken>`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "user": { "id": "...", "email": "...", "name": "..." } },
  "message": "Profile",
  "sucess": true
}
```

### Google OAuth
**GET** `/auth/google`

Starts Google OAuth login (redirect).

**GET** `/auth/google/callback`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "accessToken": "...", "refreshToken": "..." },
  "message": "Google login successful",
  "sucess": true
}
```

## Two-Factor Authentication

All 2FA endpoints require `Authorization: Bearer <accessToken>`.

### Setup
**POST** `/auth/2fa/setup`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "otpAuthUrl": "otpauth://...", "qrCode": "data:image/..." },
  "message": "Scan QR and verify OTP",
  "sucess": true
}
```

### Enable
**POST** `/auth/2fa/enable`

Body:
```json
{ "otp": "123456" }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "recoveryCodes": ["...", "..."] },
  "message": "2FA enabled — save recovery codes",
  "sucess": true
}
```

### Verify (Test)
**POST** `/auth/2fa/verify`

Body:
```json
{ "otp": "123456" }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "OTP verified",
  "sucess": true
}
```

### Disable
**POST** `/auth/2fa/disable`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "2FA disabled",
  "sucess": true
}
```

### Status
**GET** `/auth/2fa/status`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "enabled": true, "enabledAt": "2024-02-01T10:00:00.000Z" },
  "message": "2FA status",
  "sucess": true
}
```

### Generate New Recovery Codes
**POST** `/auth/2fa/recovery/generate`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "recoveryCodes": ["...", "..."] },
  "message": "New recovery codes generated — save them securely",
  "sucess": true
}
```

### Verify Recovery Code
**POST** `/auth/2fa/recovery/verify`

Body:
```json
{ "recoveryCode": "..." }
```

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Recovery code accepted",
  "sucess": true
}
```

## Accounts

Manage linked login accounts. Requires `Authorization: Bearer <accessToken>`.

### List Accounts
**GET** `/accounts`

Response: `200 OK`
```json
{
  "success": true,
  "message": "Accounts fetched successfully",
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "provider": "credentials",
      "providerAccountId": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Disconnect Account
**DELETE** `/accounts/:id`

Response: `200 OK`
```json
{
  "success": true,
  "message": "Account disconnected successfully"
}
```

Errors:
- `400` if it is the only login method
- `404` if account not found

## Sessions

Manage active sessions/devices. Requires `Authorization: Bearer <accessToken>`.

### List Sessions
**GET** `/sessions`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "ipAddress": "...",
      "userAgent": "...",
      "createdAt": "...",
      "updatedAt": "...",
      "revokedAt": null
    }
  ],
  "message": "All listed sessions",
  "sucess": true
}
```

### Revoke Session
**DELETE** `/sessions/:id`

Params:
- `id`: 24-char hex session id

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "_id": "..." },
  "message": "Session revoked successfully",
  "sucess": true
}
```

### Revoke All Sessions
**DELETE** `/sessions`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "deletedCount": 3 },
  "message": "All sessions revoked successfully",
  "sucess": true
}
```

## Health

**GET** `/healthcheck`

Response: `200 OK`
```json
{
  "statusCode": 200,
  "data": { "message": "Server is running" },
  "message": "Success",
  "sucess": true
}
```

## Example Requests (curl)

Set your base URL:
```bash
BASE_URL="http://localhost:3000/api/v1"
```

### Auth

Register:
```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'
```

Login:
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```

Login with 2FA code:
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123","loginCode":"123456"}'
```

Login with recovery code:
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123","recoveryCode":"RECOVERY_CODE"}'
```

Logout:
```bash
curl -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Refresh token:
```bash
curl -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

Verify email:
```bash
curl -X POST "$BASE_URL/auth/verify/email?code=VERIFICATION_CODE"
```

Resend verification:
```bash
curl -X POST "$BASE_URL/auth/resend-verification" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

Forgot password:
```bash
curl -X POST "$BASE_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

Reset password:
```bash
curl -X POST "$BASE_URL/auth/reset-password?code=RESET_CODE" \
  -H "Content-Type: application/json" \
  -d '{"password":"SecurePass123"}'
```

Get current user:
```bash
curl "$BASE_URL/auth/me" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Google OAuth start (browser redirect):
```bash
curl -L "$BASE_URL/auth/google"
```

Google OAuth callback (normally handled by browser):
```bash
curl -L "$BASE_URL/auth/google/callback"
```

### Two-Factor Authentication

Setup 2FA:
```bash
curl -X POST "$BASE_URL/auth/2fa/setup" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Enable 2FA:
```bash
curl -X POST "$BASE_URL/auth/2fa/enable" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}'
```

Verify OTP:
```bash
curl -X POST "$BASE_URL/auth/2fa/verify" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp":"123456"}'
```

Disable 2FA:
```bash
curl -X POST "$BASE_URL/auth/2fa/disable" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

2FA status:
```bash
curl "$BASE_URL/auth/2fa/status" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Generate new recovery codes:
```bash
curl -X POST "$BASE_URL/auth/2fa/recovery/generate" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Verify recovery code:
```bash
curl -X POST "$BASE_URL/auth/2fa/recovery/verify" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recoveryCode":"RECOVERY_CODE"}'
```

### Accounts

List accounts:
```bash
curl "$BASE_URL/accounts" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Disconnect account:
```bash
curl -X DELETE "$BASE_URL/accounts/ACCOUNT_ID" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Sessions

List sessions:
```bash
curl "$BASE_URL/sessions" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Revoke one session:
```bash
curl -X DELETE "$BASE_URL/sessions/SESSION_ID" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Revoke all sessions:
```bash
curl -X DELETE "$BASE_URL/sessions" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Health

Health check:
```bash
curl "$BASE_URL/healthcheck"
```

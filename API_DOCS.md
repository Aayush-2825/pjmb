# Backend API Documentation

Base URL: `/api/v1`

## Authentication (`/auth`)

### Register
**POST** `/auth/register`
- **Body**: `{ "name": "John Doe", "email": "john@example.com", "password": "securePass123" }`
- **Response**: `201 Created`
  ```json
  { "data": { "user": { "id": "...", "email": "..." } }, "message": "Verify your email." }
  ```

### Login
**POST** `/auth/login`
- **Body**: `{ "email": "john@example.com", "password": "securePass123" }`
- **Response (Success)**: `200 OK`
  ```json
  { "data": { "accessToken": "...", "refreshToken": "..." }, "message": "Login successful" }
  ```
- **Response (2FA Required)**: `200 OK`
  ```json
  { "data": { "mfaRequired": true }, "message": "2FA code required" }
  ```
  *Note: If `mfaRequired` is true, you must call Login again with `loginCode` or `recoveryCode`.*

### Login (Step 2 - 2FA)
**POST** `/auth/login`
- **Body**: 
  ```json
  { 
    "email": "john@example.com", 
    "password": "securePass123",
    "loginCode": "123456" 
  }
  // OR use "recoveryCode": "..."
  ```
- **Response**: `200 OK` (Standard Tokens)
- **Error (Locked)**: `423 Locked` - "2FA account is temporarily locked..."

### Logout
**POST** `/auth/logout`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `200 OK`

### Refresh Token
**POST** `/auth/refresh`
- **Body**: `{ "refreshToken": "..." }`
- **Response**: `200 OK`
  ```json
  { "data": { "accessToken": "...", "refreshToken": "..." } }
  ```

### Email Verification
- **Verify**: `POST /auth/verify/email?code=<code>`
- **Resend**: `POST /auth/resend-verification` - Body: `{ "email": "..." }`

### Password Reset
- **Forgot Password**: `POST /auth/forgot-password` - Body: `{ "email": "..." }`
- **Reset Password**: `POST /auth/reset-password?code=<code>` - Body: `{ "password": "..." }`

### Current User
**GET** `/auth/me`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Response**: `200 OK` - User profile object.

---

## Two-Factor Authentication (`/auth/2fa`)

All 2FA endpoints require `Authorization: Bearer <accessToken>`.

### Setup
**POST** `/auth/2fa/setup`
- **Response**: `200 OK`
  ```json
  { "data": { "otpAuthUrl": "otpauth://...", "qrCode": "data:image/..." }, "message": "Scan QR and verify OTP" }
  ```

### Enable
**POST** `/auth/2fa/enable`
- **Body**: `{ "otp": "123456" }`
- **Response**: `200 OK`
  ```json
  { "data": { "recoveryCodes": ["...", "..."] }, "message": "2FA enabled — save recovery codes" }
  ```
  *Important: Display recovery codes to the user immediately.*

### Verify (Test)
**POST** `/auth/2fa/verify`
- **Body**: `{ "otp": "123456" }`
- **Response**: `200 OK`
  ```json
  { "message": "OTP verified" }
  ```

### Disable
**POST** `/auth/2fa/disable`
- **Response**: `200 OK`
  ```json
  { "message": "2FA disabled" }
  ```

### Status
**GET** `/auth/2fa/status`
- **Response**: `200 OK`
  ```json
  { "data": { "enabled": true, "enabledAt": "2024-..." }, "message": "2FA status" }
  ```


---

## Accounts (`/accounts`)

Manage linked login accounts (Google, etc.).
Requires `Authorization: Bearer <accessToken>`.

### List Accounts
**GET** `/accounts`
- **Response**: `200 OK` - List of linked accounts.

### Disconnect Account
**DELETE** `/accounts/:id`
- **Response**: `200 OK`

---

## Sessions (`/sessions`)

Manage active sessions/devices.
Requires `Authorization: Bearer <accessToken>`.

### List Sessions
**GET** `/sessions`
- **Response**: `200 OK` - List of active sessions with IP, UserAgent, Dates.

### Revoke Session
**DELETE** `/sessions/:id`
- **Response**: `200 OK` - Revokes specific session.

### Revoke All Sessions
**DELETE** `/sessions`
- **Response**: `200 OK` - Revokes all OTHER sessions.

---

## Health (`/healthcheck`)
**GET** `/healthcheck`
- **Response**: `200 OK`

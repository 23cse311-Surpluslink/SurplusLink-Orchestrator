# Module: Authentication & Profile Management
**Owner: Priyansh Narang**

## Overview
This module handles the core security, identity, and lifecycle management of all users within the SurplusLink ecosystem. It implements a secure, OTP-backed authentication flow and tiered profile management for Donors, NGOs, and Volunteers.

## Connectivity & Integration
- **Frontend**: `frontend/src/pages/login-page.tsx`, `frontend/src/contexts/auth-context.tsx`
- **Backend API**: `/api/v1/auth`, `/api/v1/users`
- **Security**: JWT tokens stored in HttpOnly cookies, password hashing with BCrypt.

## Core Features
### 1. Robust Sign-up Flow
- Multi-role support (Donor, NGO, Volunteer).
- Asynchronous email verification using OTP (One-Time Password).
- Automatic profile initialization based on user role.

### 2. Secure Login & Session
- Double-verify mechanism (Email/Password + Optional OTP).
- Automated session refresh and secure logout.
- Persistent authentication state via HttpOnly cookies for CSRF protection.

### 3. Verification & Profile Management
- Admin-controlled status approval (Pending -> Active).
- Dynamic profile updates including organization details, vehicle capacity, and contact info.
- TrustScore tracking and feedback aggregation.

## Code Items
- `backend/controllers/auth.controller.js`: The heart of user session logic.
- `backend/controllers/user.controller.js`: Manages profile data and administrative actions.
- `backend/middleware/auth.middleware.js`: Protects routes and verifies permissions.
- `frontend/src/utils/auth.ts`: Logic for local state and token handling.

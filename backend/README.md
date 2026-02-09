# SurplusLink Backend: Logistics and Matching Engine

This is the core intelligence layer of the SurplusLink platform. It handles geospatial food matching, secure authentication, real-time logistics tracking, and automated safety supervision.

---

## Technical Stack
- **Engine**: Node.js and Express.js
- **Database**: MongoDB Atlas (Geospatial 2dsphere Indexing)
- **Authentication**: JWT with HttpOnly Secure Cookies
- **Communication**: RESTful API and Socket.io
- **Logistics**: Google Maps Directions API Integration
- **Storage**: Cloudinary for POS (Proof of Delivery) verification
- **Testing**: Jest and Supertest (Unit and Integration Testing)

---

## Key Modules

### 1. Intelligent Matching Engine
Uses a weighted scoring matrix (Score = Distance + Urgency + Capacity) to pair surplus food with the most suitable NGO partner in real-time.

### 2. Safety Supervisor (Logistics Cron)
A background service that monitors mission inactivity. If a volunteer stops providing GPS updates for 15+ minutes, the mission is automatically unassigned and re-dispatched to prevent food spoilage.

### 3. Tiered Dispatch System
Expands the search radius for volunteers automatically (5km to 10km to 20km) if a high-priority donation remains unclaimed.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Gmail App Password (for OTPs)

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
EMAIL_USERNAME=your_gmail
EMAIL_PASSWORD=your_app_password
GOOGLE_MAPS_API_KEY=your_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Running Tests
```bash
# Run 34+ Unit and Integration tests
npm test
```

---

## API Overview (V1)
Check the [Developer Documentation](./DEV_DOCS.md) for a full deep-dive into the API schema.

| Feature | Endpoint | Method |
| :--- | :--- | :--- |
| **Authentication** | `/api/v1/auth/signup` | POST |
| **Donations** | `/api/v1/donations/feed` | GET |
| **Volunteer** | `/api/v1/donations/:id/accept` | PATCH |
| **Analytics** | `/api/v1/reports/donations` | GET |

---
*Maintained by the SurplusLink Backend Team.*
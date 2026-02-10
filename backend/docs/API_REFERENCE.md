# SurplusLink API Reference v1.0

This document provides a comprehensive guide to the SurplusLink REST API. It includes details on authentication, global error handling, and all available endpoints with example request/response payloads.

---

## 1. Global Configuration

### **Base URL**
`https://surpluslink-api.render.com/api/v1` (Production)  
`http://localhost:8000/api/v1` (Development)

### **Authentication**
SurplusLink uses **JWT (JSON Web Tokens)** for session management. 
- **Mechanism**: On successful login, a token is issued in a `HttpOnly` cookie named `token`.
- **Security**: The cookie is marked `Secure` and `SameSite=None`, ensuring it works across different origins (e.g., Vercel frontend to Render backend) while preventing XSS attacks.
- **Client Handling**: The client doesn't need to manually read or send the token. As long as `withCredentials: true` is set in Axios/Fetch, the browser will automatically attach the cookie to all outgoing requests to the backend.

### **Error Response Structure**
All error responses follow this standard format:
```json
{
  "success": false,
  "message": "Detailed error message here.",
  "stack": "Stack trace (Only visible in Development mode)"
}
```
**Common HTTP Status Codes:**
- `400 Bad Request`: Validation failure or logic error (e.g., food too close to expiry).
- `401 Unauthorized`: Authentication missing or token invalid.
- `403 Forbidden`: User doesn't have the required role (e.g., Donor trying to access NGO feed).
- `404 Not Found`: Resource (User/Donation) does not exist.
- `429 Too Many Requests`: Rate limit exceeded for status updates.

---

## 2. Authentication Endpoints (`/auth`)

### **Signup User**
`POST /auth/signup`
- **Access**: Public
- **Body**:
```json
{
  "name": "Jane NGO",
  "email": "jane@ngo.org",
  "password": "SecurePassword123",
  "role": "ngo",
  "organization": "Green Food Rescue"
}
```
- **Success (201)**:
```json
{
  "success": true,
  "message": "Registration successfull! Please verify your email.",
  "requiresOtp": true,
  "email": "jane@ngo.org"
}
```

### **Login User**
`POST /auth/login`
- **Access**: Public
- **Body**:
```json
{
  "email": "jane@ngo.org",
  "password": "SecurePassword123"
}
```
- **Success (200)**: Sets `token` cookie and returns user profile.

---

## 3. Donor Operations (`/donations`)

### **Post a Donation**
`POST /donations`
- **Access**: Private (Donor)
- **Format**: `multipart/form-data`
- **Fields**:
  - `title`: (String) Name of food item.
  - `foodType`: (String) e.g., "Vegetarian Meal".
  - `quantity`: (String) e.g., "10kg" or "20 portions".
  - `expiryDate`: (Date ISO String).
  - `perishability`: (Enum) `high`, `medium`, `low`.
  - `pickupAddress`: (String) Full physical address.
  - `photos`: (File Array) Up to 5 image files.
- **Success (201)**: Returns the created Donation object.

### **Get Suitability-Ranked NGOs**
`GET /donations/:id/best-ngos`
- **Access**: Private (Donor/Admin)
- **Success (200)**:
```json
[
  {
    "id": "ngo_id_1",
    "organization": "City Relief",
    "suitabilityScore": 95,
    "distance": 1.2,
    "unmetNeed": 50
  }
]
```

---

## 4. NGO Operations (`/donations`)

### **Get Smart Feed**
`GET /donations/feed`
- **Access**: Private (NGO)
- **Description**: Returns prioritized donations based on proximity and urgency.
- **Success (200)**:
```json
{
  "donations": [
    {
      "id": "donation_id",
      "title": "Fresh Bread",
      "suitabilityScore": 88,
      "urgencyLevel": "critical",
      "matchPercentage": 92
    }
  ],
  "capacityWarning": false,
  "unmetNeed": 80
}
```

### **Safety Audit Rejection**
`PATCH /donations/:id/reject`
- **Body**:
```json
{
  "rejectionReason": "Contaminated: Packaging was open upon arrival."
}
```

---

## 5. Volunteer Logistics (`/donations`)

### **Accept Mission (Atomic)**
`PATCH /donations/:id/accept-mission`
- **Access**: Private (Volunteer)
- **Description**: Locks the mission to the volunteer and sets mission state to `pending_pickup`.

### **Confirm Pickup (Verification)**
`PATCH /donations/:id/pickup`
- **Format**: `multipart/form-data`
- **Body**: `photo` (File)
- **Effect**: Changes `deliveryStatus` to `picked_up`.

### **Get Optimized Route**
`GET /donations/:id/optimized-route`
- **Success (200)**:
```json
{
  "missionId": "...",
  "currentLocation": { "lng": 77.123, "lat": 12.987 },
  "path": [
    { "type": "pickup", "address": "Donor St", "eta": 12 },
    { "type": "dropoff", "address": "NGO Rd", "eta": 25 }
  ],
  "estimatedTotalTime": 37,
  "diversionSuggested": false
}
```

---

## 6. Real-Time Tracking Endpoints (`/users`)

### **Update Background Location**
`PATCH /users/volunteer/location`
- **Access**: Private (Volunteer)
- **Body**:
```json
{
  "lat": 12.9716,
  "lng": 77.5946
}
```

---

## 7. Data Models (Schema)

### **User Model**
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Legal name of the user. |
| `role` | Enum | `donor`, `ngo`, `volunteer`, `admin`. |
| `status` | Enum | `pending`, `active`, `deactivated`. |
| `isOnline` | Boolean | Volunteer availability toggle. |
| `trustScore` | Number | 1.0 - 5.0 rating based on history. |

### **Donation Model**
| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | Enum | `active`, `assigned`, `picked_up`, `completed`, `cancelled`, `expired`. |
| `deliveryStatus`| Enum | `idle`, `pending_pickup`, `heading_to_pickup`, `at_pickup`, `picked_up`, `in_transit`, `arrived_at_delivery`, `delivered`. |
| `perishability` | Enum | `high`, `medium`, `low`. |
| `expiryDate` | Date | The hard cut-off timestamp for food safety. |

---
*Last Updated: February 2026*

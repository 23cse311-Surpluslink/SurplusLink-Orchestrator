# SurplusLink: Smart Food Redistribution Platform

> **"Food waste is a logistical failure. SurplusLink is the solution."**  
> SurplusLink is a high-performance, real-time platform that bridges the gap between surplus food sources (restaurants, hotels, events) and social impact organizations (NGOs, shelters) using ML-driven matching and transparent tracking.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Detailed Feature Set](#detailed-feature-set)
3. [Technical Architecture](#technical-architecture)
4. [API Specification (V1)](#api-specification-v1)
5. [Database Models & Schema](#database-models--schema)
6. [Core Intelligence & Logic](#core-intelligence--logic)
7. [Security & Compliance](#security--compliance)
8. [Directory Structure](#directory-structure)
9. [Developer Guide](#developer-guide)
10. [Future Roadmap](#future-roadmap)
11. [Team & Roles](#team--roles)

---

## Project Overview
Every year, billions of tons of food are wasted while millions go hungry. SurplusLink digitizes the redistribution process to:
- **Minimize Time-to-Table:** Get perishable food to shelters before it expires.
- **Enhance Transparency:** Track every gram of food from "Donated" to "Consumed".
- **Empower Donors:** Provide actionable CSR data and certificates.

---

## Detailed Feature Set

### Donor Experience (The Providers)
- **Smart Posting Wizard:** Multi-step form with presets for common food types (Bakery, Meals, Produce).
- **Dynamic Pickup Windows:** Define specific times when volunteers can enter the premises.
- **Automated Alerts:** Receive notifications when an NGO accepts your donation.
- **Impact Wall:** Visualize metrics like "Total Meals Saved", "CO2 Offset", and "Communities Impacted".

### NGO & Volunteer Experience (The Rescuers)
- **Geo-fenced Matching:** View available donations in a list or map view sorted by distance.
- **Matching Engine:** AI-prioritized feed based on NGO capacity and food urgency.
- **Task Assignment:** NGOs can assign specific pickups to their registered volunteers.
- **In-App Proof of Delivery:** Upload photos and signatures upon successful delivery.

### Admin Master Intelligence (The Oversight)
- **Real-Time Logistics Map:** Live monitoring of all active pickup vehicles (simulated/GPS).
- **Verification Engine:** Manual and automated KYC for organizations to ensure safety.
- **Comprehensive KPI Dashboard:** Monitor system-wide Food Rescue Rate (FRR) and average turnaround time.
- **Incident Management:** Flag and resolve issues like "Food Spoilage" or "No-shows".

---

## Technical Architecture

### Frontend (Current)
- **Framework:** React 18 with TypeScript.
- **Build Tool:** Vite.
- **Design System:** Tailwind CSS + Radix UI (via Shadcn/UI).
- **Graphics:** Recharts for data visualization, Framer Motion for micro-interactions.
- **State Management:** TanStack Query (React Query) for robust server-state handling.

### Backend (Incoming)
- **Engine:** Node.js & Express.js.
- **Communication:** RESTful APIs + Socket.io for live updates.
- **Auth:** Better-Auth or custom JWT implementation with RBAC.
- **Services:** Firebase for real-time notifications and image storage (S3 alternative).

---

## API Specification (V1)

### 1. Authentication & Users
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Public | Register Organization/Donor |
| `POST` | `/api/v1/auth/login` | Public | Obtain Auth Token |
| `GET` | `/api/v1/users/profile` | Private | Fetch detailed user data |
| `PATCH` | `/api/v1/users/verify` | Admin | Approve organization credentials |

### 2. Donation Management
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/donations` | Donor | List new surplus food items |
| `GET` | `/api/v1/donations/feed` | NGO | Get matched donations by location |
| `GET` | `/api/v1/donations/:id` | Private | Fetch single donation details |
| `PATCH` | `/api/v1/donations/:id/accept` | NGO | Claims a pending donation |
| `POST` | `/api/v1/donations/:id/complete`| NGO | Handover confirmation via QR |

### 3. Analytics & Logistics
| Method | Route | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/impact` | Private | Get personal/system impact stats |
| `GET` | `/api/v1/logistics/routes` | Admin | Real-time active delivery paths |

---

## Database Models & Schema

### Organization Schema (MongoDB)
```typescript
interface Organization {
  _id: string;
  type: 'DONOR' | 'NGO';
  name: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  location: {
    coordinates: [number, number]; // [lng, lat] for GeoJSON
    address: string;
  };
  capacity?: number; // For NGOs (max portions per day)
  rating: number; // Based on successful handovers
}
```

### Donation Schema (MongoDB)
```typescript
interface Donation {
  _id: string;
  donorId: string;
  foodDetails: {
    type: string;
    description: string;
    quantity: string;
    photoUrl?: string;
  };
  expiry: Date;
  pickupWindow: {
    start: Date;
    end: Date;
  };
  status: 'PENDING' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
  history: Array<{ status: string, timestamp: Date }>;
}
```

---

## Core Intelligence & Logic

### 1. The Matching Algorithm
The system uses a priority scoring mechanism:
$$Score = (D_{prox} \times 0.4) + (T_{expiry} \times 0.3) + (C_{ngo} \times 0.2) + (R_{history} \times 0.1)$$
- **$D_{prox}$**: Proximity score (closer = higher).
- **$T_{expiry}$**: Urgency score (nearer expiry = higher).
- **$C_{ngo}$**: NGO capacity match.
- **$R_{history}$**: Reliability rating.

### 2. The Hygiene Chain
To ensure safety, the "Chain of Custody" is logged:
1. **Donor Log:** Confirms food temperature and preparation time.
2. **NGO Pickup:** Verifies visual quality and packaging.
3. **Delivery:** Final confirmation with a digital signature / QR Code.

---

## Directory Structure

```text
├── /frontend
│   ├── /src
│   │   ├── /components
│   │   │   ├── /ui          # Shadcn base components
│   │   │   ├── /layout      # Navbar, Dashboard Sidebar
│   │   │   └── /common      # PageHeader, StatCards, Maps
│   │   ├── /pages
│   │   │   ├── /donor       # PostDonation, DonorDashboard
│   │   │   ├── /ngo         # NearbyDonations, NgoDashboard
│   │   │   └── /admin       # KPI Overview, Live Tracking
│   │   ├── /mockData        # Rapid prototyping store
│   │   └── App.tsx          # Dynamic route definitions
│   ├── tailwind.config.ts   # Core design tokens
│   └── package.json         # Dependency manifest
└── /backend (Projected)
    ├── /src
    │   ├── /api/routes      # Express route controllers
    │   ├── /services        # ML Matching, Notification logic
    │   └── /db/models       # Mongoose Schemas
```

---

## Security & Compliance
- **JWT Authentication:** Secure stateless session handling.
- **RBAC:** Multi-tenant architecture ensuring Donors cannot see other Donors' data.
- **GeoJSON Indexing:** Efficient 2D sphere indexing for location-based queries in MongoDB.
- **Rate Limiting:** Protects API from spam donation posts.

---

## Developer Guide

### Local Setup
1. **Clone & Explore:**
   ```bash
   git clone https://github.com/PriyanshNarang/SurplusLink1.git
   ```
2. **Frontend Initialization:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. **Environment Config:**
   Create `.env.local`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   VITE_MAP_PROVIDER_KEY=xxxxxx
   ```

---

## Future Roadmap

### Phase 1: Foundation (Current)
- [x] Responsive Dashboard UI for all roles.
- [x] Mock Data integration for demos.
- [x] Basic Analytics and Charts.

### Phase 2: Core Backend (Q2 2025)
- [ ] Integration with MongoDB and Node Express.
- [ ] Real-time Socket.io notifications for NGO matches.
- [ ] Production-ready Auth system.

### Phase 3: Logistics & Trust (Q3 2025)
- [ ] Interactive Map implementation with Route Optimization.
- [ ] QR Code-based Secure Handover.
- [ ] ML Engine for predictive surplus forecasting.

---

## Team & Roles

| Contributor | Focus Area |
| :--- | :--- |
| **Priyansh Narang** | Full Stack Architecture & Project Lead |
| **Bala Bharath** | Lead Frontend / UI Engineer |
| **Arpitha Shri** | Backend Logic & Database Performance |
| **Sanjay T** | Quality Assurance & Unit Testing |
| **Sri Pragna** | DevOps, CI/CD & Deployment |

---

## License
Licensed under the **GNU General Public License v3.0**. See the [LICENSE](./LICENSE) for details.

---

> This project is a submission for the **Software Engineering 2025-26** coursework. For inquiries, contact the project leads.

# Donor Surplus Food Management Module


## 1. Overview
The **Donor Surplus Food Management Module** is a core component of the SurplusLink ecosystem. It serves as the primary interface for surplus food providers—such as restaurants, hotels, and event organizers—to list and manage their donations efficiently.

The module is designed to bridge the gap between food waste and social impact by digitizing the redistribution process and ensuring that surplus food reaches NGOs and shelters quickly and safely.

---

## 2. Connectivity & Integration
This module acts as the "Source" of the SurplusLink ecosystem, feeding data into the matching engine and logistics tracking.

- **Frontend**: `frontend/src/pages/donor/post-donation.tsx`, `frontend/src/pages/donor/donor-dashboard.tsx`
- **Backend API**: `/api/v1/donations` (POST, GET, PATCH)
- **Services Integration**: 
    - **Cloudinary**: Handles secure media uploads for quality verification.
    - **Google Maps API**: Perfroms geocoding to transform physical addresses into GeoJSON points for proximity calculations.
    - **Matching Engine**: Triggers the `initiateAutoDispatch` service once a donation is claimed by an NGO.

---

## 3. Key Features

### 1. Smart Posting Wizard
Donors can quickly list surplus food via a multi-step form. This includes:
- **Food Details**: Presets for common food types (Bakery, Meals, Produce), quantity, and category (Cooked, Raw, Packaged).
- **Safety Thresholds**: Integration of perishability levels and expiry tracking (mandatory 2-hour buffer) to prevent the distribution of unsafe food.
- **Media Support**: Built-in photo upload functionality (via Cloudinary) for visual quality verification.

### 2. Intelligent Logistics & Geocoding
- **Dynamic Pickup Windows**: Donors can specify precise time slots for collection, allowing volunteers to coordinate logistics without disrupting donor operations.
- **Automated Geocoding**: Pickup addresses are automatically converted into GeoJSON points using the Google Maps API, enabling high-performance spatial queries for nearby NGOs and volunteers.

### 3. Real-Time Tracking & Alerts
- **Automated Notifications**: Donors receive real-time updates when an NGO claims their donation or when a volunteer is assigned for pickup.
- **Active Status Monitoring**: Full visibility into the donation lifecycle, from "Posted" to "Collected" and finally "Delivered."

### 4. Impact Analytics (The "Impact Wall")
The module provides a data-driven dashboard where donors can track their social and environmental contributions:
- **Volume & Success Rates**: Total kilograms saved and percentage of successful rescues.
- **Carbon Offset**: Automated calculation of CO2 saved (approx. 2.5kg per kg of food) by preventing food waste.
- **Community Impact**: Total number of meals provided to local communities.

---

## 4. Code Files & Functionality

| File Path | Responsibility |
| :--- | :--- |
| `backend/controllers/donation.controller.js` | Contains logic for `createDonation`, `getDonorStats`, and `cancelDonation`. |
| `backend/models/Donation.model.js` | Schema definition including GeoJSON coordinates and storage requirement enums. |
| `backend/routes/donation.routes.js` | Role-Based Access Control (RBAC) routing for donor-specific endpoints. |
| `frontend/src/pages/donor/post-donation.tsx` | UI for the multi-step posting wizard with map-picking capability. |
| `frontend/src/pages/donor/donor-dashboard.tsx` | Main interface displaying impact metrics and the "Impact Wall". |
| `frontend/src/pages/donor/donor-donations.tsx` | History view with status tracking and cancellation logic. |
| `frontend/src/services/donation.service.ts` | API bridge between the React frontend and Node.js backend. |

---

## 5. Technical Highlights
- **Architecture**: Follows a RESTful API pattern using **Node.js** and **Express**.
- **Data Consistency**: Uses **Mongoose** with complex aggregation pipelines for real-time statistical reporting.
- **Suitability Ranking**: Integrates with an intelligent matching engine that ranks the best-suited NGOs based on proximity, capacity, and the NGO’s historical acceptance of specific food types.
- **Security**: Implements **Role-Based Access Control (RBAC)** and **JWT-protected routes** to ensure data privacy and integrity.

---

## 6. Impact
By streamlining the donation process, this module eliminates the logistical friction that often leads to food waste. It transforms a liability (surplus food) into a measurable social asset, providing donors with the tools they need for corporate social responsibility (CSR) reporting while feeding those in need.

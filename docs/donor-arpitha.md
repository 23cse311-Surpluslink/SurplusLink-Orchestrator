# Module: Donor Management
**Owner: Arpitha Amrita**

## Overview
The Donor Module serves as the primary entry point for surplus food into the system. It focuses on simplifying the donation process for restaurants, caterers, and individuals while ensuring high data quality and safety transparency.

## Connectivity & Integration
- **Frontend**: `frontend/src/pages/donor/post-donation.tsx`, `frontend/src/pages/donor/donor-dashboard.tsx`
- **Backend API**: `/api/v1/donations` (POST, GET)
- **Services**: Cloudinary Image Upload, Geocoding for precise pickup points.

## Core Features
### 1. Smart Posting Wizard
- Multi-step form for food details, quantity, and storage requirements.
- Real-time GPS coordinate capture for accurate pickup.
- Photo upload integration for transparency and safety audits.

### 2. Safety & Expiry Controls
- Mandatory expiry date/time entry with proximity warnings.
- Perishability classification (High/Medium/Low) to influence matching priority.
- Storage requirement specification (Ambient, Cold, Frozen).

### 3. Donor Insights
- Personal donation history tracking.
- Impact metrics: Number of people helped and cumulative weight diverted from waste.
- Automated status updates: Real-time tracking from "Posted" to "Delivered".

## Code Items
- `backend/controllers/donation.controller.js`: Controller for donation creation and list.
- `backend/models/Donation.model.js`: Schema definition for the donation entity.
- `frontend/src/services/donation.service.ts`: API bridge for donor actions.
- `frontend/src/pages/donor/post-donation.tsx`: Frontend wizard logic.

# Module: Volunteer Logistics & Missions
**Owner: Bharath G Sec**

## Overview
The Volunteer Module manages the "Last-Mile" delivery of food rescue missions. It handles the real-time matching of volunteers to claimed donations, route optimization, and delivery verification.

## Connectivity & Integration
- **Frontend**: `frontend/src/pages/volunteer/active-mission.tsx`
- **Mobile App**: Flutter components for on-field tracking.
- **Backend API**: `/api/v1/donations/:id/accept-mission`, `/api/v1/donations/volunteer/location`
- **Services**: Google Maps Directions Service for route optimization.

## Core Features
### 1. Mission Dispatch System
- Real-time alerts for newly claimed donations in the volunteer's vicinity.
- Specialized "Accept Mission" logic to prevent double-booking.
- Vehicle-specific matching: Suggests missions based on bicycle vs. car capacity.

### 2. Live Logistics Tracking
- Heartbeat system: Updates the server with current coordinates every 60 seconds (when active).
- Google Maps integration for step-by-step navigation from pickup to NGO.

### 3. Proof of Work (POW)
- Photo upload required at pickup and delivery.
- Timestamp logging for performance metrics (ETA accuracy).
- Tier-based progression: Volunteers earn 'Champion' status based on completion rates.

## Code Items
- `backend/controllers/donation.controller.js`: Mission state management (Pickup -> Delivery).
- `backend/services/routing.service.js`: Pathfinding and distance calculations.
- `backend/utils/cron.js`: The "Safety Supervisor" logic for reassignment.
- `frontend/src/pages/volunteer/active-mission.tsx`: Mission action dashboard.

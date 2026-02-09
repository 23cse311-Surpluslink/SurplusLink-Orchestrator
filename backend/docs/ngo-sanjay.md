# Module: NGO Operations & Inventory
**Owner: Sanjay**

## Overview
The NGO Module enables organizations to discover, claim, and managed donated food within their operational area. It utilizes the Intelligent Matching system to ensure NGOs find the most relevant donations based on their specific capacity and needs.

## Connectivity & Integration
- **Frontend**: `frontend/src/pages/ngo/nearby-donations.tsx`, `frontend/src/pages/ngo/my-claims.tsx`
- **Backend API**: `/api/v1/donations/feed`, `/api/v1/donations/:id/claim`
- **Testing**: Vitest (`SmartDonationCard.test.tsx`, `nearby-donations.test.tsx`)

## Core Features
### 1. The Smart Feed
- A real-time stream of nearby donations ranked by distance and urgency.
- Intelligent filtering by food category and storage suitability.
- Capacity-aware discovery: NGOs are warned if they exceed their daily processing limit.

### 2. Claim Management
- One-tap claim logic that secures the donation in the system.
- Rejection/Problem reporting: NGOs can flag unsafe donations for platform audit.
- History tracking: Logs of all completed rescures and impact reports.

### 3. Proof of Delivery (POD)
- Verification of donation successful receipt.
- Feedback loop: NGOs can rate the donation quality to build donor trust.

## Code Items
- `backend/controllers/donation.controller.js`: NGO-specific claim/reject logic.
- `frontend/src/pages/ngo/nearby-donations.tsx`: The main "Smart Feed" interface.
- `backend/models/Donation.model.js`: Status transitions from `active` to `claimed`.
- `frontend/src/components/common/donation-card.tsx`: UI component for donation details.

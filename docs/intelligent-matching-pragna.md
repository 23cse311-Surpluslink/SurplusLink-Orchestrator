# Module: Intelligent Matching & Prioritization
**Owner: Pragna**

## Overview
This is the "Brain" of SurplusLink. This module contains the mathematical logic and decision trees that drive the ecosystem's efficiency, ensuring that food is rescued quickly while balancing load across the volunteer fleet and NGO network.

## Core Philosophical Principles
- **Density Over Distance**: Prioritizes concentrated pickup zones.
- **Safety Buffers**: Prevents assignments if delivery cannot be completed before food expiry.
- **Volunteer Equity (Round Robin)**: Ensures missions are fairly distributed across the fleet.

## Technical Implementation
### 1. The Suitability Matrix
Calculates a 0-100 score for every potential Match:
- **NGO Suitability**: `(DistanceScore * 0.4) + (TimeUrgencyScore * 0.6)`. Boosted by organizational need flags.
- **Volunteer Suitability**: `(Distance * 0.5) + (TierScore * 0.5)`. Penalized if the vehicle capacity is insufficient for the food volume.

### 2. Intelligent Load Balancing
- If an NGO is over 80% of their daily capacity, their ranking is automatically reduced to prioritize other available NGOs.
- Prevents system bottlenecks by diversifying rescue targets.

### 3. Tiered Mission Discovery
- Automated expansion logic:
  - Phase 1: Top 3 best volunteers notified.
  - Phase 2: Open to all within 5km.
  - Phase 3: System-wide broadcast (20km radius).

## Code Items
- `backend/services/matching.service.js`: The central scoring engine.
- `backend/controllers/donation.controller.js`: Triggers the matching logic on state changes.
- `backend/models/Donation.model.js`: Defines the urgency tiers.
- `backend/utils/cron.js`: Automated logistics monitoring.

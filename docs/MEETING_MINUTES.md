# SurplusLink: Minutes of the Meetings

This notebook documents the weekly synchronization and decision-making process of the SurplusLink development team.

---

## Meeting 04: Sprint 1 Finalization
**Date**: February 9, 2026  
**Attendees**: Priyansh (Lead), Bala (Frontend), Arpitha (Backend), Sanjay (QA), Sri Pragna (DevOps)  
**Agenda**: Finalizing Sprint 1 deliverables and documentation.

### Decisions:
1. **Theming**: Re-enforce dark mode as the default for the landing page to match the premium "Sustainable Green" branding.
2. **Architecture**: Confirmed the weightage for the matching logic: `(40% Distance | 60% Urgency)`.
3. **Repository**: Decided to use `git subtree` for push-only mirroring to standalone repositories while maintaining the Monorepo as the source of truth.
4. **Safety**: Integrated 2-step verification for delivery (photo proof of work + OTP).

---

## Meeting 03: Feature Freeze & Integration
**Date**: February 2, 2026  
**Agenda**: Code integration and resolving CORS issues between Vercel/Render.

### Decisions:
1. **Auth**: Use HTTP-only cookies with `SameSite=None` to ensure secure cross-origin session persistence.
2. **Frontend**: Adopted `framer-motion` for all entrance animations and `lenis` for smooth scrolling.
3. **Database**: Implemented `2dsphere` geospatial indexing for the suitablity engine.

---

## Meeting 02: Initial Backend Architecture
**Date**: January 26, 2026  
**Agenda**: Selecting the technology stack and database schema.

### Decisions:
1. **Stack**: Node.js/Express for backend, React/Vite for frontend, and Flutter for mobile.
2. **Database**: MongoDB Atlas for its flexible document schema (crucial for varying food donation types).
3. **Mapping**: Integrated Leaflet/OpenStreetMap instead of Google Maps to keep the project open-source and cost-effective.

---

## Meeting 01: Project Kickoff
**Date**: January 18, 2026  
**Agenda**: Defining the core problem statement "Food Redistribution Efficiency".

### Decisions:
1. **Problem**: Identify the "Last Mile" logistics gap in local food rescue.
2. **Roles**: Defined 4 primary user roles: Donor, NGO, Volunteer, and Administrative Monitor.
3. **Naming**: Finalized the name **SurplusLink**.

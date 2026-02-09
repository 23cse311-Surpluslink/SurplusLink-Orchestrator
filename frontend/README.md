# SurplusLink Frontend: The Visual Logistics Hub

The "Flight Command Center" for SurplusLink. A high-performance, responsive React application designed for real-time food rescue coordination.

---

## Features and Aesthetics
- **Premium Design**: Modern Dark and Glassmorphism theme using Tailwind CSS and Radix UI.
- **Dynamic Maps**: Integrated Google Maps for live donation discovery and route visualization.
- **Role-Based Portals**: Custom interfaces for Donors, NGOs, Volunteers, and Administrators.
- **Real-time Feedback**: Instant notifications and impact metrics visualization using Recharts.

---

## Technical Stack
- **Framework**: React 18 and TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS and Shadcn UI
- **State and Data**: TanStack Query (React Query)
- **Maps**: @react-google-maps/api
- **Testing**: Vitest and React Testing Library

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Backend service running or accessible via URL

### 2. Environment Setup
Create a `.env` file:
```env
VITE_API_BASE_URL=https://your-api-url.onrender.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_key
```

### 3. Installation
```bash
npm install
npm run dev
```

### 4. Quality Control
```bash
# Run UI component and utility tests
npm run test
```

---

## Project Structure
- `/src/components`: UI Design System (Shadcn + Custom Radix wrappers)
- `/src/pages/admin`: Logistics monitoring and user management
- `/src/pages/donor`: Post-donation wizards and impact walls
- `/src/pages/ngo`: Claim feeds and volunteer dispatching
- `/src/contexts`: Global Authentication and Notification management

---
*Maintained by the SurplusLink Frontend Team.*

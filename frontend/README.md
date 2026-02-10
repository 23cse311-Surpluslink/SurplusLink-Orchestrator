# SurplusLink Frontend — The Web Control Plane

The user-facing dashboard and landing page for the **SurplusLink** platform. A high-performance, responsive React application designed to facilitate seamless food redistribution between Donors, NGOs, and Volunteers.

---

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Frontend Layer](#frontend-layer)
  - [State Management](#state-management)
  - [Theming Engine](#theming-engine)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Key Components](#key-components)
- [API Reference](#api-reference)

---

## Overview

SurplusLink's frontend is the operational interface for our three primary user groups:
- **Donors**: Post surplus food items, track pickup status, and view impact analytics.
* **NGOs**: Access a prioritized "Smart Feed" of available food and manage pickup logistics.
- **Volunteers**: Manage rescue missions, track routes, and verify deliveries.
* **Admins**: Oversight of the entire network with real-time analytics and user management.

It features a premium "Sustainable Green" aesthetic with fluid animations, glassmorphism, and a robust dual-theme system.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Routing** | [React Router 6](https://reactrouter.com/) |
| **Data Fetching** | [Axios](https://axios-http.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management** | React Context API |
| **Smooth Scrolling** | [Lenis](https://lenis.darkroom.engineering/) |

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0 or later
- **npm**: v9.0 or later (or `yarn` / `pnpm`)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables
Create a `.env` file in the root of the `frontend/` directory:
```env
VITE_API_BASE_URL=https://surpluslink-9fq6.onrender.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Running the Application
```bash
# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
The application will be available at `http://localhost:5173`.

---

## Project Structure

```text
frontend/
├── public/                 # Static assets (logos, icons)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Shadcn primitives (buttons, inputs)
│   │   ├── layout/         # Navbar, Sidebar, Footer, Layout wrappers
│   │   ├── landing/        # Landing page sections (Hero, Features)
│   │   └── dashboard/      # Role-specific dashboard widgets
│   ├── contexts/           # Global State (AuthContext, ThemeContext)
│   ├── hooks/              # Custom React hooks (useAuth, useTheme)
│   ├── lib/                # Library configurations (API client, utils)
│   ├── pages/              # Main route components (Login, Dashboard, etc.)
│   ├── services/           # API service modules (AuthService, DonationService)
│   ├── types/              # TypeScript interfaces and enums
│   ├── utils/              # Pure utility functions
│   ├── App.tsx             # Root component & Route definitions
│   └── main.tsx            # Entry point
├── .env                    # Environment configuration
├── tailwind.config.js      # Style configurations
└── vite.config.ts          # Build tool configuration
```

---

## Architecture

### Frontend Layer
Built using a modular component-based architecture. Components are strictly separated into **Primitives** (pure UI) and **Containers** (state-aware). Styling follows a utility-first approach with Tailwind, using CSS variables for theme-aware tokens.

### State Management
* **AuthContext**: Manages session persistence using JWT tokens stored in secure cookies.
* **ThemeContext**: Handles the switch between `light` and `dark` modes, persisting preference in LocalStorage and reflecting it through the `dark` class on the root element.

### Theming Engine
The application uses a customized Shadcn palette with a focus on "Surplus Green":
- **Primary**: HSL 142 76% 36%
- **Dark Mode**: Optimized surface colors (Zinc/Slate) for reduced eyestrain and high-contrast readability.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Spins up the Vite dev server. |
| `npm run build` | Compiles assets for production deployment. |
| `npm run lint` | Runs ESLint to check for code quality issues. |
| `npm run preview` | Runs a local server to test the production build. |

---

## Testing

Testing is integrated using **Vitest** for unit logic and **React Testing Library** for component verification.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

---

## Key Components

| Component | Location | Description |
| :--- | :--- | :--- |
| **Hero** | `components/landing/Hero.tsx` | High-impact landing section with animated text and CTAs. |
| **Logo** | `components/ui/logo.tsx` | Brand identity component with mode-aware coloring. |
| **LightRays** | `components/LightRays.tsx` | Advanced background animation for the landing page. |
| **AppSidebar** | `components/layout/app-sidebar.tsx` | Role-based navigation navigation for the internal dashboard. |

---

## API Reference

The frontend communicates with the backend via a centralized Axios instance configured in `src/lib/api.ts`.

### Example Execution
```typescript
import api from '@/lib/api';

// Fetching prioritized food feed for NGOs
export const getFeed = async () => {
  const response = await api.get('/donations/feed');
  return response.data;
};
```

---

> Part of the **SurplusLink** Ecosystem. Created for Sprint 1 Review.

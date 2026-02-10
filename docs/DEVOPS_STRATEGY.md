# SurplusLink DevOps Strategy

This document outlines the infrastructure, deployment pipeline, and operational procedures for the SurplusLink ecosystem.

---

## 1. Environment Architecture

The system is deployed across a multi-cloud architecture to ensure high availability and separation of concerns.

| Component | Provider | URL | Purpose |
| :--- | :--- | :--- | :--- |
| **API Backend** | Render | `https://surpluslink-9fq6.onrender.com` | Core logic, DB connectivity, Cron jobs. |
| **Dashboard** | Vercel | `https://surpluslink.vercel.app` | Donor/NGO/Admin web interface. |
| **Database** | MongoDB Atlas | Cluster (AWS/GCP) | Scalable Document store with Geospatial support. |
| **Asset Storage** | Cloudinary | CDN | Secure storage for food/verification images. |

---

## 2. Infrastructure as Code (Docker)

To ensure a "Works on my machine" experience, we provide a unified Docker orchestration.

- **`backend/Dockerfile`**: Optimized Node.js environment (Alpine base).
- **`frontend/Dockerfile`**: Vite build pipeline with Nginx for serving assets.
- **`docker-compose.yml`**: Links the Backend, Frontend, and a local MongoDB instance for offline development.

---

## 3. CI/CD Pipeline (GitHub Actions)

Our automated workflow (`.github/workflows/main.yml`) triggers on every push to the `main` branch.

### **Phase 1: Validation (Continuous Integration)**
- **Linting**: Checks for code style and potential errors in the React frontend.
- **Backend Tests**: Executes the full Vitest/Jest suite against a temporary MongoDB memory server.
- **Security Audit**: Scans for compromised dependencies using `npm audit`.

### **Phase 2: Build & Deployment (Continuous Deployment)**
- **Auto-Sync**: On a successful test pass, GitHub triggers individual webhooks for Vercel and Render.
- **Rollback Policy**: If a build fails, the previous production release remains active (Zero-Downtime Deployment).

---

## 4. Operational Monitoring

1.  **Safety Supervisor (Cron)**: A background worker runs every 15 minutes to scan for "Stalled Missions" and automatically unassigns inactive volunteers.
2.  **Expiration Watchdog**: Marks donations as `expired` the moment they pass their safety threshold, removing them from the feed instantly.
3.  **Logs**: Real-time logging via Render/Vercel dashboard for debugging production issues.

---

## 5. Security Strategy

- **SSL/TLS**: Mandatory HTTPS for all communication.
- **CORS Policy**: Strict origin-locking to allow only the `surpluslink.vercel.app` domain to communicate with the API.
- **Secret Management**: All keys (API Keys, DB URIs) are stored in encrypted environment variables, never hardcoded.

---
*Created for the SE Sprint Review 1*

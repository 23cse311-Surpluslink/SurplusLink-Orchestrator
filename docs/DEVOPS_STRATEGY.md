# SurplusLink DevOps Strategy

This document outlines the infrastructure, deployment pipeline, and operational procedures for the SurplusLink ecosystem, fulfilling the requirements for official architectural review.

---

## 1. System Infrastructure Diagram

The following Mermaid diagram visualizes the flow from development to high-availability production environments.

[**Devops Diagram**](./diagrams/devopsdiag.png)

---

## 2. Component Deployment Matrix

The following table identifies each component, its source code repository, deployment environment, and mandatory safety checks.

| Component | Source Code Repository | Deployment Location | Pre-Deployment Checks | Tools & Libraries |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Dashboard** | [SurplusLink-Frontend](https://github.com/23cse311-Surpluslink/Frontend) | **Vercel** (`https://surpluslink.vercel.app`) | ESLint, TS Compiler, Vitest Unit Tests | React, Vite, Framer Motion, Axios, Shadcn UI |
| **API Backend** | [SurplusLink-Backend](https://github.com/23cse311-Surpluslink/Backend) | **Render** (`https://surpluslink-9fq6.onrender.com`) | Supertest Integration, Vitest, npm audit | Node.js, Express, Mongoose, JWT, Nodemailer |
| **Volunteer Mobile App** | [SurplusLink-Mobile](https://github.com/23cse311-Surpluslink/Mobile) | **App Store / Play Store** | Flutter Analyze, Flutter Test, Widget Testing | Flutter, Dart, Riverpod, Google Maps API |
| **Database Cluster** | Managed via Backend | **MongoDB Atlas (AWS)** | Schema Validation, IP Whitelisting | Mongoose, GeoJSON, 2dsphere indexing |

---

## 3. Infrastructure as Code (Docker)

To ensure a "Works on my machine" experience, we provide a unified Docker orchestration for local development and staging simulation.

- **`backend/Dockerfile`**: Multi-stage Node.js build (Alpine base) for minimal footprint.
- **`frontend/Dockerfile`**: Static asset generation using Vite, served via Nginx.
- **`docker-compose.yml`**: Links the Backend, Frontend, and a local MongoDB instance to simulate the full multi-cloud production environment locally.

---

## 4. Detailed CI/CD Workflow

Our automated workflow (`.github/workflows/main.yml`) is the guardian of production stability.

### **Phase 1: Validation (Continuous Integration)**
1.  **Linting**: Static analysis of JavaScript and TypeScript files to ensure adherence to team standards.
2.  **Unit Testing**: Isolated tests for matching logic and utility functions using **Vitest**.
3.  **Security Audit**: Automated `npm audit` scans to identify and block vulnerable package dependencies before they reach the build stage.

### **Phase 2: Build & Deployment (Continuous Deployment)**
1.  **Build Verification**: Components are built into production bundles. Any build warning on the frontend cancels the deployment.
2.  **Auto-Sync**: On a successful test pass, GitHub Actions triggers direct deployment hooks for Vercel and Render.
3.  **Zero-Downtime Migration**: Render and Vercel manage green-blue deployments, keeping the old version active until the new version passes health checks.

---

## 5. Security & Operational Policy

- **SSL/TLS**: Mandatory HTTPS (TLS 1.3) for all communication.
- **CORS Policy**: Restrictive origin-locking allowing only the production frontend to communicate with the API.
- **Secret Management**: API Keys, Database Connection URIs, and Cloudinary secrets are injected at runtime via encrypted environment variables (Github Secrets -> Render/Vercel Env).
- **Watchdog Services (Cron)**: Backend task workers run every 15 minutes to scan for stalled rescue missions and stale donation data.

--- 
*Last Updated: February 10, 2026*

# SurplusLink: The Food Redistribution Ecosystem

Welcome to the **SurplusLink** GitHub Organization. This repository serves as the central hub for system orchestration, infrastructure, and cross-project documentation.

### Organization Repositories
- [**Frontend**](https://github.com/23cse311-Surpluslink/Frontend): The React and Vite dashboard and landing page.
- [**Backend**](https://github.com/23cse311-Surpluslink/Backend): The Node.js matching engine and API core.
- [**Mobile**](https://github.com/23cse311-Surpluslink/Mobile): The Flutter application for on-field volunteers.

---

## System Orchestration (Docker)

To run the entire ecosystem locally using Docker:

1.  Clone the **Frontend** and **Backend** repositories into the same parent folder.
2.  Navigate to this directory (where `docker-compose.yml` is located).
3.  Run:
    ```bash
    docker-compose up --build
    ```

### Container Architecture
| Container | Port | Role |
| :--- | :--- | :--- |
| `surpluslink-backend` | 8000 | API, Database connectivity, Cron jobs |
| `surpluslink-frontend` | 5173 | Web Dashboard, Admin interface |
| `surpluslink-db` | 27017 | Local MongoDB (if using local environment) |

---

## Sprint 1 Status: COMPLETED
- **Core Modules**: Successfully integrated Backend and Frontend modules.
- **Connectivity**: Fully functional cross-cloud communication (Vercel to Render).
- **Unit Testing**: 100% pass rate across 34+ logical and UI test suites.
- **Documentation**: Comprehensive DevDocs and API reference provided.

---

## The Team
- **Priyansh Narang**: Project Lead / Architecture
- **Bala Bharath**: Lead Frontend / UI
- **Arpitha Shri**: Backend Logic / Database
- **Sanjay T**: Quality Assurance / Testing
- **Sri Pragna**: DevOps / Deployment

---
*Created for the Software Engineering 2025-26 Review.*

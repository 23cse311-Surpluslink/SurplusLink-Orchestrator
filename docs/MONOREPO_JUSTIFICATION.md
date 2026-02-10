# Monorepo Structure Justification

The SurplusLink project currently utilizes a Monorepo structure (containing `backend/`, `frontend/`, and `mobile/` in a single repository). This architectural decision was made based on the following justifications:

### 1. Atomic Versioning and Consistency
In a complex system like SurplusLink, a single change often spans multiple layers (e.g., adding a new field to the `Donation` model requires updates in the Backend API, the Frontend Dashboard, and the Mobile Volunteer App). 
- **Benefit**: The Monorepo ensures that all parts of the ecosystem are versioned together. A single commit represents a consistent state of the entire system, preventing "dependency hell" where the frontend is out of sync with the backend.

### 2. Simplified Developer Experience (DX)
Setting up the environment is significantly faster with a Monorepo.
- **Unified Scripts**: Developers can use a single `npm install` at the root and shared scripts (like `docker-compose`) to spin up the entire environment (DB, API, Web, Mobile) with one command.
- **Ease of Search**: Being able to `grep` or search across the entire codebase (from API routes to UI components) allows for better understanding of data flow.

### 3. Shared Types and Logic
Since the project uses TypeScript/JavaScript across most layers:
- **Type Safety**: Interfaces and models (e.g., `UserRole`, `DonationStatus`) can be easily shared or referenced, ensuring end-to-end type safety without manual copy-pasting.

### 4. Direct Orchestration
Managing infrastructure via Docker and CI/CD pipelines is more straightforward.
- **Global CI/CD**: We can run integration tests that spin up the real backend and frontend simultaneously in a single pipeline run.
- **Orchestrator Role**: This repository acts as the "Grand Central Station," containing the global `docker-compose` and environment orchestration that links all services.

### 5. Seamless Individual Deployment
While the code is developed in a monorepo, we use **Git Subtree** to push mirrors of individual folders to standalone repositories (e.g., `SurplusLink-Frontend`, `SurplusLink-Backend`). 
- **Outcome**: We get the collaborative benefits of a Monorepo with the deployment flexibility of individual micro-repos.

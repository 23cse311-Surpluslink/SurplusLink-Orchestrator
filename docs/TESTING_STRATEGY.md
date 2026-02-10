# SurplusLink Testing Strategy

Quality assurance in SurplusLink is built on the principle of "Safety-Critical Logistics." Since our system manages human consumption (food), the test suite focuses heavily on time-based logic and geospatial accuracy.

---

## 1. Testing Hierarchy

### **A. Unit Testing (Logical Isolation)**
- **Backend**: Uses **Vitest** for blistering fast execution of core logic.
  - *Focus*: Suitability scoring formulas, trust score updates, and date/time buffer calculations.
  - *Location*: `backend/tests/*.test.js`
- **Frontend**: Uses **Vitest** + **React Testing Library**.
  - *Focus*: Form validation, role-based component rendering, and UI utility functions.

### **B. Integration Testing (Component Interaction)**
- **API Simulation**: Uses **Supertest** to mock HTTP requests to the Express server.
  - *Scenario*: Posting a donation → Claiming it as an NGO → Confirming its status in the donor's history.
- **Geospatial Tests**: Validates that MongoDB's `$near` and `$geoWithin` queries correctly return donors within the specified 15km radius.

### **C. End-to-End (Workflow) Testing**
- **Manual Verification**: Systematic walkthroughs of the 5 core Epics (Auth → Post → Match → Mission → Review).
- **Edge Case Testing**: 
  - *Concurrency*: Two volunteers clicking "Accept" at the same millisecond (Testing atomic locks).
  - *Expirations*: Setting food to expire 1 hour from now and ensuring the NGO feed does NOT show it.

---

## 2. Tools & Libraries

| Category | Tool | Purpose |
| :--- | :--- | :--- |
| **Test Runner** | Vitest | Extremely fast, ESM-native unit testing. |
| **API Testing**| Supertest | Testing REST endpoints without a browser. |
| **Mocking** | MSW (Mock Service Worker) | Intercepting network requests in frontend tests. |
| **Reports** | LCOV | Visualizing code coverage statistics. |

---

## 3. Key Properties Tested

1.  **Safety Thresholds**: Ensuring no donation is acceptable if within 30 minutes of expiration.
2.  **Role Guarding**: Verifying that a `volunteer` cannot access `/admin/users`.
3.  **Atomic Consistency**: Ensuring a donation can only be claimed by ONE NGO or Volunteer.
4.  **Geocoding Reliability**: Handling cases where Google Maps might return an invalid location for a given address.

---

## 4. Continuous Quality (CI)

Our GitHub Actions pipeline (`main.yml`) runs the entire test suite on every pull request. A "Passing" status is **required** before code can be merged into the `main` branch.

---
*Created for the SE Sprint Review 1*

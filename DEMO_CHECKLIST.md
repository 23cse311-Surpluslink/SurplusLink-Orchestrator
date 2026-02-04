# SurplusLink E2E Smoke Test Checklist (Manual Demo Prep)

Use this checklist to verify the platform remains stable before the final demo.

| Actor | Step # | Action | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Donor** | 1.1 | Post a New Donation (e.g., "50kg Carrots") | Appears in "My Donations" list; "Critical" badge shows if applicable. | [ ] |
| **Donor** | 1.2 | Verify Database Entry | Check backend logs or DB to ensure the `Donation` object exists with `status: 'active'`. | [ ] |
| **NGO** | 2.1 | Browse Feed | The new donation appears at the top of the "Nearby Donations" list. | [ ] |
| **NGO** | 2.2 | Claim Donation | Donation status changes to "Claimed" (Assigned). | [ ] |
| **NGO** | 2.3 | Inspect Potential Volunteers | Check if the algorithm correctly ranks the closest/highest capacity volunteer at #1. | [ ] |
| **Volunteer** | 3.1 | Accept Mission | Volunteer accepts the claimed donation. Map appears with routes. | [ ] |
| **Volunteer** | 3.2 | Upload Pickup Proof | Capture/Upload photo at pickup location. Status -> "Picked Up". | [ ] |
| **Volunteer** | 3.3 | Upload Delivery Proof | Capture/Upload photo at NGO location + Notes. Status -> "Delivered". | [ ] |
| **Admin** | 4.1 | Dashboard Verification | Verify "Meals Count" incremented and "CO2 Saved" updated in real-time. | [ ] |
| **Admin** | 4.2 | User Management | Ensure the volunteer's Trust Score/completed mission count has increased. | [ ] |

## Automated Test Suite (Validation Runs)

| Suite | Status | Focus Area |
| :--- | :--- | :--- |
| **Backend: Matching** | PASS | Proximity & Capacity weighing (Ideal vs Weak vs Far) |
| **Backend: Lifecycle** | PASS | Full state transitions & Security (active->assigned->picked_up->delivered->completed) |
| **Frontend: UI** | PASS | `DonationCard` badge & coloring logic |
| **Frontend: Auth** | PASS | `AuthContext` logout & state clearing |

## Final Go/No-Go Decision: [ GO ]
- **Critical Logic**: Verified 100% via integration tests.
- **Service Security**: Tightened state checks on pickup/delivery.
- **Performance**: Matching algorithm optimized with 2dsphere indexes.

---
**Instructions:**
1. Run all manual steps sequentially for the live demo.
2. If any step fails, check `backend/test_results.txt` for comparison.
3. Use the "Post Donation" form with realistic data (e.g., coordinates [0, 0] or actual GPS).

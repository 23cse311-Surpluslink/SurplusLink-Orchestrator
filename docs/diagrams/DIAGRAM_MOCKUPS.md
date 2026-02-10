# SurplusLink: Compulsory Diagram Mockups (Mermaid.js)

These diagrams are built using **Mermaid.js**. You can paste these code blocks into the GitHub README, an online [Mermaid Live Editor](https://mermaid.live/), or use a VS Code extension to generate high-quality PNG/SVG exports for your Review.

---

## 1. Use Case Diagram
*Shows the interaction between users and the platform.*

```mermaid
useCaseDiagram
    actor Donor
    actor NGO
    actor Volunteer
    actor Admin

    package "SurplusLink System" {
        usecase "Post Food Donation" as UC1
        usecase "View Smart Feed" as UC2
        usecase "Claim Donation" as UC3
        usecase "Accept Pickup Mission" as UC4
        usecase "Verify Delivery (Photo)" as UC5
        usecase "Monitor Global Logistics" as UC6
        usecase "Approve Organizations" as UC7
    }

    Donor --> UC1
    NGO --> UC2
    NGO --> UC3
    Volunteer --> UC4
    Volunteer --> UC5
    Admin --> UC6
    Admin --> UC7
```

---

## 2. Sequence Diagram (Smart Matching Flow)
*Illustrates the "Brain" logic in action.*

```mermaid
sequenceDiagram
    participant D as Donor
    participant B as Backend (Express)
    participant E as Matching Engine
    participant N as NGO Dashboard
    participant V as Volunteer App

    D->>B: POST /api/v1/donations (New Food)
    B->>E: Calculate Proximity & Urgency
    E->>B: Generate Ranked NGO List
    B->>N: Update Smart Feed (Priority Sorting)
    N->>B: PATCH /claim (NGO Accepts)
    B->>E: Tiered Dispatch Logic
    E->>V: Push Notification (Champion Vol. first)
    V->>V: Map Route Optimization (Dijkstra)
```

---

## 3. Architecture Diagram
*Technical infrastructure overview.*

```mermaid
graph TD
    User((Users))
    Vercel[Vercel: React Frontend]
    Render[Render: Node.js/Express Backend]
    Atlas[(MongoDB Atlas: Persistence)]
    Map[Google Maps API: Geocoding/Routing]
    Cloud[Cloudinary: Photo Storage]
    Gmail[Nodemailer: Verification OTP]

    User <--> Vercel
    Vercel <--> Render
    Render <--> Atlas
    Render <--> Map
    Render <--> Cloud
    Render <--> Gmail
```

---

## 4. Schema Diagram (ERD)
*Core data relationships.*

```mermaid
erDiagram
    USER ||--o{ DONATION : "posts"
    USER ||--o{ DONATION : "claims (NGO)"
    USER ||--o{ DONATION : "delivers (Volunteer)"
    USER ||--o{ NOTIFICATION : "receives"
    DONATION ||--o{ NOTIFICATION : "triggers"

    USER {
        string id
        string role
        string organization
        object stats
    }

    DONATION {
        string id
        string title
        string status
        string deliveryStatus
        point coordinates
        date expiryDate
    }
```

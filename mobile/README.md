# SurplusLink Mobile: On-Field Logistics App
**Owner: Bharath G Sec**

## Overview
The mobile companion for SurplusLink, built with Flutter. This application is specifically designed for Volunteers and Donors to manage rescues on the move.

---

## Core Features
- **Real-time Map Integration**: Visualize nearby donations and optimal delivery routes.
- **Proof of Delivery (POD)**: Built-in camera integration for capturing pickup and delivery photos.
- **Background Heartbeat**: Securely shares periodic location updates with the backend to enable "Smart Dispatching".
- **Instant Alerts**: Push notifications for new missions within the volunteer's radius.

---

## Technical Stack
- **Framework**: Flutter 3.x
- **Language**: Dart
- **State Management**: Provider / Bloc
- **Navigation**: Google Maps Flutter SDK
- **Communication**: REST API with JWT Auth

---

## Getting Started

### 1. Prerequisites
- Flutter SDK (v3.19+)
- Android Studio / Xcode
- Backend URL configured in `lib/config/api_config.dart`

### 2. Run in Development
```bash
flutter pub get
flutter run
```

---
*Created for Sprint 1 Review*

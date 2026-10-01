# BWS Employee Portal - AS-IS Technical Audit Report

This report documents the exact current state of the BWS Employee Portal project as verified from the source code, including the newly introduced API Gateway (`security-middleware` branch).

## 1. PROJECT STRUCTURE

The project is split into three distinct modules: two front-end applications and one backend API gateway.

```text
c:\Users\sanja\Desktop\attendance app for bws\
 ├── attendance-tracker-mobile/    # Expo / React Native Mobile Application
 │    ├── assets/                  # Images, splash screen, and icons
 │    ├── src/
 │    │    ├── api/                # api.js containing fetch logic targeting the API Gateway
 │    │    ├── components/         # Reusable UI (PhotoUpload, PoweredBy, etc.)
 │    │    ├── context/            # AuthContext for session & JWT management
 │    │    ├── screens/            # Application screens (Login, Dashboards, SubmitEntry, etc.)
 │    │    └── utils/              # Helper functions
 │    ├── App.js                   # Navigation root and app entry point
 │    ├── app.json                 # Expo and app configuration
 │    ├── eas.json                 # Expo Application Services build configuration
 │    └── package.json             # Mobile dependencies
 │
 ├── attendance-tracker/           # Vite / React Progressive Web App (PWA)
 │    ├── public/                  # Static assets
 │    ├── src/                     # React source code (mirrors mobile structure)
 │    └── package.json             # PWA dependencies
 │
 ├── bws-middleware/               # Node.js API Gateway / Secure Middleware
 │    ├── server.js                # Express server handling auth & routing
 │    └── package.json             # Backend dependencies (express, cors, jwt, dotenv)
 │
 └── BWS_Portal_Production_Audit.md# Previous Audit Report
```

## 2. TECHNOLOGY STACK

**Mobile Application (attendance-tracker-mobile)**
- **Framework**: React Native (0.85.3) / Expo (SDK ~56.0.9)
- **UI & Navigation**: React (19.2.3), React Navigation (v7)
- **Local Storage**: `@react-native-async-storage/async-storage` (2.2.0)
- **Hardware APIs**: `expo-image-picker` (~56.0.16)
- **Authentication**: JWT stored in AsyncStorage.

**Web Application (attendance-tracker)**
- **Framework**: React (19.2.6) / Vite (8.0.12)
- **Routing**: `react-router-dom` (6.30.4)

**Backend / Middleware (bws-middleware)**
- **Framework**: Node.js / Express (4.21.1)
- **Authentication**: JSON Web Tokens (`jsonwebtoken` 9.0.2)
- **Environment Management**: `dotenv` (16.4.5)
- **CORS Support**: `cors` (2.8.5)

## 3. COMPLETE APPLICATION ARCHITECTURE

```text
Mobile App / PWA
       ↓
(HTTP POST / JSON + Bearer JWT)
       ↓
Node.js Express API Gateway (bws-middleware)
       ↓
(Verifies JWT, injects employeeId, makes HTTP POST)
       ↓
Power Automate Webhooks
       ↓
(Internal Connectors)
       ↓
SharePoint / Backend Services
```

- **Mobile App**: Handles user input, captures device data, manages local state, and passes JWT tokens to the Node gateway.
- **Node Middleware**: An Express API layer acting as a proxy. It completely obscures the Power Automate URLs from the mobile app. It intercepts requests, verifies JWTs, enforces Role-Based Access Control (RBAC), and proxies the call to Power Automate.
- **Power Automate**: Exposed only to the Node middleware via Environment variables (`process.env.FLOW_LOGIN`, etc.). Writes to SharePoint.
- **Data Flow**: The mobile app calls `/api/submitEntry` on the Express server. Express verifies the JWT, injects the trusted `employeeId` from the token into the payload to prevent spoofing, and forwards the payload to Power Automate.

## 4. AUTHENTICATION FLOW

1. **User enters credentials**: User inputs `employeeId` and `pin` in `LoginScreen.jsx`.
2. **Mobile app sends login request**: `Api.login` performs a POST to `/api/login` without a token.
3. **Middleware validation**: The Express server forwards credentials to `FLOW_LOGIN`.
4. **JWT Generation**: If Power Automate returns `success: true`, the Express server determines the role (Admin vs Worker) and issues a JWT signed with `JWT_SECRET` that expires in 12 hours.
5. **Session Persistence**: The mobile app receives the JWT (`res.token`) and saves it inside `attendanceAppState` in `AsyncStorage`.
6. **Data Stored Locally**: `{ isAuthenticated, token, role, employeeId, employeeName, employeeSpId, companyName, clientCompany, profession, loginTimestamp }`.
7. **Subsequent Requests**: `api.js` automatically retrieves the `token` and attaches it as an `Authorization: Bearer <token>` header for all authenticated routes.
8. **Logout**: Managed manually by clearing AsyncStorage, or when the 1-hour foreground session timeout triggers in `AuthContext.js`.

## 5. API / MIDDLEWARE AUDIT

**Server details**: Runs on Express, defaults to `PORT 3000`. Expects a `.env` file for `JWT_SECRET` and `FLOW_*` webhook URLs.

| Mobile API | HTTP | Middleware Route | Downstream Service | Auth Required? | Middleware Actions |
|------------|------|------------------|--------------------|----------------|--------------------|
| `login` | POST | `/api/login` | PA (`FLOW_LOGIN`) | No | Generates JWT |
| `generateOtp` | POST | `/api/generateOtp` | PA (`FLOW_GENERATE_OTP`) | No | Pass-through |
| `submitEntry` | POST | `/api/submitEntry` | PA (`FLOW_SUBMIT_ENTRY`) | Yes | Injects `req.user.employeeId` |
| `getMyEntries`| POST | `/api/getMyEntries` | PA (`FLOW_GET_MY_ENTRIES`) | Yes | Injects `req.user.employeeId` |
| `uploadPhoto` | POST | `/api/uploadPhoto` | PA (`FLOW_UPLOAD_PHOTO`) | Yes | Injects `req.user.employeeId` |
| `submitWorkwearRequest`| POST | `/api/submitWorkwearRequest` | PA (`FLOW_SUBMIT_WORKWEAR_REQUEST`) | Yes | Injects `req.user.employeeId` |
| `updatePIN` | POST | `/api/updatePIN` | PA (`FLOW_UPDATE_PIN`) | Yes | Injects `req.user.employeeSpId` |
| `getPhotos` | POST | `/api/getPhotos` | PA (`FLOW_GET_PHOTOS`) | Yes | JWT verification only |
| `listEmployees`| POST | `/api/listEmployees` | PA (`FLOW_LIST_EMPLOYEES`) | Yes | JWT verification only |
| `adminGetEntries`| POST | `/api/adminGetEntries`| PA (`FLOW_ADMIN_GET_ENTRIES`)| Yes (Admin Role) | `requireAdmin` enforcement |
| `reviewEntry` | POST | `/api/reviewEntry` | PA (`FLOW_REVIEW_ENTRY`) | Yes (Admin Role) | `requireAdmin` enforcement |
| `monthlyReport`| POST | `/api/monthlyReport` | PA (`FLOW_MONTHLY_REPORT`) | Yes (Admin Role) | `requireAdmin` enforcement |

## 6. POWER AUTOMATE INTEGRATION

The Node.js server obscures all Power Automate interaction. It requires 12 `.env` variables mapped to the various flow URLs (e.g., `FLOW_LOGIN`, `FLOW_SUBMIT_ENTRY`, etc.). The mobile app never contacts Power Automate directly anymore.

## 7. DATA FLOW (Example: Submit Entry)

**Submit Work Entry:**
1. UI: `SubmitEntryScreen.jsx` -> User submits hours.
2. Front-end `api.js` attaches JWT to headers and POSTs `{ workDate, hoursWorked, comments }` to `http://192.168.0.111:3000/api/submitEntry`.
3. Node `server.js` hits `authenticateToken`. If valid, it attaches `req.user` to the request.
4. Node injects `employeeId: req.user.employeeId` and `employeeSpId` into the payload (preventing a malicious user from logging hours for someone else).
5. Node `callFlow()` forwards the augmented payload to `process.env.FLOW_SUBMIT_ENTRY`.
6. Power Automate returns JSON status.
7. Node forwards JSON status back to mobile app.

## 8. SCREEN-BY-SCREEN AUDIT

*(Screens remain identical in purpose to the previous audit, but they now communicate securely with the middleware).*
- `LoginScreen`: Calls `/api/login`, receives JWT.
- `WorkerDashboard` & `AdminDashboard`: Dashboard navigation based on RBAC state.
- `SubmitEntryScreen`, `WorkwearRequestScreen`: Send data via protected middleware routes.
- `AdminEntryDetail`: Protected by the `requireAdmin` middleware function at the Node level.

## 9. ROLE / AUTHORIZATION AUDIT

- **Where obtained**: JWT payload generated by Node.js.
- **Where stored**: `AsyncStorage` via `AuthContext.jsx`.
- **Frontend Check**: `App.js` checks `state.role === 'Admin'` to render Admin Stack.
- **Backend Authorization**: **ENFORCED.** The Node middleware implements `requireAdmin` for sensitive routes (`/api/adminGetEntries`, etc.). If a regular worker acquires an admin route URL and tries to POST to it, the Node server will read their JWT, see they lack the Admin role, and return `403 Forbidden`.

## 10. LOCAL STORAGE / SESSION DATA

- **Key**: `attendanceAppState`
- **Contains**: `{ isAuthenticated, token, role, employeeId, employeeName, ... }`.
- **Security**: The JWT (`token`) is stored in plaintext in AsyncStorage. 
- **Lifecycle**: Written on login, removed on explicit logout or 1-hour frontend timeout.

## 11. FILE AND PHOTO UPLOAD FLOW

- `PhotoUpload.jsx` captures base64.
- `Api.uploadPhoto` posts to Node middleware.
- Node server accepts large payloads (`app.use(express.json({ limit: '50mb' }));`) and forwards them to Power Automate.

## 12. CONFIGURATION / ENVIRONMENT AUDIT

- **Middleware Base URL**: `attendance-tracker-mobile/src/api/api.js` has a hardcoded `BASE_URL = 'http://192.168.0.111:3000/api'`. **This is a local IP address.**
- **Node.js Config**: `bws-middleware` uses `.env` for `PORT`, `JWT_SECRET`, and all `FLOW_*` webhook URLs.

## 13. GOOGLE PLAY PRODUCTION READINESS

- **Android Package ID**: `com.bwservices.attendance` (READY)
- **Version Name**: `1.0.0` (READY)
- **Version Code**: NOT EXPLICITLY DEFINED in `app.json`. (NOT READY).
- **Environment**: **NOT READY**. The mobile app's API is hardcoded to `http://192.168.0.111:3000`. This will break entirely outside the developer's local Wi-Fi network. Google Play reviewers will not be able to log in.
- **HTTPS Configuration**: **NOT READY**. Google Play strictly requires `https://` for production API traffic. The current URL uses `http://`.
- **Privacy Policy**: NOT VERIFIED in code. 

## 14. CURRENT BACKEND DEPENDENCIES

```text
Mobile App (Expo)
 ├── AsyncStorage (Local Session)
 └── Node API Gateway (Hosted publicly)
      └── Power Automate (HTTP Webhooks)
           └── SharePoint
```
**Single Points of Failure**: 
- The Node.js Express server must be deployed to a public cloud host (e.g., Render, Heroku, AWS) and accessible via HTTPS.
- Power Automate flows must remain active.

## 15. NETWORK / URL AUDIT

- **Local IP Found**: `http://192.168.0.111:3000/api` is hardcoded in `api.js`. This is a critical deployment blocker.

## 16. ERROR HANDLING

- **API Errors**: Node handles API timeouts and passes `401/403` status codes down. `api.js` on the client catches non-200 responses and throws errors, displaying them in UI alerts or local state.

## 17. OFFLINE / POOR NETWORK BEHAVIOR

- Same as before: Offline login, queuing, and recovery are **not supported**. The app requires an active network connection.

## 18. BUILD / RELEASE CONFIGURATION

- `eas.json` is configured to build an `app-bundle`. Running `eas build --platform android --profile production` will compile the code. However, the compiled app will fail on launch because it will try to hit the local `192.168` IP address.

## 19. FINAL AUDIT SUMMARY

**A. CURRENT ARCHITECTURE**
The system has been massively upgraded to a 3-Tier architecture. The mobile app communicates securely using JWTs with a custom Node.js Express Gateway, which validates permissions, prevents ID spoofing, and proxies requests securely to Power Automate.

**B. CONFIRMED COMPONENTS**
- React Native / Expo Mobile App
- Node.js / Express API Gateway
- Power Automate Webhooks

**C. UNKNOWN / NOT VERIFIED**
- The exact `.env` values needed for the middleware.
- Power Automate internal flow structures.

**D. LOCAL-ONLY DEPENDENCIES**
- **CRITICAL**: The mobile app is pointing to `http://192.168.0.111:3000`. 

**E. PRODUCTION DEPENDENCIES**
- The Node API Gateway must be hosted on a public domain with an SSL certificate.

**F. GOOGLE PLAY RELEASE BLOCKERS**
1. **Local IP Address**: You cannot submit an app pointing to `http://192.168...`.
2. **Cleartext HTTP**: Google Play requires `https://`.
3. **No Version Code**: `app.json` needs an integer `versionCode` for the Play Console.

**G. NON-BLOCKING OBSERVATIONS**
- **Security**: The app is vastly more secure. Webhook signatures are no longer shipped in the mobile binary.

**H. FILE-TO-FUNCTION MAP**
- `server.js` (Node): JWT issuance, RBAC, Proxying.
- `AuthContext.jsx`: Session Persistence.
- `api.js`: Bearer token attachment and fetch logic.

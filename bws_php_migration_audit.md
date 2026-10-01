# BWS Middleware - PHP 8.x Migration Audit

## A. Executive Summary
This audit analyzes the existing `bws-middleware` Node.js/Express API to prepare for a 1:1 migration to PHP 8.x hosted on Hostinger Premium Web Hosting. The existing Node API acts as a secure gateway, proxying requests to Microsoft Power Automate webhooks while injecting security constraints via JWTs. The PHP implementation must precisely mirror these capabilities without altering the mobile app or backend logic.

## B. Current Architecture
- **Framework:** Node.js, Express.js.
- **Role:** API Gateway and Auth Server.
- **Flow:** 
  1. Client sends HTTP POST with JSON body and an optional `Authorization: Bearer <token>` header.
  2. Middleware parses JSON (up to 50MB for photos).
  3. Middleware validates JWT and extracts identity/roles.
  4. Middleware modifies request payload to inject trusted identities (preventing spoofing).
  5. Middleware proxies the request to Power Automate via `fetch`.
  6. Middleware returns the Power Automate response back to the client.

## C. Complete Route Inventory

| Route | HTTP | Auth Required | Admin Only | JWT Claims Used | Power Automate Flow Env Var | Special Behavior |
|-------|------|---------------|------------|-----------------|-----------------------------|------------------|
| `/api/login` | POST | NO | NO | None | `FLOW_LOGIN` | Issues JWT on success. Maps Admin role. |
| `/api/generateOtp` | POST | NO | NO | None | `FLOW_GENERATE_OTP` | Pass-through. |
| `/api/submitEntry` | POST | YES | NO | `employeeId`, `employeeSpId` | `FLOW_SUBMIT_ENTRY` | Injects claims into body. |
| `/api/getMyEntries`| POST | YES | NO | `employeeId` | `FLOW_GET_MY_ENTRIES` | Injects claim into body. |
| `/api/uploadPhoto` | POST | YES | NO | `employeeId` | `FLOW_UPLOAD_PHOTO` | Injects claim. 50mb limit. |
| `/api/submitWorkwearRequest`| POST | YES | NO | `employeeId` | `FLOW_SUBMIT_WORKWEAR_REQUEST`| Injects claim into body. |
| `/api/updatePIN` | POST | YES | NO | `employeeSpId` | `FLOW_UPDATE_PIN` | Injects claim into body. |
| `/api/getPhotos` | POST | YES | NO | None | `FLOW_GET_PHOTOS` | Pass-through after auth. |
| `/api/listEmployees`| POST | YES | NO | None | `FLOW_LIST_EMPLOYEES`| Pass-through after auth. |
| `/api/adminGetEntries`| POST | YES | YES | None | `FLOW_ADMIN_GET_ENTRIES`| `requireAdmin` middleware. |
| `/api/reviewEntry` | POST | YES | YES | `employeeId` as `reviewedBy`| `FLOW_REVIEW_ENTRY` | Injects `reviewedBy` from claim. |
| `/api/monthlyReport`| POST | YES | YES | None | `FLOW_MONTHLY_REPORT` | `requireAdmin` middleware. |

## D. Authentication Flow
- **Login:** Client sends `{ "employeeId": "...", "pin": "..." }`. Node passes this to Power Automate.
- **JWT Creation:** If successful, Node generates a token using `jsonwebtoken` library.
  - **Algorithm:** Default `HS256` (HMAC SHA-256).
  - **Claims:** `{ employeeId, employeeSpId, role }`. Expiration is `12h`.
  - **Secret:** Read from `JWT_SECRET` environment variable.
- **Bearer Parsing:** Reads the `Authorization` header, splits by space, and verifies the token.
- **Failures:** Returns `401 Unauthorized` for missing tokens, `403 Forbidden` for invalid tokens.
- **Security Constraint:** The backend *does not* trust client-supplied employee IDs for authenticated actions. It overwrites `req.body.employeeId` with the `employeeId` from the JWT payload.

## E. RBAC / Authorization
- **Detection:** During login, Node checks if `flowRes.role` is 'Admin' or 'Manager', or if the name includes these terms. It assigns the `role` claim in the JWT.
- **Enforcement:** `requireAdmin` middleware checks `req.user.role !== 'Admin'` and returns `403 Forbidden` if false.
- **Spoofing Protection:** Even if a Worker attempts to post `{ "employeeId": "admin-id" }` to `/api/submitEntry`, the node middleware overwrites it with the Worker's real ID.

## F. Power Automate Integrations
- Node uses native `fetch()` to forward requests to Power Automate URLs stored in `.env`.
- **Headers Sent:** `Content-Type: application/json`.
- **Response Handling:** Uses `await response.text()` to throw an error if not `ok`. Parses JSON using `await response.json()`.
- **Variables used:** `FLOW_LOGIN`, `FLOW_GENERATE_OTP`, `FLOW_SUBMIT_ENTRY`, `FLOW_GET_MY_ENTRIES`, `FLOW_UPLOAD_PHOTO`, `FLOW_SUBMIT_WORKWEAR_REQUEST`, `FLOW_UPDATE_PIN`, `FLOW_GET_PHOTOS`, `FLOW_LIST_EMPLOYEES`, `FLOW_ADMIN_GET_ENTRIES`, `FLOW_REVIEW_ENTRY`, `FLOW_MONTHLY_REPORT`.

## G. Request/Response Contracts
- **Expected Request Body:** Always JSON.
- **Expected Response:** Always JSON, propagating the exact schema from Power Automate. Usually `{ "success": boolean, "message"?: string, ...otherData }`.
- **Error Response:** Generally `{ "success": false, "message": "..." }` and an HTTP status 500/401/403.
*The PHP API must `json_decode(file_get_contents('php://input'), true)` to read the body and `echo json_encode(...)` to respond.*

## H. Photo Upload
- **Current Setup:** `app.use(express.json({ limit: '50mb' }));`
- **Format:** The photo is transmitted as a base64 string inside the JSON payload, not as `multipart/form-data`.
- **Node Specifics:** Express artificially limits JSON body sizes to 100kb by default, hence the `50mb` override.
- **PHP Requirement:** PHP has `post_max_size` and `upload_max_filesize`, but since this is raw JSON payload, `memory_limit` and possibly web-server body size limits (Hostinger's default configs) will dictate maximum upload sizes.

## I. CORS
- **Current Setup:** `app.use(cors());`
- **Behavior:** This permits all origins, all methods, and standard headers.
- **PHP Requirement:** PHP must explicitly emit headers: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Headers: Authorization, Content-Type`, etc. It must also correctly respond with HTTP 200/204 to `OPTIONS` preflight requests.

## J. Error Handling
- **Node pattern:** `try/catch` blocks wrapping `callFlow`. Errors respond with HTTP 500 and `{ success: false, message: err.message }`.
- **Authentication:** `401` or `403`.
- **PHP Requirement:** Use `try/catch` around `curl` or `file_get_contents` requests to Power Automate. Return matching HTTP response codes using `http_response_code()`.

## K. Environment Variables
- `PORT`: (Not required in PHP/Apache as it runs on 80/443).
- `JWT_SECRET`: Secret key for signing tokens.
- `FLOW_LOGIN` through `FLOW_MONTHLY_REPORT`: 12 Webhook URLs.

## L. Node Dependencies
- `express`: Routing and middleware.
- `cors`: Headers management.
- `jsonwebtoken`: JWT creation/validation.
- `dotenv`: Loading config.

## M. Node → PHP Equivalents
| Node.js | PHP 8.x |
|---------|---------|
| `express` routing | Simple switch/match on `$_SERVER['REQUEST_URI']` or a micro-router. |
| `dotenv` | `parse_ini_file()` or native `require 'config.php'`. |
| `jsonwebtoken` | `firebase/php-jwt` library (installed via Composer or manually included). |
| `cors` | Native `header()` calls. |
| `fetch()` | `cURL` or `file_get_contents()` with HTTP context. |
| `req.body` | `json_decode(file_get_contents('php://input'), true)`. |

## N. Hostinger Compatibility
- **PHP 8.x** is fully supported.
- **Apache Rewrite**: To map `/api/login` to `index.php`, an `.htaccess` file is mandatory in the `/api` directory containing `FallbackResource index.php` or a `RewriteRule`.
- **Composer:** Hostinger supports Composer, making it easy to pull in `firebase/php-jwt`. If no SSH/Composer access is desired, the library can be manually vendored.

## O. Proposed PHP Architecture
```
api/
├── .htaccess             # Maps all /api/* requests to index.php
├── index.php             # Front controller (Router & CORS)
├── config.php            # Environment variables / JWT secret
├── Auth.php              # JWT verification & RBAC functions
├── PowerAutomate.php     # Helper for cURL requests to flows
├── vendor/               # Composer dependencies (php-jwt)
└── routes/               # Individual route handlers
    ├── login.php
    ├── submitEntry.php
    └── ...
```

## P. Route Migration Map
| Node Route | PHP Controller/Action | Auth Needed | RBAC | PA Config Var | Compatibility Notes |
|------------|-----------------------|-------------|------|---------------|---------------------|
| `/api/login` | `routes/login.php` | No | No | `FLOW_LOGIN` | Must sign token identical to Node. |
| `/api/submitEntry` | `routes/submitEntry.php` | Yes | No | `FLOW_SUBMIT_ENTRY` | Must inject `employeeId`. |
| *(...all others map 1:1)* |

## Q. Security Findings
1. **JWT Algorithm**: `HS256` is standard and secure, provided `JWT_SECRET` is sufficiently long and random.
2. **Missing Token Expiration Validation**: Express `jwt.verify` automatically checks `exp`, but the PHP implementation must explicitly enforce expiration validation using the `firebase/php-jwt` library.
3. **CORS is Permissive**: `cors()` allows all origins (`*`).
4. **Base64 Photo Payload**: Uploading large base64 strings in JSON is memory-intensive. PHP may crash if `memory_limit` is exceeded (default on Hostinger is often 128MB or 256MB).

## R. Migration Risks
1. **Payload Limits**: Hostinger shared hosting limits PHP max memory, post sizes, and execution times. A 50MB base64 JSON payload might trigger memory exhaustion or `504 Gateway Timeout` errors if Power Automate takes too long to respond.
2. **Missing `.env` Equivalents**: Without Node's `dotenv`, configurations should be kept in a protected PHP file (e.g., `config.php`) out of the webroot if possible, or blocked via `.htaccess` to prevent accidental source code exposure.

## S. Recommended Implementation Order
1. Setup PHP scaffolding (`.htaccess`, `index.php`, `config.php`).
2. Setup CORS headers in `index.php`.
3. Include/Install `firebase/php-jwt`.
4. Implement the proxy utility (cURL).
5. Migrate `/api/login` and verify JWT creation.
6. Implement JWT validation middleware.
7. Migrate a simple authenticated route (e.g., `/api/listEmployees`).
8. Migrate routes requiring claim injection (e.g., `/api/submitEntry`).
9. Migrate Admin routes.
10. End-to-end testing with the mobile app.

## T. Files that will need to be created/modified
*All files will be created new in the PHP hosting environment. The mobile app requires **no modifications** if the API contract is preserved perfectly.*
- `public_html/api/.htaccess`
- `public_html/api/index.php`
- `public_html/api/config.php`
- Composer definitions / Vendored libraries.

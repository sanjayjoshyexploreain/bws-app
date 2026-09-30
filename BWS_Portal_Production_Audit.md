# BWS Portal Production Audit

## 1. Executive Summary

Overall readiness:
* Not Ready

The application cannot be released to production in its current state due to critical security flaws, primarily the hardcoding of backend API signatures in the client source code and the lack of token-based backend authorization. 

## 2. Critical Issues

| # | Issue | Severity | Location | Required Action |
| - | ----- | -------- | -------- | --------------- |
| 1 | Hardcoded API Signatures | CRITICAL | `src/api/api.js` | Remove all Power Automate URLs with `sig=` parameters from the client. Implement a middle-tier proxy or API gateway. |
| 2 | Missing Backend Authorization | CRITICAL | `src/api/api.js`, `SubmitEntryScreen.jsx` | The client supplies the `employeeId` directly in the payload. A user can modify this ID to submit or view data for *any* employee. The backend must validate identity via a secure session token (e.g., JWT). |
| 3 | Admin Endpoints Exposed | CRITICAL | `src/api/api.js` | Admin endpoints (`adminGetEntries`, `reviewEntry`) are bundled in the worker app. Anyone who decompiles the app can call these endpoints using the hardcoded signatures. |
| 4 | Missing Android Version Code | HIGH | `app.json` | Add `versionCode` under the `android` object. Google Play requires an incrementing integer for every release. |

## 3. Security Findings

| # | Finding | Severity | Evidence | Recommendation |
| - | ------- | -------- | -------- | -------------- |
| 1 | Hardcoded Webhook Signatures | CRITICAL | `src/api/api.js` lines 1-13 contain `sig=` tokens. | Do not expose Power Automate HTTP trigger signatures in the mobile client. Route requests through an authenticated proxy. |
| 2 | Insecure Authorization Design | CRITICAL | `AuthContext.jsx` and API payloads | The app relies on client-side session state (`loginTimestamp` in AsyncStorage) and passes `employeeId` in plaintext payloads. Use secure JWTs for API authorization. |
| 3 | Lack of Role Segregation | HIGH | `AuthContext.jsx`, `api.js` | The worker app contains all admin API definitions. Separate admin and worker flows, or strictly enforce roles at the backend level. |
| 4 | Sensitive Admin Trigger | MEDIUM | `LoginScreen.jsx` | Admin mode is accessed by tapping the title 5 times. While hidden, it exposes the `generateOtp` trigger which could be abused via spamming the API. |

## 4. Privacy/Data Findings

| Data | Collected? | Stored? | Shared? | Purpose | Verification Needed |
| ---- | ---------- | ------- | ------- | ------- | ------------------- |
| Name / Employee ID | Yes | Yes (AsyncStorage) | REQUIRES VERIFICATION | Authentication and record linkage | Does backend share this with clients? |
| Attendance (Hours, Dates) | Yes | Yes (Backend) | REQUIRES VERIFICATION | Payroll and project tracking | Retention period for attendance logs. |
| Attendance Photos | Yes | Yes (Backend) | REQUIRES VERIFICATION | Proof of attendance | How long are photos stored? Are bucket URLs public? |
| Workwear Requests | Yes | Yes (Backend) | No | Equipment provision | N/A |
| Device Info / Analytics | No | No | No | N/A | N/A |

## 5. Android Permission Findings

| Permission | Status | Purpose | Recommendation |
| ---------- | ------ | ------- | -------------- |
| `android.permission.CAMERA` | Present | Taking attendance photos | Keep. Required for core functionality. |
| `android.permission.READ_EXTERNAL_STORAGE` | Present | Unused/Unknown | Remove if not picking photos from the gallery. |
| `android.permission.WRITE_EXTERNAL_STORAGE` | Present | Unused/Unknown | Remove. `expo-image-picker` does not require this just to take a photo. |
| `android.permission.RECORD_AUDIO` | Present | None | **REMOVE.** Google Play will reject the app for requesting microphone access without a valid, declared use case. |

## 6. Third-Party SDK Findings

| SDK | Purpose | Data Access | Risk/Concern |
| --- | ------- | ----------- | ------------ |
| Expo / React Native | Core Framework | Device basics | Low risk. Standard framework. |
| Expo Image Picker | Camera integration | Camera, Photos | Low risk, but requires proper permission justification in iOS/Android configs. |
| AsyncStorage | Local session storage | Name, ID, Role | Medium risk. Data is unencrypted locally, but it does not store passwords, only the session state. |

## 7. Google Play Readiness

| Requirement | Status | Evidence / Action |
| ----------- | ------ | ----------------- |
| Package Name | PASS | `com.bwservices.attendance` |
| App Versioning | FAIL | Missing `android.versionCode` in `app.json`. |
| Privacy Policy | REQUIRES VERIFICATION | Must be hosted on a public URL and linked in the Play Console. |
| Data Safety | REQUIRES VERIFICATION | Must accurately declare photo and name collection. |
| Account Deletion | REQUIRES VERIFICATION | Since employees don't register themselves, you must provide an in-app link/text explaining how they can request data deletion from HR. |
| Unused Permissions | FAIL | `RECORD_AUDIO` is requested but unused. |
| Reviewer Credentials | REQUIRES VERIFICATION | You must provide Google Play reviewers with a permanent test Employee ID and PIN that bypasses any OTP requirements. |
| Production AAB | PASS | `eas.json` is correctly configured to build an `app-bundle`. |

## 8. Client Decisions Required

1. **Account Deletion Policy:** How does an employee request account/data deletion, as required by Google Play?
2. **Data Retention:** How long are attendance photos and records kept before being purged?
3. **Data Sharing:** Is employee attendance data or photos shared with third parties (e.g., the client companies)?
4. **Test Account:** What Employee ID and PIN can be permanently assigned to Google Play App Reviewers?

## 9. Developer Fixes Required

1. **Remove Hardcoded APIs:** Remove all direct Power Automate URLs containing `sig=` parameters from `api.js`.
2. **Implement API Proxy:** Create a secure backend proxy that stores the Power Automate signatures and issues JWTs to the mobile app.
3. **Enforce Backend Authorization:** Ensure the backend determines the `employeeId` from a secure session token, not from the client's JSON payload.
4. **Remove Unused Permissions:** Remove `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, and `WRITE_EXTERNAL_STORAGE` from `app.json` unless explicitly required by a new feature.
5. **Add Version Code:** Add `"versionCode": 1` (or higher) to the `android` block in `app.json`.

## 10. Final Pre-Submission Checklist

- [ ] Critical security issues resolved (API signatures removed)
- [ ] Production API verified (Authentication implemented)
- [ ] Production database verified
- [ ] Production storage verified (Ensure photo URLs are private)
- [ ] Authentication verified (Session tokens used)
- [ ] Authorization verified (Users cannot submit data for others)
- [ ] Attendance flow verified
- [ ] Photo security verified
- [ ] Android permissions verified (Microphone removed)
- [ ] Third-party SDKs reviewed
- [ ] Privacy facts confirmed with client
- [ ] Privacy Policy ready and hosted
- [ ] Data Safety form completed in Play Console
- [ ] Reviewer test account created and tested
- [ ] Production AAB tested
- [ ] Store listing ready
- [ ] Final submission ready

---

### Top 10 Things We Must Fix or Verify Before Uploading to Google Play

1. **Fix Critical Security Flaw:** Remove hardcoded Power Automate API signatures from `api.js`.
2. **Implement Backend Authorization:** Do not let the app pass `employeeId` directly to the backend for data submission; use a secure token.
3. **Remove Microphone Permission:** Delete `android.permission.RECORD_AUDIO` from `app.json` to prevent Google Play rejection.
4. **Add Android Version Code:** Add `versionCode` to `app.json` for Google Play version tracking.
5. **Establish Reviewer Account:** Provide a permanent Employee ID and PIN for Google Play reviewers to test the app.
6. **Provide Account Deletion Info:** Ensure there is an in-app link or policy text explaining how employees can request account deletion (Google Play requirement).
7. **Verify Photo Storage Security:** **REQUIRES VERIFICATION — NOT DETERMINABLE FROM CODE.** Ensure uploaded photo storage buckets are not publicly writable or readable without authentication.
8. **Draft Privacy Policy:** Create a hosted Privacy Policy explaining data collection (especially camera/photos).
9. **Complete Data Safety Form:** Accurately declare data collection practices in the Google Play Console based on the Privacy Policy.
10. **Test Backend Validations:** **REQUIRES VERIFICATION — NOT DETERMINABLE FROM CODE.** Ensure the backend rejects attendance submissions that exceed logical hours (e.g., > 24h) or duplicate dates, rather than relying solely on the client UI.

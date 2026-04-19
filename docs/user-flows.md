# Core User Flows

### Flow 1: Registration to Native Feed
1. **Signup Phase:** User creates an account with Phone/Password.
2. **OTP Phase:** Twilio microservice hits the phone with an active SMS confirmation.
3. **Biometric Audit:** The user snaps a Live Webcam photo alongside their ID card.
4. **Verification Gate:** AI evaluates matching threshold >96%. User is designated `is_verified=True`.
5. **Feed Access:** Dispatched into the dashboard, authorized to view jobs and post on the native network.

### Flow 2: Company Claim (B2B)
1. **Initiation:** A verified user enters a GST Code and Company Name.
2. **Mapping:** API checks GST registration formats.
3. **Approval:** If active, the user receives an `IsCompanyAdmin` role tag.
4. **Hiring:** `IsCompanyAdmin` unlocks the `/jobs/post` and marketing `/promotions` endpoints visually.

### Flow 3: Event Ticket Purchase
1. **Browse:** Feed displays upcoming networking hackathons/events.
2. **Verification Check:** Escrow system blocks purchase if Trust Score is lower than 20.
3. **Ticket Generation:** Escrow moves currency and stamps an active QR ticket in the users local Wallet.

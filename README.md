# TrustNet: The Next-Gen Verified Professional Ecosystem 🚀
**A DevClash 2k26 Submission**

TrustNet is an end-to-end, multi-service platform designed to solve the problem of digital authenticity, impersonation, and untrustworthy professional networks. TrustNet enforces 100% human verification, blocks unauthenticated interactions, and provides a scalable ecosystem for B2B collaboration, zero-middleman investment funding, job hunting, and event hosting.

### 🔗 Live Demo Links
- **Frontend App (Cloudflare Edge):** [https://trustnet.jay-bankar-24uds.workers.dev](https://trustnet.jay-bankar-24uds.workers.dev)
- **Django Core API (Vercel Serverless):** [https://trust-net-oluh.vercel.app](https://trust-net-oluh.vercel.app)
- **Twilio OTP Microservice (Vercel):** *Running silently to verify Companies.*

---

## 🏛️ Ecosystem Architecture
The codebase is a tightly integrated monorepo consisting of three specialized micro-services:

1. **/platform-ui-builder (Frontend)**
   - **Framework:** React + Vite + TanStack Start & Router
   - **Styling:** Tailwind CSS + Shadcn UI
   - **Role:** Handles the fully responsive, lightning-fast SPA interface allowing users to browse feeds, claim companies, launch Ad campaigns, and book Event tickets.
2. **/trustnet-backend (Core Database API)**
   - **Framework:** Python / Django Rest Framework (DRF)
   - **Database:** PostgreSQL (production) + SQLite (testing)
   - **Role:** The command center. Enforces strict `IsVerifiedUser` guard rails on write queries, calculates dynamic Trust Scores based on ecosystem engagement, and uses **Google Gemini 2.5 Flash Vision** for facial biometric recognition during signup.
3. **/otp (Twilio Microservice)**
   - **Framework:** Node.js + Express
   - **Role:** An isolated, serverless microservice that communicates directly with Twilio's messaging API to format global numbers and securely mint/verify Company Claim authorization codes.

---

## 🔒 The 4 Trust & Verification Milestones
Our solution natively handles the mandatory Devkraft verification checks:

1. **Personal Identity Claim:** When a user registers, their profile is frozen. They must upload a live Base64 camera snapshot and an ID card. Our backend routes this directly to Google's highly advanced Gemini Flash AI multimodal engine, which scans for mask-tampering, physical photo spoofing, and optical structure matching. 
2. **Company Ownership Claim:** We eliminated subjective manual review. Users click "Claim Company" and must enter the legal Director's phone number exactly as registered in official registries. The Node.js OTP microservice bypasses the frontend, dispatching an irreversible Twilio code to that specific phone number.
3. **Event Authenticity & Trust:** Booked event tickets generate an underlying `EscrowPayment` model. Organizers do not receive funds instantly. The backend dynamically adjusts the Event's trust score based on the organizer's historical track record and successful payout milestones.
4. **Direct Owner-to-Investor Mapping:** The `/funding` module bypasses generic "Company" inboxes. `InvestmentPitch` entities strictly bind authenticated verified Founder IDs directly to Investor IDs, creating an unbreakable, 1-to-1 secure messaging pipeline with zero middlemen.

---

## 🧪 Testing Strategy
Our testing suite focuses rigorously on our primary USP: the Verification and Trust Engine. 
- **Unit Tests (`core/tests.py`)**: Dedicated Django test classes mocking network requests while pushing boundary edge cases (e.g., fractional Trust Scores, duplicate verification attacks, bypass testing against `IsVerifiedUser` permissions).
- **Postman Network Emulation**: Tested payload restrictions directly against the Rest API to ensure JWT tokens representing "Unverified" users return strict 403 Forbidden HTTP errors on POST requests for Jobs or Events.
- **Biometric Edge Testing**: Captured 12 distinct photo variants (screen reshoots, blurred inputs, printed A4 papers) fed locally to the Gemini pipeline to calibrate failure thresholds.

## 📝 Assumptions & Scope Limitations
- **Company Domain Registration:** We followed the prompt's explicit mandate to allow login through any email (dropping company-domain restrictions), relying strictly on our active Biometric + Twilio checks.
- **Experienced Hiring Only:** The Job boarding platform intentionally filters out Junior constraints and relies directly on Senior-level parameters (Director references).
- **Token Economy:** The wallet, ads, and referral system rely on "TNT (TrustNet Tokens)" which are currently simulated on a 1:1 local database counter constraint rather than a live external cryptographic testnet.

---

## 🛠️ Local Setup & Run Instructions

**1. Clone the Monorepo**
```bash
git clone https://github.com/jaybankar07/TrustNet.git
cd TrustNet
```

**2. Start the Django Core API**
```bash
cd trustnet-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

**3. Start the OTP Verification Microservice**
```bash
cd ../otp
npm install
node server.js  # Runs on port 3000
```

**4. Start the Frontend React Environment**
```bash
cd ../platform-ui-builder
npm install
npm run dev     # Runs on port 5173
```
*Note: Ensure you include the root `.env` files specifying your Gemini API key and Twilio SID to enable full authentication processing.*

---
*Built autonomously and efficiently for the Devkraft Hackathon.*

# Architecture Design

## Core System Architecture
The application follows a distributed micro-monolith approach where the primary API is centralized, but heavy distinct tasks are peeled off into specific microservices.

### 1. Frontend Client (React + Vite)
- **Routing:** TanStack Router for dynamic nested layouts.
- **State:** React Query for caching API datasets globally.
- **Styling:** Vanilla CSS scaling mixed with Tailwind configurations.

### 2. Backend API (Django REST Framework)
- Handles core routing, PostgreSQL ORM mappings, JWT issuance, and business logic.
- Protected globally by Custom Permission decorators (`IsVerifiedUser`, `IsCompanyAdmin`).

### 3. Microservices
- **OTP Node Server:** A lightweight Express.js server located in `/backend/otp` dedicated entirely to interfacing with Twilio for SMS dispatch.

### 4. Data Flow
1. **User Action:** Client triggers action.
2. **API Gateway:** Request hits Django (`localhost:8000`).
3. **Verification check:** The middleware intercepts. If targeting a protected endpoint (like creating a job), the JWT is parsed to check the `is_verified` boolean.
4. **Processing:** The SQL transactions occur.
5. **Response:** Parsed natively and returned. Paginated datasets are wrapped inherently.

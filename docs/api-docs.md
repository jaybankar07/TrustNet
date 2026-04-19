# API Documentation

The backend operates on a strict JSON-over-HTTP REST layout.

### Auth & Verification
- `POST /auth/register/` - Initiates user creation.
- `POST /auth/verify-otp/` - Handles Twilio confirmation codes.
- `POST /auth/verify-face/` - Reaches out to vision AI to calculate biometric match confidence between Live and Passport snaps.

### Network Feed
- `GET /feed/posts/` - Returns chronologically paginated trusted posts.
- `POST /feed/posts/` - Creates new content (requires verification).
- `POST /feed/posts/{id}/like/` - Toggles like increment.

### Companies & Jobs
- `POST /companies/claim/` - Matches provided GST Number against the legal database lookup structure.
- `GET /jobs/` - Retrieves all verified open roles.

### Artificial Intelligence
- `POST /trust/ai-assistant/` - Posts user query, backend injects mapped SQL contexts (Jobs, Events) and queries OpenAI.

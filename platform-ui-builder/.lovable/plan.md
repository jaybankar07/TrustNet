
## TrustNet — Professional Ecosystem Platform (Frontend Prototype)

A polished, Stripe/Notion-inspired UI prototype built on TanStack Start + Tailwind. All data is mocked; interactions feel real (modals, forms with validation UI, tabs, dropdowns, toasts) but no backend calls are made.

### Visual system
- **Style**: minimal, soft, modern — generous whitespace, refined typography, subtle borders, soft shadows.
- **Palette**: near-white background, slate text, indigo/violet primary, emerald for verified/success, amber for pending, rose for fraud/error. Defined as semantic tokens in `styles.css` (oklch).
- **Typography**: Inter (system fallback), tight headings, comfortable body line-height.
- **Primitives**: shadcn components (Card, Button, Badge, Tabs, Dialog, Sheet, Table, Form, Sonner toasts, Skeleton, Chart).

### Layout shell (logged-in app)
- Collapsible left **Sidebar** (Home, Network, Jobs, Events, Companies, Wallet, Referrals, Promotions, Admin, Settings) with mini-collapse to icons.
- Top **Header**: global search, notifications, AI assistant button, verification badge, avatar menu.
- Public pages (Landing, Login, Signup) use a separate marketing shell with top nav + footer.

### Routes (all built; "polished core" gets full detail, others are clean functional stubs)

**Polished core**
- `/` Landing — hero, trust badges, feature grid, testimonials, CTA, footer.
- `/login`, `/signup` — visual auth with social buttons, form validation states, "verify your identity next" hint.
- `/feed` — 3-column: left profile card + quick stats; center composer + post feed (like/comment/share, image posts, polls); right rail with suggestions, trending, sponsored.
- `/profile/$userId` — cover + avatar with verified badge, about, experience timeline, skills, mutual connections, posts tab. Includes "AI: Improve profile" panel.
- `/profile/edit` — multi-section form (basics, experience, skills, links) with inline validation.
- `/jobs` — filters sidebar (role, location, type, salary), job cards, saved jobs.
- `/jobs/$jobId` — full detail, company snippet, apply modal with resume upload UI + form.
- `/events` — grid + list toggle, category filters, trust indicator badge per event.
- `/events/$eventId` — hero, agenda, organizer trust panel, ticket tiers, register modal.
- `/events/new` — create event form (steps: basics → schedule → tickets → review).
- `/admin` — overview metrics + tabs: Users (verification queue with approve/reject), Companies (claim approvals), Events (moderation), Fraud alerts (duplicate face/identity table).

**Functional stubs (clean, on-brand, expandable)**
- `/dashboard` overview, `/network`, `/companies`, `/companies/$id`, `/companies/claim`, `/promotions` (campaigns + analytics charts), `/referrals` (code, progress, leaderboard), `/wallet` (balance, coupons, offers), `/verify` (face-capture mock screen + status states), `/settings`, 404.

### Key UI moments
- **Verification flow**: dedicated `/verify` page with camera viewport mock, scanning animation, three result states (Pending / Verified / Rejected) and a duplicate-face fraud alert variant. Verified badge appears across profiles.
- **Access control**: reusable `<RestrictedBanner />` and disabled-button pattern shown on Apply, Create Event, Promote — "Verify your account to continue".
- **AI features**: "Improve profile" suggestion cards, "Enhance content" button in post composer, smart recommendations panel on feed and jobs.
- **Promotions**: campaign builder modal + analytics dashboard with line/bar charts (recharts via shadcn).
- **Wallet/Coupons**: balance card, coupon redemption input with success/error states, offer cards.
- **States everywhere**: skeleton loaders on first paint, empty states with illustrations/icons, error states, hover/transition polish, disabled states.

### Mock data
- Single `src/lib/mock/` folder: `users.ts`, `posts.ts`, `jobs.ts`, `events.ts`, `companies.ts`, `notifications.ts`, `admin.ts`. Imported directly by routes — no fetch.

### Reusable components (`src/components/`)
AppSidebar, AppHeader, MarketingNav, Footer, UserCard, PostCard, PostComposer, JobCard, EventCard, CompanyCard, VerifiedBadge, TrustIndicator, RestrictedBanner, StatCard, EmptyState, PageHeader, DataTable, FraudAlertRow, AnalyticsChart, AIAssistantPanel.

### Responsiveness
Mobile-first. Sidebar becomes a Sheet drawer under `md`. Feed collapses to single column. Admin tables use horizontal scroll on mobile.

### Out of scope (per your constraints)
No backend, no real auth, no API calls, no DB. All actions show toasts/modals only.

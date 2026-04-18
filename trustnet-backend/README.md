# TrustNet Backend — Quick Start

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Run migrations (requires PostgreSQL to be running)
python manage.py migrate

# 4. Create superuser
python manage.py createsuperuser

# 5. Start server
python manage.py runserver
```

Server runs at: http://127.0.0.1:8000/
Admin panel:     http://127.0.0.1:8000/admin/

---

## Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup/` | ❌ | Register |
| POST | `/auth/login/` | ❌ | Login (get JWT) |
| POST | `/auth/token/refresh/` | ❌ | Refresh token |
| GET | `/users/me/` | ✅ | Profile |
| POST | `/verification/submit/` | ✅ | Submit ID |
| GET | `/verification/status/` | ✅ | Check status |
| PATCH | `/admin-api/verification/<id>/` | 🔐 Admin | Approve/reject |
| POST | `/reports/` | ✅ | File a report |
| GET/POST | `/feed/posts/` | ✅ Verified | Feed |
| GET/POST | `/jobs/` | ✅ | Jobs |
| POST | `/jobs/<id>/apply/` | ✅ Verified | Apply |
| GET/POST | `/events/` | ✅ Verified | Events |
| POST | `/events/<id>/register/` | ✅ | Register |
| GET/POST | `/companies/` | ✅ | Companies |
| POST | `/companies/<id>/claim/` | ✅ | Claim company |
| GET | `/wallet/` | ✅ | Wallet balance |
| POST | `/wallet/redeem-coupon/` | ✅ | Redeem coupon |
| GET | `/referrals/my-code/` | ✅ | Referral code |
| POST | `/referrals/use/` | ✅ | Use referral |

## Trust Score Factors

| Factor | Points |
|--------|--------|
| Verified | +40 |
| Per post | +2 (cap 20) |
| Per event | +3 (cap 15) |
| Per referral | +1 (cap 10) |
| Per report against | -5 |

Event trust: `min(100, organizer_score × 0.6 + registrations × 2)`

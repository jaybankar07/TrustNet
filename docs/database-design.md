# Database Schema Overview

The relational PostgreSQL database contains the following critical tables:

## 1. `users` (CustomUser)
- `id` (UUID, Primary Key)
- `phone_no` (String, Unique)
- `is_verified` (Boolean)
- `trust_score` (Integer, default 10)
- `face_data` (Text, biometric mapping)

## 2. `companies`
- `id` (UUID)
- `name` (String, requires exact GST match)
- `gst_number` (String, Unique)
- `owner` (ForeignKey -> Users)

## 3. `events`
- `id` (UUID)
- `organizer` (ForeignKey -> Users)
- `title`, `date`, `location`
- `is_online` (Boolean)

## 4. `posts` & `comments`
- Generates the heavily relational social feed mapping content and media URLs.

## 5. `referrals`
- `creator` (ForeignKey -> Users)
- `invited_user` (ForeignKey -> Users)
- `reward_status`

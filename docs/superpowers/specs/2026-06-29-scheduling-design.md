# Sassy Lash & Skin — Scheduling App Design

**Date:** 2026-06-29
**Status:** Approved

---

## Overview

Web-based scheduling app for Sassy Lash & Skin. Clients browse services and available time slots, submit a booking request as a guest, and receive SMS confirmation after the owner approves. Owner manages appointments via SMS reply or admin dashboard.

---

## Services

| Service   | Duration |
|-----------|----------|
| Full Set  | 120 min  |
| Regular   | 60 min   |
| Mini      | 30 min   |

---

## Stack

| Layer        | Tool                          |
|--------------|-------------------------------|
| Frontend/API | Next.js (App Router)          |
| Database     | Supabase (PostgreSQL)         |
| Auth         | Supabase Auth (owner only)    |
| Hosting      | Vercel                        |
| SMS          | Twilio                        |

Scale: <100 users. No client login for POC (guest booking). Payment out of scope for POC.

---

## Architecture

```
Client Browser
    │
    ▼
Next.js App (Vercel)
    ├── Public pages
    │     ├── /              → Booking page
    │     └── /confirmation  → "Pending approval" page
    ├── Admin pages (Supabase auth — owner only)
    │     ├── /admin               → Dashboard (pending + upcoming)
    │     ├── /admin/availability  → Set business hours
    │     └── /admin/clients       → Client list + history
    └── API routes
          ├── POST /api/bookings                    → Create pending booking, SMS owner
          ├── POST /api/twilio/webhook              → Handle owner YES/NO SMS reply
          └── POST /api/bookings/[id]/confirm|deny  → Admin dashboard actions

Supabase (PostgreSQL)
    ├── clients
    ├── services
    ├── bookings
    └── availability

Twilio → SMS to owner on new booking, SMS to client on confirm/deny
```

---

## Booking Flow

1. Client picks service → sees available date → picks open slot → fills name/phone/email → submits
2. Slot immediately marked `pending` (blocked from other bookings via DB transaction)
3. Owner receives SMS: `"New booking: Jane Smith, Full Set, Mon Jul 7 @ 10am. Reply YES to confirm or NO to deny."`
4. Owner confirms via SMS reply (YES/NO) or admin dashboard button
5. Client receives SMS: confirmed with details, or denied with rebook link

---

## Data Model

```sql
-- Services (seeded, editable later)
services (
  id            uuid PK,
  name          text,
  duration_minutes integer,
  description   text,
  active        boolean DEFAULT true
)

-- Clients (created at booking time)
clients (
  id            uuid PK,
  name          text,
  phone         text,
  email         text,
  created_at    timestamptz
)

-- Owner availability (defaults: Mon–Fri 9am–5pm)
availability (
  id            uuid PK,
  day_of_week   integer,  -- 0=Sun, 1=Mon ... 6=Sat
  start_time    time,
  end_time      time,
  is_active     boolean
)

-- Bookings
bookings (
  id                uuid PK,
  short_ref         text UNIQUE,  -- 6-char alphanumeric, used in SMS (e.g. "A3X9K2")
  client_id         uuid → clients,
  service_id        uuid → services,
  start_time        timestamptz,
  end_time          timestamptz,  -- computed: start + duration
  status            text,         -- pending | confirmed | denied | cancelled | expired
  twilio_message_sid text,        -- owner SMS tracking
  notes             text,
  created_at        timestamptz,
  updated_at        timestamptz
)
```

**Slot generation (server-side):**
- Load availability for requested day
- Load all `pending` + `confirmed` bookings for that day
- Walk business hours in `duration_minutes` steps
- Exclude slots overlapping existing bookings
- Return open slots

---

## Pages

### `/` — Client Booking Page
1. Service cards (Full Set / Regular / Mini) with duration
2. Date picker — Mon–Fri only, no past dates
3. Time slot grid — open slots for selected service + date
4. Booking form — name, phone, email
5. Submit → redirect to `/confirmation`

### `/confirmation`
- "Your request is pending — we'll text you shortly."

### `/admin` — Owner Dashboard
- Tabs: Pending | Upcoming | Past
- Booking cards: client name, service, date/time, phone
- Confirm / Deny buttons on pending cards

### `/admin/availability`
- Toggle each weekday on/off
- Set open/close time per active day

### `/admin/clients`
- Table: name, phone, email, appointment count, last visit
- Row click → booking history

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/bookings` | POST | Create pending booking, SMS owner |
| `/api/bookings/[id]/confirm` | POST | Confirm booking, SMS client |
| `/api/bookings/[id]/deny` | POST | Deny booking, free slot, SMS client |
| `/api/twilio/webhook` | POST | Parse owner SMS reply, route to confirm/deny |
| `/api/slots` | GET | Return available slots for date + service |

---

## SMS Messages

**To owner (new booking):**
> New booking request: [Name], [Service], [Day] [Date] @ [Time]. Reply YES [ref] to confirm or NO [ref] to deny. (e.g. "YES A3X9K2")

**To client (confirmed):**
> Hi [Name]! Your [Service] appointment at Sassy Lash & Skin is confirmed for [Day], [Date] at [Time]. See you then!

**To client (denied):**
> Hi [Name], unfortunately we couldn't accommodate your [Service] on [Date]. Please visit [url] to find another time.

**To client (expired):**
> Hi [Name], your booking request expired before it could be confirmed. Please visit [url] to rebook.

**To owner (invalid reply):**
> Reply YES [ref] or NO [ref] to act on a booking. (e.g. "YES A3X9K2")

**Twilio webhook matching:**
- Parse first word (YES/NO) and second word (ref) from owner reply
- If ref present: match booking by `short_ref`
- If no ref: match to oldest pending booking
- If no pending bookings: reply "No pending bookings found."

---

## Error Handling & Edge Cases

| Scenario | Handling |
|----------|----------|
| Double-booking race | Slot marked `pending` in DB transaction on submit; second request gets "slot unavailable" |
| Owner no response | Pending bookings expire after 24hrs via Vercel cron; slot freed, client notified |
| Invalid SMS reply | Twilio webhook sends clarification message back to owner |
| Owner denies | Slot freed immediately, client texted denial + rebook link |
| Duplicate client booking | Check by phone — warn if pending/confirmed future booking exists |
| No available slots | Calendar day shows "Fully booked" |

---

## Out of Scope (POC)

- Payment / deposits
- Client accounts / login
- Photo uploads
- Intake forms
- Loyalty tracking
- Multiple staff members
- Email notifications (SMS only for now)

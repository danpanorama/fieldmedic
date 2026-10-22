# FieldMedic — Product Requirements

> Status: draft v0.1 · Last updated: 2026-10-22

## One-liner

Medics see open football matches near them and assign themselves. The system blocks clashes, suggests back-to-back matches, and fills last-minute gaps.

## The problem

Every youth and amateur match in Israel needs a licensed medic. Today a coordinator fills each match by phone:

- Hours of calls every week, and the work does not scale beyond one district
- Medics get double-booked, or take matches they can't reach in time
- When a medic drops out, the coordinator starts calling all over again
- No single place shows which matches are still uncovered
- Pay (₪200–400 per match) is tracked by hand

## Users and roles

| Role            | Scope                     | Main job                                                |
| --------------- | ------------------------- | ------------------------------------------------------- |
| **Medic**       | Themself                  | Find matches, assign themself, see schedule and earnings |
| **Coordinator** | One or more districts     | Make sure every match has a medic                       |
| **Admin**       | Whole country             | Manage districts, coordinators, rates and imports        |

The product is built for national scale from day one: many districts, thousands of medics, and hundreds of matches every weekend.

## Core flows

### 1. Medic onboarding

- Signs up with name, phone, home city and **license number**
- License is verified against the license registry (mocked in the demo; see open questions)
- Until verified, or after expiry, the medic can browse but can't take matches
- Reminder before the license expires

### 2. Finding and taking a match (medic)

- "Open matches" list with filters: **this week**, **near me**, **my matches**
- Each card shows: date, time window, age group / league, venue, distance, pay
- The system checks every match against the medic's schedule:
  - ⛔ **Clash:** overlaps a match they already hold, including travel time → button disabled, with a reason
  - ✅ **Back-to-back:** "Your 08:30 match ends 09:45, ~15 min drive" → suggested
  - ✅ **Free:** no conflict
- "I'll take it" assigns them instantly. **If two medics tap at the same moment, exactly one gets the match.**

### 3. Match board (coordinator)

- All matches in their districts, grouped by day, with the assigned medic or an **"No medic"** badge
- Summary: matches this week / covered / uncovered
- Add or edit a match manually; can assign or remove a medic directly

### 4. Filling a gap ("first to tap gets it")

- In v1, medics **cannot cancel by themselves**. They contact the coordinator, who removes them.
- When a match opens up close to kickoff, the system notifies eligible medics: nearby, licensed, and with no clash
- The first medic to accept gets the match; everyone else sees "already taken"
- If nobody accepts by a deadline, the coordinator is alerted

### 5. Reports

- Medic: my matches and earnings this month
- Coordinator/admin: coverage per district, matches per medic, monthly pay report (export to Excel)

## Data sources

- **Matches** come from the Israel Football Association database. **The demo uses seeded fake data** behind a `MatchSource` interface, so the real feed can be plugged in later without touching the rest of the system.
- **Licenses** come from a license registry, through a `LicenseVerifier` interface. The demo uses a mock.

## Business rules (v1)

- A medic can't hold two matches that overlap, including estimated travel time between venues
- Pay per match is ₪200–400, set by age group / league (admin-managed rate table)
- Only medics with a valid license can take a match
- No self-cancellation in v1

## MVP for the demo

In scope:

- Sign up / log in, with roles (medic, coordinator)
- Seeded districts, venues, matches and medics
- Open matches list with clash and back-to-back detection
- Self-assignment with race-condition safety
- Coordinator match board with coverage summary
- Mobile-first, Hebrew, right-to-left

Next, after the demo:

- Gap filling with notifications (Web Push)
- Real distance and travel time (maps API)
- Reports and Excel export
- License expiry reminders

Out of scope for now:

- Native iOS/Android apps (the web app is installable as a PWA)
- Paying medics through the app
- Real IFA and license integrations (until access is granted)

## Privacy

The system stores personal data (phone numbers, license numbers, locations). Only what's needed is collected, medics see only their own data, coordinators see only their districts, and all data is encrypted in transit.

## Open questions (for the coordinator)

1. What exactly is the license registry, and how do we get access?
2. Can a medic ever cancel? If so, until when, and what happens next?
3. How long a gap is required between matches, beyond travel time?
4. Is there a cap on matches per medic per day?
5. Who else needs access: clubs, the IFA?
6. Exact rate table: which age group or league pays what?

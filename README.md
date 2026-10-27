# KaushalShetu — Cooperative Training ERP

A secure, multi-device training management platform for cooperative and vocational institutions. KaushalShetu brings course authoring, session scheduling, **QR-based attendance**, assessments, certification, and job matching into one installable web application backed by a serverless API and a hosted relational database.

> **Repository:** <https://github.com/gitakhileshyadav/KaushalShetu-SIH>
> **Live demo:** Contact the maintainers for the demo URL and access credentials.
> Demo accounts are seeded automatically on first run.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Building](#building)
  - [Deployment](#deployment)
- [Using the Platform](#using-the-platform)
- [Smoke Test Checklist](#smoke-test-checklist)
- [Project Structure](#project-structure)
- [Security Notes](#security-notes)
- [License](#license)

---

## Overview

KaushalShetu is a full-stack training operations platform. Trainers author courses and schedule sessions; trainees enroll, watch lessons, take assessments, and record attendance by scanning a QR code; administrators approve courses and manage content; employers post jobs and review applications.

The application is designed for environments with unreliable connectivity: writes are applied optimistically, queued locally when the network is unavailable, and replayed automatically once connectivity returns. Because the database is accessed only by server-side functions, credentials never reach the browser.

---

## Features

- **Course authoring & approval** — trainers create courses with notes, PDF resources, and video lessons; admins review, approve, or reject with remarks.
- **Session scheduling** — dated sessions with topic, time window, and venue.
- **QR attendance** — expiring per-session tokens; validation (expiry, enrollment, duplicates) is enforced server-side.
- **Multi-device sync** — background polling keeps every signed-in device current without manual refreshes.
- **Offline-tolerant writes** — local write queue with automatic replay on reconnect.
- **Assessments & certification** — timed multiple-choice assessments, auto-scoring, and verifiable certificate numbers.
- **Public verification** — look up an attendance token, session ID, or certificate number.
- **Employer portal** — job postings and trainee applications.
- **Admin content desk** — administrators can edit or delete any course material (notes, PDFs, lessons) as an override layer.
- **Installable PWA** — add to home screen; cached assets load without a network.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Build | Vite, `vite-plugin-pwa` (Workbox) |
| QR | `qrcode.react` (display), `html5-qrcode` (camera scanning) |
| Backend | Vercel Serverless Functions (Node.js ESM) |
| Database | Turso (libSQL) via `@libsql/client` |
| Auth | HMAC-signed bearer tokens, `bcryptjs` password hashing |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| Turso account | Free tier is sufficient (<https://turso.tech>) |
| Vercel CLI (optional) | `npm i -g vercel` |

### Installation

```bash
git clone https://github.com/gitakhileshyadav/KaushalShetu-SIH.git
cd KaushalShetu-SIH
npm install
```

### Database Setup

```bash
turso auth signup
turso db create kaushalshetu
turso db show kaushalshetu --url        # → TURSO_DATABASE_URL
turso db tokens create kaushalshetu     # → TURSO_AUTH_TOKEN
```

No manual schema step is required — tables, idempotent migrations, and seed data are created automatically on first use.

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```dotenv
TURSO_DATABASE_URL="libsql://your-database-name.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
SESSION_SECRET="a-long-random-string"
```

| Variable | Required | Purpose |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | libSQL connection URL for the Turso database. |
| `TURSO_AUTH_TOKEN` | Yes | Turso database authentication token. |
| `SESSION_SECRET` | Yes (production) | HMAC key for signing session tokens. |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Never prefix these variables with `VITE_`.** Vite inlines `VITE_*` values into the public browser bundle. All database and signing credentials must remain server-only.

### Running Locally

**Option A — two terminals (recommended):**

```bash
# Terminal 1 — API functions on port 3001
npx vercel dev --listen 3001

# Terminal 2 — Vite dev server on port 3000 (proxies /api → 3001)
npm run dev
```

Open <http://localhost:3000>.

**Option B — single command:**

```bash
npx vercel dev
```

### Building

```bash
npm run build     # production build → dist/
npm run preview   # serve the build locally
npm run lint      # TypeScript check
```

### Deployment

```bash
vercel link
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production
vercel env add SESSION_SECRET production
vercel --prod
```

Alternatively, connect the repository in the Vercel dashboard; pushes to `main` deploy automatically. `vercel.json` contains the build configuration, SPA rewrites, and security headers.

---

## Using the Platform

1. **Sign in** with a seeded account. The first run provisions administrator, trainer, trainee, and employer accounts, a demo course catalog, sample sessions, and assessments.
2. **Trainer:** create a course, wait for approval, then schedule a session and open its QR display.
3. **Trainee:** enroll in a course, open the scanner, select the session, and scan the projected QR code.
4. **Admin:** approve or reject courses and use **Edit Content** on any course to correct notes, PDF resources, or lesson videos.
5. **Employer:** publish job postings and review applications.

---

## Smoke Test Checklist

- [ ] `GET /api/health` reports a healthy database connection.
- [ ] Login succeeds for each role and fails for invalid credentials.
- [ ] Trainer creates a course; admin approves it; trainee sees it in the catalog.
- [ ] Trainer creates a session and generates a QR token.
- [ ] Trainee scans the QR on a second device; attendance is recorded.
- [ ] A second scan of the same session is rejected as a duplicate.
- [ ] A change made on one device appears on another within the sync interval.
- [ ] Writes made offline are replayed after reconnecting.
- [ ] `npm run lint` and `npm run build` complete without errors.

---

## Project Structure

```
api/                  Serverless functions (auth, data gateway, attendance, verification)
src/
  components/         Role-based UI (admin, trainer, trainee, employer, shared pages)
  context/            Central application state and sync logic
  data/               Seed content (courses, users, sessions, assessments)
  lib/                API client, token storage, offline queue
  types/              Domain types
docs/                 Internal documentation (not tracked)
vercel.json           Deployment configuration
vite.config.ts        Build and PWA configuration
```

---

## Security Notes

- Database credentials are referenced **only** inside server-side functions; they are never bundled into client code.
- Passwords are stored as bcrypt hashes and are never returned by the API.
- Session tokens are HMAC-signed and expire; missing `SESSION_SECRET` fails closed in production.
- Attendance validity (token expiry, enrollment approval, duplicate prevention) is decided server-side.
- All database writes require an authenticated bearer token; sensitive token data requires authentication to read.
- `.env` files are gitignored; only `.env.example` (placeholders) is tracked.

---

## License

Released under the **MIT License**. See [LICENSE](./LICENSE) for details.

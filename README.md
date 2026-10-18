# E-Gatepass — Student Leave & Gatepass Management

<div align="center">

![E-Gatepass](https://img.shields.io/badge/E--Gatepass-Campus%20departures-173c35?style=for-the-badge)

**A role-based campus workflow for student leave requests, administrative review, and gate verification.**

[![React](https://img.shields.io/badge/React-18-149eca?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Not%20specified-lightgrey?style=flat-square)](#-license)

[Live application](https://byrohithreddy.github.io/Epass-management-system/) · [Features](#-key-capabilities) · [Setup](#-local-development) · [Database](#-database-and-supabase-setup) · [Security](#-security-and-deployment-notes)

</div>

---

## 📌 Overview

**E-Gatepass** connects three steps in a campus departure process:

1. A student identifies themselves and submits a leave request.
2. An administrator reviews the request and records a decision.
3. A guard verifies an approved pass and records the student's checkout.

The application is a React single-page app. It uses Supabase's JavaScript client to read and write request records, checkout logs, and optional supporting-document files. Student and guard screens use barcode scanning when a camera is available, with manual student-ID entry as an alternative.

> **Deployment and security notice:** The current administrator sign-in is a client-side demonstration check, not Supabase Auth. The supplied SQL migrations also include broad anonymous read policies, and their administrator update policy is for authenticated Supabase users. Review and replace the authentication and Row Level Security policies before using real student records or deploying for institutional use.

---

## 🏛️ Application Architecture

```text
┌───────────────────────────────────────────────┐
│             E-Gatepass web client             │
│       React · TypeScript · Vite · Tailwind    │
└──────────────────────┬────────────────────────┘
                       │ Supabase JavaScript SDK
                       │ HTTPS / PostgREST / Storage
                       ▼
┌───────────────────────────────────────────────┐
│                  Supabase                     │
│       PostgreSQL · Row Level Security ·       │
│       Storage bucket for documents            │
└───────────────────────────────────────────────┘

Student ID barcode ──► ZXing browser scanner
Administrator ───────► Request review and analytics
Guard station ────────► Today's approved pass and checkout log
```

The repository does not contain a separate application API server. Database access is made from the browser through Supabase. The Vite `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values are included in the built client; they are not server-side secrets. Database security must therefore be enforced by Supabase configuration and policies, not by hiding browser code.

---

## ✨ Key Capabilities

### Student workspace

- Scan a student ID barcode or enter an ID manually.
- Submit a request with section, department, departure date and time, reason, and optional expected return time.
- Optionally attach a supporting document.
- Review previous requests and their current status.
- See the request's progress from student ID to review to departure.

### Administrator workspace

- Review submitted requests.
- Approve or reject requests.
- Optionally set an approved return time and add administrator notes.
- Open analytics for request totals, statuses, departments, recent trends, frequent applicants, checkout counts, and pending-request age.

### Guard station

- Scan a student ID or enter it manually.
- Look up an approved gatepass for the current day.
- Review pass details and log checkout.

### Shared interface

- Student, administrator, and guard workspaces in one responsive app.
- Barcode scanning through `@zxing/browser`, with a manual-entry fallback.
- Keyboard focus indicators, a skip-to-content link, dialog labeling, and reduced-motion styling.
- A warm limestone and evergreen visual system documented in [DESIGN.md](./DESIGN.md).

---

## 🔄 Request Workflow and Statuses

```text
Student ID → Request submitted → Administrator review → Approved departure → Guard checkout logged
```

The database status values used by the app are:

| Status | Meaning in the application |
|---|---|
| `Pending` | Waiting for an administrator decision |
| `Approved` | Approved; eligible for the guard's approved-pass lookup |
| `Rejected` | Not approved |
| `Returned` | Supported in request records and analytics |

The guard workflow writes a `Checked Out` row to `check_logs`. It does not currently update the associated request to `Returned` or record a return-to-campus event. Status values describe application records; they are not an independent identity or authorization system.

---

## 🧰 Technology Stack

| Area | Technology | Use |
|---|---|---|
| UI framework | React 18 | Role-based single-page interface |
| Language | TypeScript | Application code and data types |
| Build and development | Vite 5 | Local server and static production build |
| Styling | Tailwind CSS 3 and project CSS | Layout, responsive behavior, and design tokens |
| Backend client | Supabase JavaScript SDK | PostgreSQL and Storage access |
| Barcode scanning | `@zxing/browser`, `@zxing/library` | Browser-based barcode reading |
| Icons | Lucide React | Interface iconography |
| Hosting workflow | GitHub Actions / GitHub Pages | Builds and deploys the static site |

---

## 🚀 Local Development

### Prerequisites

- Node.js 18 or later
- npm
- A Supabase project for connected workflows

### 1. Get the source and install packages

```bash
git clone https://github.com/byrohithreddy/Epass-management-system.git
cd Epass-management-system
npm ci
```

### 2. Configure Supabase

Create a local `.env.local` file in the repository root:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Use the **project URL** and the **publishable/anon key** from the Supabase project settings. Do not put a service-role key or other privileged credential in a `VITE_` variable: Vite exposes these values to every browser user in the compiled application.

The app checks for both variables at startup and will throw an error if either is missing.

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). Vite's development server supports local client-side routes. Camera access is generally available on `localhost`; deployed camera access requires HTTPS and user permission.

### 4. Check and build

```bash
npm run lint
npm run build
npm run preview
```

`npm run preview` serves the generated `dist/` build locally. The repository does not currently define an automated test script.

---

## 🗄️ Database and Supabase Setup

SQL migrations are in [`supabase/migrations/`](./supabase/migrations/). For a **new, empty Supabase project**, review and apply them in timestamp order using the Supabase SQL Editor:

1. `20250607085243_holy_pond.sql`
2. `20250620150104_royal_trail.sql`

> **Destructive migration warning:** The second migration truncates `check_logs` and `leave_requests` before adding fields and the `Returned` status. Do not run it against a database containing records unless you have intentionally backed up the data and accept its deletion. Inspect the SQL and take a verified backup before applying migrations to an existing project.

### Tables used by the application

#### `leave_requests`

| Column | Type / behavior | Purpose |
|---|---|---|
| `id` | UUID, generated primary key | Request identifier |
| `student_id` | Text, required | Student identifier read from barcode or entered manually |
| `section` | Text, required | Student section |
| `department` | Text | Department used in request review and analytics |
| `leave_datetime` | Timestamp with time zone, required | Requested departure time |
| `return_datetime` | Timestamp with time zone | Student's expected return time |
| `approved_return_datetime` | Timestamp with time zone | Administrator's approved return time |
| `description` | Text, required | Reason/details for the request |
| `file_url` | Text | Optional supporting-document URL |
| `status` | Text, defaults to `Pending` | `Pending`, `Approved`, `Rejected`, or `Returned` |
| `submitted_at` | Timestamp with time zone, defaults to current time | Submission timestamp |
| `admin_notes` | Text | Optional administrator note |

#### `check_logs`

| Column | Type / behavior | Purpose |
|---|---|---|
| `id` | UUID, generated primary key | Log identifier |
| `student_id` | Text, required | Student whose departure was recorded |
| `leave_id` | UUID referencing `leave_requests.id` | Related request |
| `timestamp` | Timestamp with time zone, defaults to current time | Checkout time |
| `action` | Text, defaults to `Checked Out` | Logged action |

### Supporting-document storage

The student form uploads files to a Supabase Storage bucket named `leave-documents` and stores a public URL on the request. The SQL migrations do **not** create this bucket or its Storage policies. Configure the bucket and review access rules separately if uploads are required.

The current code retrieves public URLs and does not use signed URLs. Do not upload confidential or sensitive documents using this arrangement. Before handling real documents, design an access-controlled private-storage workflow and limit who can read each file.

### Row Level Security (RLS) configuration

The supplied first migration enables RLS and defines policies, but those policies are not a production authorization design:

- Anonymous users are allowed to read all `leave_requests` and `check_logs` rows under the policies created by the migration.
- Anonymous users can insert leave requests and checkout logs.
- The migration's request-update policy applies to the Supabase `authenticated` role.
- The app's administrator login is a local client-side comparison and does not sign in through Supabase Auth. Its database requests still use the configured Supabase anon key.

Consequently, the administrator UI's login screen does not itself grant the database role required by that update policy. Do not treat the demo UI login as access control. Define and test restrictive policies and implement a trusted administrator authentication/authorization design before using the app with real institutional data. Avoid exposing broad student or checkout records through anonymous access.

---

## 🌐 Deployment to GitHub Pages

The repository includes a GitHub Actions workflow at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml). On pushes to `main`, it installs dependencies, builds the Vite app, and deploys `dist/` to GitHub Pages.

1. In repository settings, enable GitHub Pages with **GitHub Actions** as the build and deployment source.
2. Add repository Actions secrets named:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push to `main` and review the workflow run and Pages deployment status.

The Vite base path is set to `/Epass-management-system/` in [`vite.config.ts`](./vite.config.ts), matching the current repository's GitHub Pages project path. If you deploy under a different repository name or custom domain, update the Vite `base` setting accordingly.

**Build-time configuration:** `VITE_` variables are compiled into the public JavaScript bundle. GitHub Actions secrets prevent committing the values in source, but they do not make a browser-exposed anon key private. Supabase RLS is essential.

---

## 🔐 Security and Deployment Notes

This repository is a client-side application, not a hardened access-control service. Review all of the following before handling real student data:

- **Administrator sign-in:** The current page compares credentials in frontend code. It is demonstrative only, can be inspected by users, and is not Supabase Auth. Replace it with real authentication and server/database-enforced authorization.
- **Database access:** Browser requests use the Supabase anon key. Enforce least-privilege RLS on every table and Storage bucket. Review existing policies; do not rely on hidden UI controls or client-side state.
- **Student identity:** A scanned or manually entered student ID identifies a lookup value only. The current app does not authenticate the student presenting that ID.
- **Guard verification:** The guard workflow queries records from the client. Restrict access to only the data and operations that guards must have.
- **Public documents:** The current public-URL upload flow is inappropriate for confidential documents without additional access controls.
- **Data minimization:** Request descriptions, student IDs, document URLs, and checkout times can be sensitive. Set retention, access, and incident-response practices appropriate to your institution.
- **Network dependency:** Student, administrator, guard, and analytics workflows require connectivity to Supabase. Offline operation is not implemented.
- **Camera privacy:** Camera access is initiated for barcode scanning and requires browser permission. A manual-ID fallback is available.
- **No settlement or identity guarantee:** An approved request in the database and a matching ID string are application data, not cryptographic proof of identity or an institutional authorization guarantee.

---

## 📁 Repository Layout

```text
Epass-management-system/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages build and deployment
├── src/
│   ├── components/
│   │   ├── AnalyticsDashboard.tsx  # Administrator analytics
│   │   ├── BarcodeScanner.tsx      # Camera scanning and manual ID entry
│   │   ├── Navigation.tsx           # Role navigation
│   │   └── RequestRoute.tsx         # Shared request progress component
│   ├── lib/
│   │   └── supabase.ts              # Supabase client and application types
│   ├── pages/
│   │   ├── AdminPage.tsx            # Admin login, request review
│   │   ├── GuardPage.tsx            # Pass verification and checkout
│   │   └── StudentPage.tsx          # Request form and status
│   ├── App.tsx                      # App shell and role selection
│   └── index.css                    # Design tokens and responsive styles
├── supabase/
│   └── migrations/                  # Database schema migrations
├── DESIGN.md                        # UI direction and design system
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔒 License & Intellectual Property

**Copyright © 2026 Mushke Rohith Reddy. All Rights Reserved.**

### PROPRIETARY AND CONFIDENTIAL

This software, including all source code, documentation, designs, database schemas, interfaces, and intellectual property associated with **E-Gatepass**, is strictly proprietary and the exclusive property of **Mushke Rohith Reddy**.

#### Terms & Usage Restrictions

1. **No Unauthorized Use:** You may **not** copy, modify, distribute, reproduce, sublicense, publish, sell, host, mirror, or commercially exploit this software or any portion of its code without explicit, prior written authorization and licensing from the copyright holder.
2. **No Free or Public Distribution:** This project is **not** open-source software and is **not** provided under MIT, Apache, GPL, or any other public/copyleft license. No individual or entity is permitted to deploy, fork, or use this application without a verified license agreement.
3. **No Reverse Engineering:** Reverse engineering, decompiling, extracting, or repurposing proprietary application logic and workflows from this project is prohibited without authorization.

For licensing inquiries, institutional deployments, or commercial partnerships, please contact: 📧 **[rohith2005hyd@gmail.com](mailto:rohith2005hyd@gmail.com)**

Third-party dependencies and services remain subject to their respective licenses and terms.

---

<div align="center">

Designed & Architected by **Mushke Rohith Reddy**

</div>

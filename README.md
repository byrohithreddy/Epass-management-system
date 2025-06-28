# 🛂 Student Gate Pass Management System (ePass)

A streamlined, private leave management system tailored for educational institutions. Designed for internal deployment, this system facilitates secure student leave applications, admin approval workflows, and guard-level verification via ID barcode scanning.

---

## 📌 Core Features

* 📷 **Barcode-Based ID Scanning** – Uses the Code128 standard for efficient student identification.
* 🡩‍🏫 **Student Portal** – Allows students to apply for leave without requiring login.
* 🛡️ **Admin Panel** – Login-protected interface for reviewing, approving, or rejecting leave requests.
* 🚪 **Guard Interface** – Enables real-time verification of leave status and logs student check-outs.
* 📃 **Supabase Integration** – Centralized backend for data and file storage.
* 🔐 Simplified Access Control – No login needed for students or guards; only admins require authentication.

---

## 🤩 Tech Stack Overview

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | Bolt.ai (Exported Static Site)              |
| Backend  | Supabase (Database, Auth, Storage)          |
| Hosting  | GitHub Pages (Static Hosting)               |
| Scanner  | @zxing/library (JavaScript barcode scanner) |

---

## 🗈️ User Workflow

### 👨‍🏫 Students

1. Navigate to the **Student** page.
2. Scan their ID barcode.
3. A leave request form pre-fills their ID.
4. Complete remaining fields and optionally upload supporting documents.
5. Submit the form to store the request in Supabase.

### 🧑‍💼 Admins (PA/HOD)

1. Navigate to the **Admin** page.
2. Log in via Supabase Auth.
3. Review all pending leave requests.
4. Approve or reject requests, optionally adding notes.

### 🚫 Guards

1. Navigate to the **Guard** page.
2. Scan the student's ID barcode.
3. View approved leave status in real-time.
4. Click `Check-out` to log the student’s exit.

---

## 🛠️ Deployment Instructions

### ▫️ Frontend Setup

1. Export the Bolt.ai project as a static site.
2. Place the exported files in the root of this repository.
3. Ensure Supabase credentials are embedded or bundled during build.

### ▫️ Supabase Configuration

1. Create a new Supabase project.
2. Define the following tables:

   * `leave_requests`
   * `check_logs`
3. Enable **Row-Level Security (RLS)** for both tables.
4. Connect to Supabase via the `supabase.js` configuration file.

### ▫️ GitHub Pages Hosting

1. Push the code to the `main` branch.
2. In **Repository Settings → Pages**, set source to:

   ```
   Branch: main
   Folder: / (root)
   ```
3. The system will be accessible at:

   ```
   https://<your-organization>.github.io/Epass-management-system
   ```

> Note: Make sure Supabase credentials are properly injected during the build process (e.g., using Vite or a static bundler).

---

## 📁 Database Schema

### `leave_requests`

| Field                      | Type      | Description                           |
| -------------------------- | --------- | ------------------------------------- |
| id                         | UUID      | Unique identifier                     |
| student\_id                | Text      | ID from scanned barcode               |
| section                    | Text      | Student’s section                     |
| leave\_datetime            | Timestamp | Leave request start time              |
| return\_datetime           | Timestamp | Expected return time (optional)       |
| approved\_return\_datetime | Timestamp | Admin-approved return time (optional) |
| description                | Text      | Leave reason                          |
| file\_url                  | Text      | Supporting file (if uploaded)         |
| status                     | Text      | `Pending`, `Approved`, etc.           |
| submitted\_at              | Timestamp | Auto-filled on submission             |
| admin\_notes               | Text      | Optional admin comment                |

### `check_logs`

| Field       | Type      | Description             |
| ----------- | --------- | ----------------------- |
| id          | UUID      | Unique identifier       |
| student\_id | Text      | Scanned student ID      |
| leave\_id   | UUID      | Linked leave request ID |
| timestamp   | Timestamp | Time of check-out       |
| action      | Text      | Example: `Checked Out`  |

---

## 🔐 Access Notes

This project is for **internal institutional use only**. It is not open source and is not intended for public distribution or modification. Unauthorized duplication or redistribution is prohibited.

---

## 🗺️ Support & Maintenance

For internal usage, please Contact: [rohith2005hyd+work@gmail.com](mailto:rohith2005hyd+work@example.com)


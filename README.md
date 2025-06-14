# 🛂 Student Gate Pass Management System (ePass)

A simple, low-code, student leave management system built using **Bolt.ai** for the frontend and **Supabase** as the backend. This system enables students to apply for leave, allows admins to approve or reject requests, and lets guards verify students' approved leaves using their ID barcode.

---

## 📌 Features

* 📷 **Barcode-based ID scan** using Code128 standard
* 🧑‍🎓 **Student page** to apply for leave (no login required)
* 🛡️ **Admin panel** (login required) to approve or reject requests
* 🚪 **Guard portal** to verify and log check-outs
* 🗃️ Supabase integration for database and file storage
* 🔒 Role-based access control without complex auth for non-admins

---

## 🧩 Tech Stack

| Layer    | Tech                                |
| -------- | ----------------------------------- |
| Frontend | Bolt.ai (Exported Static Site)      |
| Backend  | Supabase (DB, Storage, Auth)        |
| Hosting  | GitHub Pages                        |
| Scanning | @zxing/library (JS barcode scanner) |

---

## 🖼️ System Flow

### 👨‍🎓 Student

1. Click `Student` in navigation
2. Scan ID barcode
3. Auto-filled form opens
4. Fill remaining fields (section, date/time, description, file)
5. Submit the request → stored in Supabase

### 🧑‍💼 Admin (HOD/PA)

1. Click `Admin`
2. Login via Supabase Auth
3. View all pending leave requests
4. Approve or Reject each

### 🛑 Guard

1. Click `Guard`
2. Scan student's ID
3. View approved leave
4. Click `Check-out` to log exit in Supabase

---

## 🛠️ Project Setup

### 🔹 Export & Deploy Frontend

```bash
# Export Bolt project
Unzip and place in repo root
```

### 🔹 Supabase Setup

1. Create a new Supabase project
2. Create `leave_requests` and `check_logs` tables
3. Enable Row-Level Security (RLS) rules
4. Use `supabase.js` to connect from frontend

### 🔹 GitHub Pages Deployment

1. Push code to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/root`
4. Access site at `https://<username>.github.io/Epass-management-system`

---

## 📁 Supabase Tables Schema

### `leave_requests`

| Field           | Type      | Notes                         |
| --------------- | --------- | ----------------------------- |
| id              | UUID      | Primary key                   |
| student\_id     | Text      | From barcode                  |
| section         | Text      |                               |
| leave\_datetime | Timestamp | Date & time of leave          |
| description     | Text      | Reason                        |
| file\_url       | Text      | Optional uploaded file        |
| status          | Text      | Pending / Approved / Rejected |
| submitted\_at   | Timestamp | Default: now()                |

### `check_logs`

| Field       | Type      | Notes                 |
| ----------- | --------- | --------------------- |
| id          | UUID      | Primary key           |
| student\_id | Text      |                       |
| leave\_id   | UUID      | FK to leave\_requests |
| timestamp   | Timestamp | Check-out time        |
| action      | Text      | Example: Checked Out  |

---

## 📸 Screenshots

*Add screenshots of student form, admin panel, and guard check-out here.*

---

## 📃 License

MIT License

---

## 🤝 Contributors

* [@byrohithreddy](https://github.com/byrohithreddy)
* Built using Bolt.ai + Supabase

---

## 📬 Contact

For queries or suggestions, raise an issue or contact me via GitHub.

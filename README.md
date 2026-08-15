# 🎓 Campus Guide

> A smart campus resource discovery platform that merges a searchable academic resource hub, role-based access control, and an interactive 3D campus map into a single unified experience.

<p align="center">
  <img src="public/logo.png" alt="Campus Guide Logo" width="120" />
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Role-Based Auth** | JWT-secured login for Students, Professors, Admins, and Guests |
| 📚 **Resource Hub** | Search, upload, download, and bookmark academic materials |
| 🗺️ **3D Campus Map** | Interactive three.js campus model with route visualization |
| 🔔 **Notifications** | Real-time alerts for uploads, admin actions, and building changes |
| 🛡️ **Admin Dashboard** | Full user, resource, and building management panel |
| 📥 **Download History** | Per-user audit trail of downloaded resources |

---

## 🛠️ Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | 12 | Animations & transitions |
| three.js / R3F | 0.183 / 9 | 3D campus map rendering |
| Zustand | 5 | Client state management |
| React Router | 7 | Client-side routing |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | 5 | REST API server |
| MongoDB + Mongoose | 9 | Database & ODM |
| JWT | 9 | Stateless authentication |
| bcryptjs | 3 | Password hashing |
| Multer | 2 | File upload handling |

---

## 📁 Project Structure

```
CAMPUS-GUIDE/
├── backend/
│   ├── index.js             # Express entry point
│   ├── .env.example         # Environment variable template
│   ├── models/              # Mongoose schemas (User, Resource, Building, …)
│   ├── routes/              # Auth, Admin, Resource, Notification routes
│   ├── middleware/          # JWT auth & role guards
│   ├── services/            # Notification service
│   └── uploads/             # User-uploaded files (git-ignored)
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root router
│   ├── components/
│   │   ├── map/             # 3D map scene & building components
│   │   ├── admin/           # Admin panel components
│   │   ├── sections/        # Landing page sections
│   │   └── ui/              # Shared UI primitives
│   ├── pages/               # Route-level page components
│   ├── hooks/               # Custom React hooks
│   └── store/               # Zustand state stores
├── public/                  # Static assets (logo, images, videos)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/sharana-basava-3019/CAMPUS-GUIDE.git
cd CAMPUS-GUIDE
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/resourcenet
JWT_SECRET=your_long_random_secret
ADMIN_SECRET_KEY=your_admin_secret
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.

### 5. Start the backend
```bash
cd backend
npm start
# Server runs at http://localhost:5000
```

### 6. Start the frontend (separate terminal)
```bash
npm run dev
# App runs at http://localhost:5173
```

---

## 🎭 User Roles

| Role | Capabilities |
|---|---|
| **Guest** | View the 3D campus map |
| **Student** | Search, download, and bookmark resources |
| **Professor** | Upload resources + student capabilities |
| **Admin** | Full management of users, resources, and buildings |

> A default admin account (`admin@gmail.com`) is auto-created on first backend startup.

---

## 🗺️ API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register a new user |
| `POST /api/auth/login` | Login and receive JWT |
| `GET /api/resources` | Search/list resources |
| `POST /api/resources/upload` | Upload a resource (Prof/Admin) |
| `GET /api/resources/download/:id` | Download a resource |
| `GET /api/notifications` | Fetch user notifications |
| `GET /api/admin/users` | List all users (Admin only) |

---

## 🏗️ Architecture

```
React Frontend  ──(HTTP REST)──►  Express Backend  ──(Mongoose)──►  MongoDB
      │                                  │
      │ (WebGL)                          └── /uploads  (static files)
      ▼
  three.js 3D Map
```

---

## 🚀 Future Enhancements

- [ ] Real-time notifications via WebSocket
- [ ] GIS-based shortest path routing
- [ ] AI-powered resource recommendations
- [ ] Floor-level indoor navigation
- [ ] Docker-based deployment setup
- [ ] Usage analytics dashboard

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👤 Author

**Sharana Basava**  
📧 sharana.20242mca0261@presidencyuniversity.in  
🔗 [GitHub](https://github.com/sharana-basava-3019)

---

<p align="center">Made with ❤️ for smarter campus experiences</p>

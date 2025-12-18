<div align="center">

# 🎵 Melodia

**Personal Music Streaming Web Application**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)

</div>

---

## 📖 Tentang Melodia

Melodia adalah aplikasi web pemutar musik yang berfokus pada **personalisasi** dan pengalaman mendengarkan musik yang sederhana namun powerful. Pengguna dapat mengelola koleksi lagu, membuat playlist pribadi, dan menikmati streaming musik dengan antarmuka yang intuitif.

Aplikasi ini dikembangkan dengan menerapkan prinsip **Object-Oriented Programming (OOP)** dalam pengelolaan entitas seperti User, Song, Playlist, dan MusicPlayer.

### 🎯 Tujuan Proyek

- ✅ Menerapkan konsep OOP (inheritance, encapsulation, abstraction, interface) secara optimal
- ✅ Menghadirkan aplikasi musik berbasis web dengan fitur playlist pribadi dan manajemen lagu
- ✅ Melatih kolaborasi tim dan penerapan arsitektur backend–frontend modern
- ✅ Memberikan pengalaman personal dalam mendengarkan musik tanpa batasan platform komersial

---

## 🚀 Fitur Utama

- 🔐 **Authentication System** - Login dan registrasi user dengan JWT token
- 🎼 **Music Library Management** - Kelola koleksi lagu secara personal
- 📝 **Custom Playlists** - Buat, edit, dan hapus playlist sesuai preferensi
- 👤 **Multi-Role System** - Dukungan untuk user, artist, dan admin
- 🎧 **Music Streaming** - Play, pause, next, previous dengan kontrol penuh
- 📊 **Listening History** - Pantau riwayat lagu yang didengarkan
- ⚙️ **User Settings** - Kelola profil dan preferensi akun

---

## 🛠️ Tech Stack & Arsitektur

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: CSS Modules + Lucide React Icons
- **HTTP Client**: Axios
- **Deployment**: GitHub Pages

### Backend
- **Framework**: Spring Boot 3.x (Java)
- **Security**: Spring Security + JWT Authentication
- **ORM**: Spring Data JPA
- **Validation**: Bean Validation API
- **Deployment**: Railway

### Database
- **RDBMS**: PostgreSQL 15
- **Cloud Provider**: Supabase
- **Local Dev**: Docker (optional)

### Architecture Flow

```

┌─────────────┐         REST API        ┌──────────────┐        JPA/JDBC        ┌─────────────┐
│   React     │ ◄─────────────────────► │ Spring Boot  │ ◄────────────────────► │ PostgreSQL  │
│ (Frontend)  │     JSON over HTTP      │  (Backend)   │    SQL Queries         │ (Supabase)  │
└─────────────┘                         └──────────────┘                        └─────────────┘
GitHub Pages                              Railway                               Cloud Database

```

---

## 📂 Project Structure

```

melodia/
│
├── backend/                      \# Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/melodia/
│   │   │   │   ├── config/              \# Security, CORS, Bean configs
│   │   │   │   ├── controller/          \# REST API Controllers
│   │   │   │   │   ├── admin/           \# Admin endpoints
│   │   │   │   │   ├── artist/          \# Artist endpoints
│   │   │   │   │   └── user/            \# User endpoints
│   │   │   │   ├── exception/           \# Custom exception handlers
│   │   │   │   ├── model/
│   │   │   │   │   ├── dto/             \# Data Transfer Objects
│   │   │   │   │   │   ├── request/     \# Request DTOs (auth, admin, user)
│   │   │   │   │   │   └── response/    \# Response DTOs (history, etc)
│   │   │   │   │   ├── entity/          \# JPA Entities (User, Song, Playlist)
│   │   │   │   │   └── repository/      \# Spring Data JPA Repositories
│   │   │   │   ├── security/            \# JWT, Auth filters, UserDetails
│   │   │   │   └── view/
│   │   │   │       ├── interfaces/      \# Service interfaces
│   │   │   │       └── service/         \# Business logic implementation
│   │   │   │           ├── admin/       \# Admin services
│   │   │   │           ├── auth/        \# Authentication services
│   │   │   │           ├── music/       \# Music management services
│   │   │   │           ├── strategy/    \# Design pattern implementations
│   │   │   │           └── user/        \# User services
│   │   │   └── resources/               \# application.properties, static files
│   │   └── test/                        \# Unit \& Integration tests
│   └── docker-entrypoint-initdb.d/      \# Database init scripts
│
└── frontend/                     \# React Frontend
├── public/                          \# Static assets
├── src/
│   ├── assets/                      \# Images, icons, media
│   ├── components/                  \# Reusable UI components
│   │   ├── Auth/                    \# Login, Register components
│   │   ├── Common/                  \# Buttons, Cards, Modals
│   │   ├── Layout/                  \# Navbar, Sidebar, Footer
│   │   └── Music/                   \# Player, Playlist components
│   ├── context/                     \# React Context providers
│   ├── hooks/                       \# Custom React hooks
│   ├── pages/                       \# Route pages
│   │   ├── admin/                   \# Admin dashboard pages
│   │   ├── auth/                    \# Login/Register pages
│   │   ├── Settings/                \# User settings pages
│   │   └── user/                    \# User dashboard pages
│   ├── services/                    \# API service calls (Axios)
│   ├── styles/                      \# Global CSS, themes
│   └── utils/                       \# Helper functions, constants
└── dist/                            \# Production build output

```

---

## 💻 Installation

### Prerequisites

- **Java 17+** (for Spring Boot)
- **Node.js 18+** (for React)
- **PostgreSQL 15+** (atau gunakan Supabase)
- **Maven** (untuk build backend)
- **Git**

### 1️⃣ Clone Repository

```

git clone https://github.com/your-username/melodia.git
cd melodia

```

### 2️⃣ Setup Backend

```

cd backend

# Configure application.properties

# Edit src/main/resources/application.properties

# Set database credentials (PostgreSQL/Supabase)

# Install dependencies \& run

mvn clean install
mvn spring-boot:run

# Backend akan berjalan di http://localhost:8080

```

**Environment Variables (Backend)**:
```

spring.datasource.url=jdbc:postgresql://your-supabase-url:5432/melodia
spring.datasource.username=your-db-username
spring.datasource.password=your-db-password
jwt.secret=your-secret-key

```

### 3️⃣ Setup Frontend

```

cd frontend

# Install dependencies

npm install

# Configure API endpoint

# Edit src/services/api.js atau .env file

# VITE_API_BASE_URL=http://localhost:8080/api

# Run development server

npm run dev

# Frontend akan berjalan di http://localhost:5173

```

### 4️⃣ (Optional) Setup Database dengan Docker

```


# Di root project

docker-compose up -d

# Database akan berjalan di localhost:5432

```

---

## 🎨 Screenshots

<img width="1919" height="1027" alt="image" src="https://github.com/user-attachments/assets/095b198a-276a-46c6-8abc-7cb47a538225" />
<img width="1919" height="970" alt="image" src="https://github.com/user-attachments/assets/164181e8-37fc-41de-8fef-4ccfb35b31c6" />
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/c05d841a-fa94-44ea-9a3f-418025594a1f" />

---

## 🚀 Deployment

### Frontend (GitHub Pages)
```

cd frontend
npm run build
npm run deploy

```

### Backend (Railway)
1. Push code ke GitHub
2. Connect repository di Railway dashboard
3. Set environment variables
4. Deploy otomatis dari branch `main`

---

## 👥 Team

Proyek ini dikembangkan sebagai tugas mata kuliah **Object-Oriented Programming**.

| Role | Responsibility |
|------|----------------|
| Backend Developer | Spring Boot API, Database design, Security |
| Frontend Developer | React UI/UX, State management, Integration |
| Full-Stack Developer | End-to-end features, Testing, Deployment |

---

## 📝 License

This project is developed for educational purposes.  
© 2025 Melodia Team - Telkom University

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<div align="center">

</div>

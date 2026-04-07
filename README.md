# BlogPlatform — Fullstack Professional

> Plataforma de contenido completa construida con React 18, Node.js, Express y MongoDB. Incluye autenticación JWT/OAuth, editor Markdown, dashboard de métricas y configuración Docker + CI/CD.

![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Stack](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![Stack](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)
![Stack](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)

---

## 📐 Arquitectura

```
blogplatform/
├── backend/                  # Node.js + Express API
│   └── src/
│       ├── config/           # DB connection
│       ├── controllers/      # Auth, Posts, Dashboard
│       ├── middleware/       # JWT auth, roles, errors, validation
│       ├── models/           # User, Post, Category (Mongoose)
│       └── routes/           # REST endpoints
│
├── frontend/                 # React 18 + Vite + Tailwind
│   └── src/
│       ├── components/       # Layout, Blog, Dashboard UI
│       ├── context/          # Zustand auth store
│       ├── pages/            # Home, Blog, Post, Dashboard, Editor
│       └── services/         # Axios API client con interceptors
│
├── docker/                   # Nginx config
├── docker-compose.yml        # Full orchestration
└── .github/workflows/        # CI/CD GitHub Actions
```

---

## 🚀 Quick Start

### Opción A — Docker (Recomendado)

```bash
# 1. Clonar y configurar env
git clone https://github.com/tu-usuario/blogplatform.git
cd blogplatform
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores

# 2. Levantar todo
docker compose up -d

# Servicios disponibles:
# Frontend:  http://localhost:3000
# API:       http://localhost:5000
# MongoDB:   mongodb://localhost:27017
```

### Opción B — Local sin Docker

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configura MONGO_URI y JWT_SECRET en .env
npm run dev

# Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

---

## 🔐 API Endpoints

### Auth
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/register` | Registrar usuario | ❌ |
| POST | `/api/v1/auth/login` | Login con email/password | ❌ |
| POST | `/api/v1/auth/google` | OAuth con Google | ❌ |
| POST | `/api/v1/auth/refresh` | Refresh access token | Cookie |
| POST | `/api/v1/auth/logout` | Cerrar sesión | ✅ |
| GET  | `/api/v1/auth/me` | Perfil actual | ✅ |
| POST | `/api/v1/auth/forgot-password` | Recuperar contraseña | ❌ |

### Posts
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/posts` | Listar posts (paginado, filtros) | ❌ |
| GET | `/api/v1/posts/:slug` | Post individual | Opcional |
| POST | `/api/v1/posts` | Crear post | Author+ |
| PUT | `/api/v1/posts/:id` | Actualizar post | Author+ |
| DELETE | `/api/v1/posts/:id` | Eliminar post | Author+ |
| PUT | `/api/v1/posts/:id/like` | Toggle like | ✅ |
| PUT | `/api/v1/posts/:id/bookmark` | Toggle bookmark | ✅ |
| POST | `/api/v1/posts/:id/comments` | Agregar comentario | ✅ |
| GET | `/api/v1/posts/my` | Mis posts | ✅ |

### Dashboard
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/v1/dashboard/metrics` | Métricas admin | Admin/Editor |
| GET | `/api/v1/dashboard/author` | Métricas autor | Author+ |

---

## 🏗️ Tecnologías

### Backend
- **Runtime:** Node.js 20 + Express 4
- **DB:** MongoDB 7 + Mongoose 8
- **Auth:** JWT (access + refresh tokens), Google OAuth
- **Seguridad:** Helmet, CORS, Rate Limiting, Mongo Sanitize, HPP
- **Validación:** express-validator + Zod

### Frontend
- **Framework:** React 18 + Vite 5
- **Routing:** React Router v6
- **State:** Zustand (auth) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod
- **UI:** Tailwind CSS 3
- **Charts:** Recharts
- **HTTP:** Axios con interceptors y auto-refresh

### DevOps
- **Docker:** Multi-stage builds (dev + prod)
- **Proxy:** Nginx como reverse proxy
- **CI/CD:** GitHub Actions (test → build → push → deploy)

---

## 🔑 Roles de usuario

| Rol | Permisos |
|-----|----------|
| `reader` | Leer posts, likes, bookmarks, comentarios |
| `author` | Todo lo anterior + crear/editar/eliminar sus posts |
| `editor` | Todo lo anterior + editar posts de otros |
| `admin` | Acceso total + métricas globales |

---

## 🌐 Variables de entorno

Copia `backend/.env.example` y configura:

```env
MONGO_URI=mongodb://mongo:27017/blogplatform
JWT_SECRET=min_32_chars_secret
JWT_REFRESH_SECRET=different_min_32_chars_secret
GOOGLE_CLIENT_ID=tu_google_client_id   # Para OAuth
CLIENT_URL=http://localhost:3000
```

---

## 📊 Características del Dashboard

- **Overview:** Total posts, vistas, usuarios nuevos, borradores
- **Gráfica de área:** Actividad diaria (posts + vistas) últimos 30 días
- **Pie chart:** Distribución de posts por categoría
- **Tabla:** Posts recientes con acciones rápidas
- **Vistas distintas:** Admin vs Author (datos filtrados por rol)

---

## 🤝 Contribuir

```bash
git checkout -b feature/nueva-funcionalidad
# ... cambios ...
git commit -m "feat: descripción"
git push origin feature/nueva-funcionalidad
# Abrir Pull Request a develop
```

---

## 📄 Licencia

MIT © 2024 BlogPlatform

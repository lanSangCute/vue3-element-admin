# Vue3 Element Admin

A full-stack admin system with Vue3 + Element Plus frontend and Node.js + Express backend.

## Tech Stack

### Frontend
- Vue 3
- Element Plus
- TypeScript
- Axios

### Backend
- Node.js
- Express
- TypeScript
- SQLite (better-sqlite3)
- JWT Authentication

## Project Structure

```
vue3-element-admin/
├── front-end/          # Vue3 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.vue
│   │   │   └── Dashboard.vue
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
├── back-end/           # Node.js backend
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── data/           # SQLite database
│   └── package.json
└── README.md
```

## Getting Started

### Backend

```bash
cd back-end
npm run dev
# Server runs on http://localhost:3000
```

### Frontend

```bash
cd front-end
npm run dev
# App runs on http://localhost:5173
```

## Default Account

- **Username:** admin
- **Password:** admin123

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/login | User login | No |
| POST | /api/auth/register | User registration | No |
| GET | /api/dashboard | Dashboard data | Yes |
| GET | /api/health | Health check | No |

## Build for Production

### Backend
```bash
cd back-end
npm run build
npm start
```

### Frontend
```bash
cd front-end
npm run build
```

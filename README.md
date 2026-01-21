# Library Management System

## Prerekvizity

- Node.js (v20.19.0 alebo v22.12.0 alebo vyssia)
- npm (comes with Node.js)
- MongoDB Atlas ucet alebo lokalne MongoDB
- Git

## Instalacia

### 1. naklonuj repozitar

```bash
git clone https://github.com/DanielKlimek/library-management-system
cd library-management-system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Vytvor `.env` subor v `backend` priecinku:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Spustenie aplikacie

### Spustenie Backendu

```bash
cd backend
npm run dev
```

Backend bezi na `http://localhost:5000`

### Spustenie Frontendu (2. terminal)

```bash
cd frontend
npm run dev
```

Frontend bezi na `http://localhost:5173`

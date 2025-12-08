# Library Management System

## Prerekvizity

- Node.js (v20.19.0 alebo v22.12.0 alebo vyssia)
- npm (comes with Node.js)
- MongoDB Atlas ucet alebo lokalne MongoDB
- Git

## Instalacia

### 1. naklonuj repozitar

git clone https://github.com/DanielKlimek/library-management-system
cd library-management-system

### 2. Backend Setup

cd backend
npm install

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Frontend Setup

cd ../frontend
npm install

## Spustenie aplikacie

### Spustenie Backendu

cd backend
npm run dev

Backend bezi na `http://localhost:5000`

### Spustenie Frontendu (2. terminal)

cd frontend
npm run dev

Frontend bezi na `http://localhost:5173`

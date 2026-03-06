# HRMS Lite

Production-ready HRMS starter with **Employee Management** and **Attendance Management**.

## Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios, React Query
- **Backend**: Node.js, Express.js, TypeScript, Zod
- **Database**: PostgreSQL, Prisma ORM
- **Deploy**: Vercel (frontend), Render (backend)

## Repo structure

```
hrms-lite/
  frontend/
  backend/
```

## Features

### Employee Management

- Add employee: `employeeId` (unique), `fullName`, `email`, `department`
- List employees
- Delete employee
- Validation + duplicate protection

### Attendance Management

- Mark attendance: `employeeId`, `date`, `status` (Present / Absent)
- View attendance history per employee
- Filter attendance by date (`/attendance?date=YYYY-MM-DD`)
- Total present days per employee (returned by `GET /attendance/:employeeId`)

## Backend API

Base URL (local): `http://localhost:4000`

### Employees

- `GET /employees`
- `POST /employees`
- `DELETE /employees/:id`

### Attendance

- `POST /attendance`
- `GET /attendance/:employeeId`
- `GET /attendance?date=YYYY-MM-DD`

### Error handling

- **400**: validation / bad request
- **404**: not found
- **409**: duplicates (employeeId, attendance per employee/day)

Responses use:

```json
{ "error": { "code": "...", "message": "...", "details": {} } }
```

## Local setup

### 1) Start PostgreSQL

You have two options:

- **Option A (recommended): Docker**
  - Install Docker Desktop
  - From the repo root:

```bash
cd hrms-lite
docker compose up -d
```

- Note: if you already have a local Postgres running on `5432`, Docker will still start but your tools may connect to the local DB. This project maps Docker Postgres to **host port `5433`** to avoid conflicts.

- **Option B: Local Postgres**
  - Create a database named `hrms_lite`
  - Ensure `DATABASE_URL` matches your local user/password/port

### 2) Backend

```bash
cd hrms-lite/backend
cp .env.example .env
npm install

# apply migrations
npx prisma migrate deploy

# generate prisma client
npx prisma generate

# seed sample employees
npx prisma db seed

# run API
npm run dev
```

Backend runs at `http://localhost:4000` and health check at `GET /health`.

### 3) Frontend

```bash
cd hrms-lite/frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Environment variables

### Backend (`backend/.env`)

- **DATABASE_URL**: Postgres connection string
- **PORT**: API port (default 4000)
- **CORS_ORIGIN**: allowed frontend origin(s). Use `*` or comma-separated list.

### Frontend (`frontend/.env.local`)

- **NEXT_PUBLIC_API_BASE_URL**: backend base URL (default `http://localhost:4000`)

## Deployment

### Frontend (Vercel)

- Import `frontend/` as the project root in Vercel
- Set env var: `NEXT_PUBLIC_API_BASE_URL` to your deployed backend URL

### Backend (Render)

- Create a PostgreSQL instance in Render (or any hosted Postgres)
- Create a Web Service for `backend/`
- Set env vars:
  - `DATABASE_URL`
  - `PORT` (Render provides it; keep code reading `PORT`)
  - `CORS_ORIGIN` (set to your Vercel domain)
- Build command:

```bash
npm install && npm run build
```

- Start command:

```bash
npm run prisma:migrate:deploy && npm start
```

## Notes

- Prisma migration SQL is included under `backend/prisma/migrations/`.
- If you don’t use Docker locally, you only need any reachable Postgres plus the correct `DATABASE_URL`.


# NASFAM Grain Traceability Management System (GTMS) - Backend API

Production-ready Single Point of Truth REST API for NASFAM GTMS Web Platform and Offline Mobile App.

## Technology Stack
- **Runtime**: Node.js (v20+ LTS)
- **Framework**: Express.js (ES Modules)
- **Database ORM**: Prisma ORM with **MySQL**
- **Security**: JWT (Access + HTTP-Only Refresh Tokens), Bcrypt, Helmet, CORS, Rate Limiting
- **Validation**: Zod schema validation

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env` and update your MySQL connection credentials:
```bash
cp .env.example .env
```

### 2. Database Migration & Seeding
Ensure your MySQL database server is running, then execute:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

### 3. Running the Server
- Development mode (with live reload via nodemon):
```bash
npm run dev
```
- Production mode:
```bash
npm start
```

### 4. Health Check
Verify API status by calling:
```http
GET http://localhost:5000/api/v1/health
```

---
*Developed by DreamCode Developers for NASFAM GTMS.*
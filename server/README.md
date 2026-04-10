# Pulse Backend

Production-ready multi-tenant backend for the Pulse SaaS platform.

## Features
- Multi-tenant architecture (Colleges)
- JWT Authentication & Role-Based Access Control (RBAC)
- Password Hashing with bcrypt
- Centralized Error Handling
- RESTful API structure

## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)

## Setup
1. `cd server`
2. `npm install`
3. Configure `.env` file with your `MONGO_URI` and `JWT_SECRET`
4. `npm run dev` (for development) or `npm start` (for production)

## API Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `POST /api/colleges` - Register a new college (Super Admin only)
- `GET /api/colleges` - List all colleges (Super Admin only)
- `GET /api/colleges/:id` - Get college details
- `PUT /api/colleges/:id/status` - Update college status (Super Admin only)

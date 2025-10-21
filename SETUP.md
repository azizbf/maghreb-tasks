# FreelanceTN - Complete Setup Guide

A full-stack freelancing marketplace for Tunisia built with Node.js + Express + MySQL + React + TypeScript.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher) - XAMPP recommended for local development
- **Git**

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd maghreb-tasks-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

1. **Start XAMPP**
   - Start Apache and MySQL services
   - Open phpMyAdmin (http://localhost/phpmyadmin)

2. **Create Database**
   ```sql
   CREATE DATABASE freelance_tn;
   ```

3. **Configure Backend Environment**
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Edit `.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=freelance_tn
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Run Database Migration**
   ```bash
   cd backend
   npm run migrate
   ```

### 3. Configure Frontend

```bash
# Copy environment file
cp env.example .env

# Edit .env (optional - defaults work for local development)
VITE_API_URL=http://localhost:5000/api
```

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health Check**: http://localhost:5000/health

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express Backend │    │   MySQL Database│
│   (Port 5173)   │◄──►│   (Port 5000)   │◄──►│   (Port 3306)   │
│                 │    │                 │    │                 │
│ • TypeScript    │    │ • Node.js       │    │ • Users         │
│ • Tailwind CSS  │    │ • Express       │    │ • Jobs          │
│ • Shadcn/ui     │    │ • JWT Auth      │    │ • Proposals     │
│ • React Router  │    │ • bcrypt        │    │ • Categories    │
│ • React Query   │    │ • MySQL2        │    │ • Skills        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Database Schema

### Core Tables
- **users** - User accounts (freelancers and clients)
- **categories** - Job categories (Web Development, Design, etc.)
- **skills** - Skills within categories
- **jobs** - Job postings
- **proposals** - Freelancer proposals for jobs
- **contracts** - Accepted proposals become contracts
- **reviews** - User reviews and ratings
- **messages** - Communication between users
- **portfolio_items** - Freelancer portfolio items

### Sample Data
The migration script automatically creates:
- 10 default categories
- 50+ skills across all categories
- Sample data for testing

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (client only)
- `PUT /api/jobs/:id` - Update job (client only)
- `DELETE /api/jobs/:id` - Delete job (client only)

### Proposals
- `GET /api/proposals/job/:jobId` - Get proposals for a job
- `POST /api/proposals` - Create proposal (freelancer only)
- `PUT /api/proposals/:id/accept` - Accept proposal (client only)
- `PUT /api/proposals/:id/reject` - Reject proposal (client only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id/skills` - Get skills for category

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

### Frontend Development
```bash
npm run dev  # Starts Vite dev server
```

### Database Management
```bash
cd backend
npm run migrate  # Run database migrations
```

## 🔒 Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Sanitization** to prevent XSS attacks
- **SQL Injection Protection** using parameterized queries
- **Request Validation** with express-validator
- **Security Headers** using helmet

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
1. Register as a freelancer
2. Register as a client
3. Create a job (as client)
4. Apply to job (as freelancer)
5. Accept proposal (as client)

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for production domain
5. Run `npm run migrate`
6. Start with `npm start`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update `VITE_API_URL` to point to production backend

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=freelance_tn
JWT_SECRET=your-super-secure-jwt-secret
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 📱 Features

### For Freelancers
- Create and manage profile
- Browse and search jobs
- Submit proposals
- Manage portfolio
- Track earnings

### For Clients
- Post job requirements
- Review proposals
- Manage contracts
- Rate freelancers
- Track project progress

### General Features
- Real-time search and filtering
- Category-based job organization
- Skill-based matching
- Secure payment system (ready for integration)
- Responsive design
- Multi-language support (Arabic/French/English ready)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check XAMPP is running
   - Verify MySQL credentials in `.env`
   - Ensure database `freelance_tn` exists

2. **CORS Errors**
   - Check `FRONTEND_URL` in backend `.env`
   - Ensure frontend is running on correct port

3. **JWT Token Issues**
   - Check `JWT_SECRET` is set
   - Verify token expiration settings

4. **Port Already in Use**
   - Change `PORT` in backend `.env`
   - Update `VITE_API_URL` in frontend `.env`

### Logs
- Backend logs: Check terminal running `npm run dev`
- Frontend logs: Check browser console
- Database logs: Check XAMPP MySQL logs

## 📞 Support

For issues and questions:
1. Check this setup guide
2. Review the README files in `/backend` and root
3. Check the API documentation at `/backend/README.md`
4. Create an issue in the repository

## 🎉 Success!

If everything is set up correctly, you should see:
- Frontend running at http://localhost:5173
- Backend API responding at http://localhost:5000/health
- Database with sample categories and skills
- Ability to register, login, and browse jobs

Welcome to FreelanceTN! 🚀


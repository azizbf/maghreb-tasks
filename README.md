# FreelanceTN - Tunisian Freelancing Marketplace

A full-stack freelancing platform built for Tunisia, connecting clients with skilled freelancers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher) 
- XAMPP (for local MySQL)

### Frontend Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Set up database
npm run migrate

# Start development server
npm run dev
```

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for components
- **React Router** for navigation
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** authentication
- **bcrypt** for password hashing
- **Express Rate Limit** for security

## 📋 Features

- ✅ User authentication (sign up, sign in, logout)
- ✅ Job posting and browsing
- ✅ Proposal system
- ✅ Real-time messaging
- ✅ Notification system
- ✅ Role-based dashboards
- ✅ Category and skill management

## 🔧 Development

The project consists of two main parts:

1. **Frontend** (`/src`) - React application
2. **Backend** (`/backend`) - Node.js API server

Both need to be running simultaneously for full functionality.

## 📄 License

This project is licensed under the MIT License.

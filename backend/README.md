# FreelanceTN Backend API

A robust Node.js + Express + MySQL backend for the FreelanceTN freelancing marketplace platform.

## 🚀 Features

- **JWT Authentication** with bcrypt password hashing
- **MySQL Database** with comprehensive schema
- **RESTful API** with proper validation and error handling
- **Security Middleware** including rate limiting, CORS, and input sanitization
- **Role-based Access Control** for freelancers and clients
- **Comprehensive Job Management** with proposals and contracts
- **Category and Skill Management**
- **Input Validation** using express-validator
- **Error Handling** with detailed logging

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- XAMPP (for local MySQL)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=freelance_tn
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Set up MySQL database**
   - Start XAMPP and ensure MySQL is running
   - Create database: `CREATE DATABASE freelance_tn;`
   - Run migration: `npm run migrate`

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   
   # Or run directly
   node src/server.js
   ```

## 📊 Database Schema

The database includes the following main tables:

- **users** - User accounts (freelancers and clients)
- **categories** - Job categories (Web Development, Design, etc.)
- **skills** - Skills within categories
- **jobs** - Job postings
- **proposals** - Freelancer proposals for jobs
- **contracts** - Accepted proposals become contracts
- **reviews** - User reviews and ratings
- **messages** - Communication between users
- **portfolio_items** - Freelancer portfolio items

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `PUT /api/auth/deactivate` - Deactivate account

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (client only)
- `PUT /api/jobs/:id` - Update job (client only)
- `DELETE /api/jobs/:id` - Delete job (client only)
- `GET /api/jobs/user/my-jobs` - Get user's jobs

### Proposals
- `GET /api/proposals/job/:jobId` - Get proposals for a job
- `GET /api/proposals/:id` - Get proposal by ID
- `POST /api/proposals` - Create proposal (freelancer only)
- `PUT /api/proposals/:id` - Update proposal (freelancer only)
- `PUT /api/proposals/:id/accept` - Accept proposal (client only)
- `PUT /api/proposals/:id/reject` - Reject proposal (client only)
- `PUT /api/proposals/:id/withdraw` - Withdraw proposal (freelancer only)
- `GET /api/proposals/user/my-proposals` - Get freelancer's proposals

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `GET /api/categories/:id/skills` - Get skills for category
- `GET /api/categories/skills/all` - Get all skills
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/skills` - Create skill

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

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": { ... } // Only present on success
}
```

### Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Only present for validation errors
}
```

### Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🚀 Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set secure JWT secret
   - Configure CORS for production domain

2. **Database Migration**
   ```bash
   npm run migrate
   ```

3. **Start Server**
   ```bash
   npm start
   ```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Request logging enabled
- Error tracking and logging
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

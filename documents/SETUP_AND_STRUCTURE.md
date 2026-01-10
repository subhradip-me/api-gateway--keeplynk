# KeepLynk API Gateway - Setup & Structure

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database Schema](#database-schema)

---

## Overview

KeepLynk API Gateway is a Node.js/Express-based backend service that provides bookmark management with persona-based organization. Built with ES modules, it offers a clean, modular architecture for easy extension and maintenance.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher (local or cloud instance)

## Installation

1. **Clone the repository** (if applicable):
```bash
cd d:\KeepLynk\services\api-gateway
```

2. **Install dependencies**:
```bash
npm install
```

3. **Verify installation**:
```bash
npm list --depth=0
```

## Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/keeplynk

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-please
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=*

# External Services (Optional)
AI_ENGINE_URL=http://localhost:8080
```

### Environment Variables Explained

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/keeplynk` |
| `JWT_SECRET` | Secret key for JWT tokens | (must be set) |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Server Endpoints
Once running, the server will be available at:
- **Health Check**: http://localhost:3000/health
- **API Base**: http://localhost:3000/api
- **Auth Routes**: http://localhost:3000/api/auth
- **Agent Routes**: http://localhost:3000/api/agent

---

## Project Structure

```
api-gateway/
├── index.js                          # Main application entry point
├── package.json                      # Project dependencies and scripts
├── .env                             # Environment variables (not in git)
├── documents/                       # Documentation
│   ├── SETUP_AND_STRUCTURE.md      # This file
│   └── API_REFERENCE.md            # API documentation
└── src/
    ├── routes.js                    # Main route definitions
    └── modules/                     # Feature modules
        ├── auth/                    # Authentication module
        │   ├── controllers/
        │   │   └── authController.js      # Auth business logic
        │   ├── models/
        │   │   ├── User.js               # User model
        │   │   └── PersonaProfile.js     # Persona profile model
        │   ├── routes/
        │   │   └── authRoutes.js         # Auth API routes
        │   └── services/
        │       └── authService.js        # Auth service layer
        │
        ├── agent/                   # AI Agent module
        │   ├── routes/
        │   │   └── agent.routes.js       # Agent API routes
        │   └── services/
        │       └── agentService.js       # Agent service layer
        │
        ├── core/                    # Core bookmark features
        │   ├── controllers/
        │   │   └── bookmarkController.js
        │   ├── models/
        │   │   ├── Bookmark.js
        │   │   ├── Folder.js
        │   │   ├── Note.js
        │   │   ├── Tag.js
        │   │   └── Task.js
        │   ├── routes/
        │   │   ├── bookmarkRoutes.js
        │   │   └── index.js
        │   ├── services/
        │   │   └── bookmarkService.js
        │   └── index.js
        │
        ├── personas/                # Persona-specific modules
        │   ├── student/
        │   │   ├── controllers/
        │   │   │   └── studentController.js
        │   │   ├── models/
        │   │   │   └── StudentModels.js
        │   │   ├── routes/
        │   │   │   └── studentRoutes.js
        │   │   ├── services/
        │   │   │   └── studentService.js
        │   │   └── index.js
        │   ├── creator/
        │   │   ├── models/
        │   │   │   └── CreatorModels.js
        │   │   ├── routes/
        │   │   │   └── creatorRoutes.js
        │   │   └── index.js
        │   ├── entrepreneur/
        │   │   ├── models/
        │   │   │   └── EntrepreneurModels.js
        │   │   ├── routes/
        │   │   │   └── entrepreneurRoutes.js
        │   │   └── index.js
        │   ├── professional/
        │   │   ├── models/
        │   │   │   └── ProfessionalModels.js
        │   │   ├── routes/
        │   │   │   └── professionalRoutes.js
        │   │   └── index.js
        │   └── researcher/
        │       ├── models/
        │       │   └── ResearcherModels.js
        │       ├── routes/
        │       │   └── researcherRoutes.js
        │       └── index.js
        │
        └── shared/                  # Shared utilities and configs
            ├── config/
            │   ├── database.js          # MongoDB connection
            │   └── environment.js       # Environment config
            ├── middleware/
            │   ├── authMiddleware.js    # JWT authentication
            │   └── errorMiddleware.js   # Error handling
            ├── services/
            │   └── PersonaDataService.js
            └── utils/
                ├── helpers.js           # Helper functions
                ├── logger.js            # Logging utility
                └── responseHelpers.js   # API response formatters
```

---

## Architecture

### Layered Architecture

The application follows a **3-tier architecture**:

```
┌─────────────────────────────────────┐
│         Routes Layer                │  ← HTTP endpoints
├─────────────────────────────────────┤
│       Controllers Layer             │  ← Request handling & validation
├─────────────────────────────────────┤
│        Services Layer               │  ← Business logic
├─────────────────────────────────────┤
│         Models Layer                │  ← Database schemas
└─────────────────────────────────────┘
```

### Module System

Each feature is organized as a **self-contained module**:
- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Models**: Define MongoDB schemas

### Middleware Pipeline

```
Request → Helmet → CORS → Body Parser → Morgan → Routes → Auth Middleware → Controller → Response
```

---

## Database Schema

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  personas: [String],
  currentPersona: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### PersonaProfiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  persona: String (enum: student|creator|professional|entrepreneur|researcher),
  displayName: String,
  bio: String,
  avatar: String,
  studentData: Object,
  creatorData: Object,
  professionalData: Object,
  entrepreneurData: Object,
  researcherData: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### Bookmarks Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  persona: String,
  url: String (required),
  title: String,
  description: String,
  tags: [String],
  folder: ObjectId (ref: Folder),
  isFavorite: Boolean,
  metadata: {
    imageUrl: String,
    domain: String,
    author: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Folders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  persona: String,
  name: String (required),
  description: String,
  color: String,
  icon: String,
  parentFolder: ObjectId (ref: Folder),
  isPrivate: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Persona-Specific Collections

#### Student Collections
- **StudentAssignment**: Assignments and homework
- **StudentCourse**: Course information
- **StudentStudySession**: Study session tracking

#### Creator Collections
- **CreatorProject**: Content projects
- **CreatorCalendar**: Content calendar
- **CreatorPartnership**: Brand partnerships

#### Professional Collections
- **ProfessionalProject**: Work projects
- **ProfessionalContact**: Professional contacts
- **ProfessionalSkill**: Skills tracking

#### Entrepreneur Collections
- **EntrepreneurStartup**: Startup ventures
- **EntrepreneurInvestor**: Investor contacts
- **EntrepreneurBusinessPlan**: Business plans

#### Researcher Collections
- **ResearcherProject**: Research projects
- **ResearcherPublication**: Publications
- **ResearcherCollaboration**: Research collaborations

---

## Technology Stack

### Backend Framework
- **Node.js**: v18+ JavaScript runtime
- **Express.js**: v4.22+ Web application framework

### Database
- **MongoDB**: v6.0+ NoSQL database
- **Mongoose**: v7.8+ ODM for MongoDB

### Security
- **Helmet**: Security headers
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **CORS**: Cross-origin resource sharing

### Development Tools
- **Nodemon**: Auto-restart during development
- **Morgan**: HTTP request logger
- **dotenv**: Environment variable management

---

## Module Communication

All modules communicate through:
1. **Shared Services**: Common business logic in `shared/services`
2. **Middleware**: Authentication and authorization checks
3. **Models**: Direct database access through Mongoose models

Example flow for authenticated request:
```
User Request
    ↓
Route (e.g., /api/bookmarks)
    ↓
Auth Middleware (verify JWT)
    ↓
Persona Context Middleware
    ↓
Controller (bookmarkController)
    ↓
Service (bookmarkService)
    ↓
Model (Bookmark)
    ↓
MongoDB
```

---

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Authentication**: Stateless token-based auth
3. **CORS Protection**: Configurable origin restrictions
4. **Helmet Middleware**: Security headers
5. **Input Validation**: Request validation in controllers
6. **Persona-Based Access Control**: User can only access their own data

---

## Next Steps

After setup, refer to [API_REFERENCE.md](./API_REFERENCE.md) for detailed API endpoint documentation.

For development:
1. Start MongoDB
2. Run `npm run dev`
3. Test endpoints using Postman or curl
4. Check logs in the terminal

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Change PORT in .env file or
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

### Module Import Errors
Ensure all import statements include `.js` extensions:
```javascript
// Correct
import User from './models/User.js';

// Incorrect
import User from './models/User';
```

---

## Support

For issues or questions:
1. Check error logs in terminal
2. Review this documentation
3. Check API_REFERENCE.md for endpoint details

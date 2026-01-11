# KeepLynk- Modular Backend Architecture 🚀

> **Complete persona-specific backend with data isolation and scalable module system**

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

## 🎯 Overview

KeepLynk 2.0 is a complete rewrite of the backend architecture featuring a modular, persona-specific system that provides:

- ✅ **Complete Data Isolation** - Every persona has completely separate data
- ✅ **Scalable Module System** - Easy to add new features and personas
- ✅ **Type-Safe Persona Management** - Validated persona switching and access
- ✅ **Production-Ready Security** - JWT auth, bcrypt, Helmet, CORS
- ✅ **Comprehensive Documentation** - Everything you need to get started

### 🎭 Supported Personas

- **🎓 Student** - Academic assignments, courses, study tracking
- **🎨 Creator** - Content projects, calendar, partnerships
- **💼 Professional** - Client projects, networking, skills
- **🚀 Entrepreneur** - Startups, investors, business plans
- **🔬 Researcher** - Research projects, publications, collaborations

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (create .env file)
cp .env.example .env
# Edit .env with your settings

# 3. Start MongoDB
mongod  # or docker run -d -p 27017:27017 mongo

# 4. Start the modular server
npm run start:modular

# Development mode with auto-reload
npm run dev:modular
```

### Verify Installation

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-26T...",
  "uptime": 5.123,
  "environment": "development"
}
```

## 📁 Project Structure

```
api-gateway/
├── modules/                    # Modular components
│   ├── auth/                  # Authentication & user management
│   ├── core/                  # Core persona-aware features
│   ├── personas/              # Persona-specific modules
│   │   ├── student/          # ✅ Fully functional
│   │   ├── creator/          # 🔧 Structure ready
│   │   ├── professional/     # 🔧 Structure ready
│   │   ├── entrepreneur/     # 🔧 Structure ready
│   │   └── researcher/       # 🔧 Structure ready
│   ├── shared/                # Shared utilities
│   └── ModuleManager.js       # Module loading system
├── server-modular.js          # Modular server entry point
├── package.json
└── Documentation files...
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      # Register user
POST   /api/auth/login         # Login
GET    /api/auth/me            # Get profile
POST   /api/auth/personas      # Add persona
PUT    /api/auth/personas/switch   # Switch persona
DELETE /api/auth/personas/:id  # Remove persona
```

### Core Features (Persona-Aware)
```
GET/POST/PUT/DELETE /api/core/bookmarks
GET                 /api/core/bookmarks/search
```

### Student Persona (Full CRUD)
```
GET  /api/personas/student/dashboard
CRUD /api/personas/student/assignments
CRUD /api/personas/student/courses
CRUD /api/personas/student/study-sessions
```

**See [API_REFERENCE.md](API_REFERENCE.md) for complete API documentation.**

## 💻 Usage Examples

### Register and Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "initialPersona": "student"
  }'

# Login (save the token!)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Resources

```bash
# Save your token
TOKEN="your-jwt-token-here"

# Create a bookmark
curl -X POST http://localhost:3000/api/core/bookmarks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "title": "My Bookmark",
    "description": "Useful resource"
  }'

# Create an assignment (Student persona)
curl -X POST http://localhost:3000/api/personas/student/assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Math Homework",
    "dueDate": "2025-12-31",
    "priority": "high"
  }'
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) | Visual architecture overview |
| [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md) | Complete architecture guide |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoints reference |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | Implementation details |
| [SETUP.md](SETUP.md) | Detailed setup guide |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Setup completion summary |

## 🛠️ Development

### Available Scripts

```bash
# Legacy server (for backward compatibility)
npm start                # Production
npm run dev             # Development

# Modular server (new architecture)
npm run start:modular   # Production
npm run dev:modular     # Development with auto-reload
```

### Adding a New Module

1. Create module directory: `modules/mymodule/`
2. Create `index.js` with module exports
3. Add models, controllers, services, routes
4. Module auto-loads on server restart

**See [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md) for detailed guide.**

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTP security headers (Helmet)
- ✅ CORS protection
- ✅ Input validation
- ✅ Data isolation per persona
- ✅ Error sanitization

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/health

# Module status
curl http://localhost:3000/health/modules

# Module info
curl http://localhost:3000/api/modules
```

### Recommended Tools

- **Postman** - GUI API testing
- **Insomnia** - Alternative GUI tool
- **curl** - Command-line testing
- **HTTPie** - User-friendly CLI tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Project Status

| Component | Status | Progress |
|-----------|--------|----------|
| Infrastructure | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Core Module | ✅ Complete | 100% |
| Student Persona | ✅ Complete | 100% |
| Other Personas | 🔧 Structure Ready | 40% |
| Module System | ✅ Complete | 100% |

**Overall: 75% Complete**

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Ensure MongoDB is running
mongod --version
# Check DATABASE_URL in .env
```

### Module Load Failed
```bash
# Check module health
curl http://localhost:3000/health/modules
# Review server logs for details
```

### Authentication Issues
```bash
# Verify JWT_SECRET is set in .env 
# Check token expiration (default: 14 days)
```

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/KeepLynk
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

## 🎓 Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

## 📄 License

ISC

## 👥 Authors

Built with ❤️ for KeepLynk 2.0

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- The open-source community

---

**Ready to build amazing persona-specific features! 🚀**

For detailed information, start with [SETUP.md](SETUP.md) and [MODULAR_ARCHITECTURE.md](MODULAR_ARCHITECTURE.md).

# KeepLynk API Reference

Complete API documentation for all endpoints in the KeepLynk API Gateway.

## 📋 Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Authentication Endpoints](#authentication-endpoints)
- [Agent Endpoints](#agent-endpoints)
- [Resource Endpoints](#resource-endpoints)
- [Auto-Organise Endpoints](#auto-organise-endpoints)
- [Bookmark Endpoints](#bookmark-endpoints)
- [Folder Endpoints](#folder-endpoints)
- [Tag Endpoints](#tag-endpoints)
- [Persona-Specific Endpoints](#persona-specific-endpoints)
  - [General Persona](#general-persona)
  - [Student Persona](#student-persona)
  - [Professional Persona](#professional-persona)
  - [Creator Persona](#creator-persona)
  - [Entrepreneur Persona](#entrepreneur-persona)
  - [Researcher Persona](#researcher-persona)

---

## Base URL

```
http://localhost:3000
```

All API endpoints are prefixed with `/api`:
```
http://localhost:3000/api
```

---

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens) **and an active persona**.

### How to Authenticate

1. **Register or Login** to obtain a token
2. **Add a persona** to your account (required for most endpoints)
3. **Include the token** in the `Authorization` header for protected routes:

```http
Authorization: Bearer <your_jwt_token>
```

### Important: Persona Requirement

⚠️ **Most API endpoints require an active persona.** After registration or login, you must add at least one persona to your account before accessing resource endpoints (bookmarks, folders, tags, etc.).

If you attempt to access protected endpoints without a persona, you'll receive:
```json
{
  "success": false,
  "message": "No active persona. Please add a persona to your account first.",
  "hint": "POST /api/auth/personas with { \"persona\": \"student\" }"
}
```

### Token Structure

JWT tokens contain:
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "persona": "student",
  "personas": ["student", "professional"],
  "iat": 1640000000,
  "exp": 1640604800
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": { }  // Optional validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Successful deletion |
| `400` | Bad Request - Invalid input or missing persona |
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error - Server issue |

### Common Error Scenarios

**Missing Persona (400):**
```json
{
  "success": false,
  "message": "No active persona. Please add a persona to your account first.",
  "hint": "POST /api/auth/personas with { \"persona\": \"student\" }"
}
```

**Invalid CORS Origin:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
*Solution:* Ensure `CORS_ORIGIN` environment variable is properly configured without trailing commas.

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "initialPersona": "student"  // Optional but recommended
}
```

**Note:** While `initialPersona` is optional, it's **highly recommended** to include it during registration. If omitted, you must call `POST /api/auth/personas` to add a persona before accessing most other endpoints.

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "personas": ["student"],
      "currentPersona": "student",
      "createdAt": "2025-12-26T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User already exists"
}
```

---

### Login

Authenticate existing user.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "currentPersona": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Get Current User Profile

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Access:** Protected (Requires Authentication)

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "personas": ["student", "professional"],
      "currentPersona": "student"
    },
    "profiles": {
      "student": {
        "displayName": "John Doe",
        "bio": "Computer Science Student"
      },
      "professional": {
        "displayName": "John D.",
        "bio": "Software Developer"
      }
    }
  }
}
```

---

### Add Persona

Add a new persona to user account.

**Endpoint:** `POST /api/auth/personas`

**Access:** Protected

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "persona": "professional"
}
```

**Valid Personas:**
- `genaral` (general purpose)
- `student`
- `creator`
- `professional`
- `entrepreneur`
- `researcher`

**Success Response (201):**
```json
{
  "success": true,
  "message": "Persona added successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "personas": ["student", "professional"],
      "currentPersona": "student"
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "507f1f77bcf86cd799439011",
      "persona": "professional",
      "displayName": "John Doe"
    }
  }
}
```

---

### Switch Persona

Switch active persona.

**Endpoint:** `PUT /api/auth/personas/switch`

**Access:** Protected

**Request Body:**
```json
{
  "persona": "professional"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Persona switched successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "personas": ["student", "professional"],
      "currentPersona": "professional"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Important:** Use the new token returned in the response for all subsequent API calls.

---

### Remove Persona

Remove a persona from user account.

**Endpoint:** `DELETE /api/auth/personas/:persona`

**Access:** Protected

**Path Parameters:**
- `persona` - Persona to remove (e.g., `professional`)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Persona removed successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "personas": ["student"],
      "currentPersona": "student"
    }
  }
}
```

---

## Agent Endpoints

### Agent Decision

Send a request to the AI agent for intelligent decision-making and actions.

**Endpoint:** `POST /api/agent/decide`

**Access:** Public (can be protected with authentication if needed)

**Description:** This endpoint forwards requests to the AI Engine service for processing agent decisions, context analysis, and intelligent actions.

**Request Body:**
```json
{
  "context": {
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "currentTask": "bookmark management"
  },
  "action": "analyze",
  "data": {
    "url": "https://example.com/article",
    "content": "Article content here..."
  }
}
```

**Request Parameters:**
- `context` (object) - Contextual information about the user and current state
- `action` (string) - The action to perform (e.g., "analyze", "categorize", "suggest")
- `data` (object) - Payload data for the agent to process

**Success Response (200):**
```json
{
  "decision": "categorize",
  "suggestions": [
    {
      "category": "Educational",
      "confidence": 0.92,
      "tags": ["javascript", "tutorial", "programming"]
    }
  ],
  "actions": [
    {
      "type": "create_bookmark",
      "data": {
        "title": "JavaScript Tutorial",
        "tags": ["javascript", "tutorial"],
        "folder": "Programming Resources"
      }
    }
  ]
}
```

**Error Response (500):**
```json
{
  "error": "Agent decision failed"
}
```

**Use Cases:**
- **Smart Bookmark Categorization**: Automatically categorize and tag bookmarks
- **Content Analysis**: Extract key information from URLs or content
- **Intelligent Suggestions**: Get personalized recommendations based on user context
- **Task Automation**: Automate repetitive tasks based on user behavior

**Example Request:**
```javascript
const response = await fetch('http://localhost:3000/api/agent/decide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    context: {
      userId: '507f1f77bcf86cd799439011',
      persona: 'student'
    },
    action: 'categorize',
    data: {
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      title: 'JavaScript | MDN'
    }
  })
});
const result = await response.json();
```

**Configuration:**

The agent endpoint requires the `AI_ENGINE_URL` environment variable to be set:
```env
AI_ENGINE_URL=http://localhost:8080
```

The AI Engine service should be running and accessible at the configured URL.
## Resource Endpoints

Resources can be **URLs** (web bookmarks) or **Documents** (uploaded files). All resource endpoints require authentication and an active persona.

**Resource Types:**
- `url` - Web bookmarks/links
- `document` - Uploaded files (PDFs, images, etc.)

### Create Resource

Create a new resource (bookmark, document, or note).

**Endpoint:** `POST /api/resources`

**Access:** Protected (with Persona Context - **Persona Required**)

**Request Body (URL/Bookmark):**
```json
{
  "type": "url",
  "url": "https://example.com/article",
  "title": "Interesting Article",
  "description": "An article about web development",
  "tags": ["507f1f77bcf86cd799439015"],  // Tag IDs (ObjectId refs)
  "folderId": "507f1f77bcf86cd799439011",  // Optional
  "isFavorite": false,
  "isArchived": false,
  "favicon": "https://example.com/favicon.ico",
  "thumbnail": "https://example.com/og-image.jpg",
  "metadata": {
    "siteName": "Example Site",
    "author": "John Smith",
    "publishedDate": "2025-12-20T00:00:00.000Z",
    "readTime": 5
  }
}
```

**Request Body (Document):**

**Note:** For uploading documents, use the `POST /api/resources/upload` endpoint instead. To create a document reference manually:

```json
{
  "type": "document",
  "title": "Research Paper",
  "description": "Important research document",
  "file": {
    "path": "/uploads/document-1234567890.pdf",
    "key": "uploads/user123/doc.pdf",
    "name": "research-paper.pdf",
    "mimeType": "application/pdf",
    "size": 1024000
  },
  "tags": ["507f1f77bcf86cd799439015"],  // Tag IDs
  "folderId": "507f1f77bcf86cd799439011",
  "isFavorite": false,
  "isArchived": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "type": "url",
    "url": "https://example.com/article",
    "title": "Interesting Article",
    "description": "An article about web development",
    "tags": ["507f1f77bcf86cd799439015"],
    "folderId": "507f1f77bcf86cd799439011",
    "isFavorite": false,
    "isArchived": false,
    "favicon": "https://example.com/favicon.ico",
    "thumbnail": "https://example.com/og-image.jpg",
    "metadata": {
      "siteName": "Example Site",
      "author": "John Smith",
      "publishedDate": "2025-12-20T00:00:00.000Z",
      "readTime": 5
    },
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Upload Document

Upload a file as a document resource.

**Endpoint:** `POST /api/resources/upload`

**Access:** Protected (with Persona Context - **Persona Required**)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required) - The file to upload
- `title` (optional) - Document title
- `description` (optional) - Document description  
- `tags` (optional) - Comma-separated tag IDs
- `folderId` (optional) - Folder ID
- `isFavorite` (optional) - Mark as favorite (true/false)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "type": "document",
    "title": "Research Paper.pdf",
    "file": {
      "path": "/uploads/document-1234567890.pdf",
      "key": "uploads/user123/doc.pdf",
      "name": "research-paper.pdf",
      "mimeType": "application/pdf",
      "size": 1024000
    },
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Get All Resources

Retrieve all resources for current persona.

**Endpoint:** `GET /api/resources`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `type` (optional) - Filter by type (`url` or `document`)
- `tags` (optional) - Filter by tag IDs (comma-separated)
- `folderId` (optional) - Filter by folder ID
- `isFavorite` (optional) - Filter favorites (true/false)
- `isArchived` (optional) - Filter archived resources (true/false)

**Example:**
```
GET /api/resources?type=url&folderId=507f1f77bcf86cd799439011&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resources retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "url",
      "url": "https://example.com/article",
      "title": "Interesting Article",
      "tags": ["507f1f77bcf86cd799439015"],
      "isFavorite": false,
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### Get Unorganized Resources

Retrieve all resources that haven't been organized (no folder assigned).

**Endpoint:** `GET /api/resources/unorganized`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Unorganized resources retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "url",
      "url": "https://example.com/article",
      "title": "Interesting Article",
      "folderId": null,
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "pages": 1
  }
}
```

---

### Search Resources

Search resources by title, description, URL, or content.

**Endpoint:** `GET /api/resources/search`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `q` (required) - Search query
- `type` (optional) - Filter by type (`url` or `document`)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Example:**
```
GET /api/resources/search?q=javascript&type=url&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "type": "url",
      "url": "https://example.com/javascript-guide",
      "title": "JavaScript Complete Guide",
      "description": "Learn JavaScript from scratch",
      "tags": ["507f1f77bcf86cd799439015"],
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

---

### Get Resource by ID

Retrieve a specific resource.

**Endpoint:** `GET /api/resources/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Resource ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "type": "url",
    "url": "https://example.com/article",
    "title": "Interesting Article",
    "description": "An article about web development",
    "tags": ["507f1f77bcf86cd799439015"],
    "folderId": "507f1f77bcf86cd799439013",
    "isFavorite": false,
    "isArchived": false,
    "favicon": "https://example.com/favicon.ico",
    "thumbnail": "https://example.com/og-image.jpg",
    "metadata": {
      "siteName": "Example Site",
      "author": "John Smith",
      "publishedDate": "2025-12-20T00:00:00.000Z",
      "readTime": 5
    },
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Update Resource

Update an existing resource.

**Endpoint:** `PUT /api/resources/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Resource ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["javascript", "web-dev", "tutorial"],
  "isFavorite": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resource updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Title",
    "description": "Updated description",
    "tags": ["javascript", "web-dev", "tutorial"],
    "isFavorite": true,
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

### Delete Resource

Delete a resource.

**Endpoint:** `DELETE /api/resources/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Resource ID

**Success Response (204):**
```
No Content
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

### Move Resource to Trash

Move a resource to trash without permanently deleting it.

**Endpoint:** `PATCH /api/resources/:id/trash`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Resource ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resource moved to trash successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "type": "url",
    "title": "Interesting Article",
    "isTrashed": true,
    "updatedAt": "2026-02-03T19:59:30.312Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

### Restore Resource from Trash

Restore a trashed resource back to active state.

**Endpoint:** `PATCH /api/resources/:id/restore`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Resource ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resource restored from trash successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "type": "url",
    "title": "Interesting Article",
    "isTrashed": false,
    "updatedAt": "2026-02-03T19:59:31.327Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## Bookmark Endpoints

### Get All Bookmarks

Retrieve all bookmarks for current persona.

**Endpoint:** `GET /api/bookmarks`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `tags` (optional) - Filter by tags (comma-separated)
- `folder` (optional) - Filter by folder ID
- `isFavorite` (optional) - Filter favorites (true/false)

**Example:**
```
GET /api/bookmarks?folderId=507f1f77bcf86cd799439011&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmarks retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "url": "https://example.com/javascript-guide",
      "title": "JavaScript Complete Guide",
      "description": "Learn JavaScript from scratch",
      "tags": ["javascript", "programming"],
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

---

### Get Bookmark by ID

Retrieve a specific bookmark.

**Endpoint:** `GET /api/bookmarks/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Bookmark ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "url": "https://example.com/article",
    "title": "Interesting Article",
    "description": "An article about web development",
    "tags": ["javascript", "tutorial"],
    "folderId": "507f1f77bcf86cd799439013",
    "isFavorite": false,
    "metadata": {
      "imageUrl": "https://example.com/image.jpg",
      "domain": "example.com"
    },
    "createdAt": "2025-12-26T10:00:00.000Z",
    "updatedAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Update Bookmark

Update an existing bookmark.

**Endpoint:** `PUT /api/bookmarks/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Bookmark ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["javascript", "web-dev", "tutorial"],
  "isFavorite": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bookmark updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Updated Title"
    "description": "Updated description",
    "tags": ["javascript", "web-dev", "tutorial"],
    "isFavorite": true,
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

### Delete Bookmark

Delete a bookmark.

**Endpoint:** `DELETE /api/bookmarks/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Bookmark ID

**Success Response (204):**
```
No Content
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Bookmark not found"
}
```

---

## Auto-Organise Endpoints

The Auto-Organise feature uses AI to automatically categorize and organize your unorganized resources. All endpoints require authentication and an active persona.

### Auto-Organise Resources

Trigger auto-organisation for unorganized resources. This endpoint returns immediately while processing happens asynchronously in the background.

**Endpoint:** `POST /api/organise/auto`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `limit` (optional) - Maximum number of resources to organize (default: 50, max: 100)

**Example:**
```
POST /api/organise/auto?limit=30
```

**Success Response (200):**
```json
{
  "success": true,
  "status": "started",
  "message": "Auto organise in progress. Your resources are being organized.",
  "limit": 30
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Limit must be between 1 and 100"
}
```

**Note:** The actual organization happens asynchronously. Resources will be categorized, tagged, and moved to appropriate folders based on AI analysis.

---

### Preview Auto-Organise

Get a preview of how many resources will be organized.

**Endpoint:** `GET /api/organise/preview`

**Access:** Protected (with Persona Context - **Persona Required**)

**Success Response (200):**
```json
{
  "success": true,
  "count": 45,
  "message": "Found 45 unorganised resources"
}
```

---

### Extract Metadata

Extract metadata from a URL for auto-filling resource forms using AI.

**Endpoint:** `POST /api/organise/extract-metadata`

**Access:** Protected (with Persona Context - **Persona Required**)

**Request Body:**
```json
{
  "url": "https://example.com/article-about-javascript"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Metadata extracted successfully",
  "data": {
    "title": "Complete Guide to JavaScript",
    "description": "Learn JavaScript from basics to advanced concepts",
    "suggestedTags": ["javascript", "programming", "tutorial"],
    "suggestedFolder": "Programming Resources",
    "favicon": "https://example.com/favicon.ico",
    "thumbnail": "https://example.com/og-image.jpg",
    "metadata": {
      "siteName": "Example Tech Blog",
      "author": "John Doe",
      "publishedDate": "2025-01-15T00:00:00.000Z",
      "readTime": 8
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid URL provided"
}
```

**Note:** This endpoint is useful for pre-filling forms when users add new bookmarks. It analyzes the URL content and suggests appropriate metadata.

---

### Extract Document Metadata

Extract metadata from an uploaded document file for auto-filling resource forms using AI.

**Endpoint:** `POST /api/organise/extract-document-metadata`

**Access:** Protected (with Persona Context - **Persona Required**)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required) - The document file to analyze

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "Research Paper on Machine Learning",
    "description": "Comprehensive study on neural networks",
    "suggestedTags": ["machine-learning", "AI", "research"],
    "suggestedFolder": "Research Documents",
    "metadata": {
      "author": "Dr. Jane Smith",
      "pageCount": 45,
      "keywords": ["neural networks", "deep learning"]
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "File is required"
}
```

---

## Folder Endpoints

### Create Folder

Create a new folder for organizing resources.

**Endpoint:** `POST /api/folders`

**Access:** Protected (with Persona Context - **Persona Required**)

**Request Body:**
```json
{
  "name": "Web Development",
  "description": "Resources for web development",
  "color": "#3B82F6",
  "icon": "folder",
  "parentId": null,  // Optional parent folder ID
  "order": 0,  // Display order
  "isShared": false,
  "isDefault": false
}
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Folder created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "name": "Web Development",
    "description": "Resources for web development",
    "color": "#3B82F6",
    "icon": "folder",
    "parentId": null,
    "order": 0,
    "isShared": false,
    "isDefault": false,
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Get All Folders

Retrieve all folders for current persona.

**Endpoint:** `GET /api/folders`

**Access:** Protected (with Persona Context - **Persona Required**)

**Note:** A default "Uncategorized" folder is automatically created for each persona when first accessed.

**Success Response (200):

**Note:** A default "Uncategorized" folder is automatically created for each persona when first accessed.
```json
{
  "success": true,
  "message": "Folders retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Web Development",
      "description": "Resources for web development",
      "color": "#3B82F6",
      "icon": "folder",
      "createdAt": "2025-12-26T10:00:00.000Z"
    }
  ]
}
```

---

### Get Folder by ID

Retrieve a specific folder.

**Endpoint:** `GET /api/folders/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Folder ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Folder retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Web Development",
    "description": "Resources for web development",
    "color": "#3B82F6",
    "icon": "folder",
    "isPrivate": false,
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Update Folder

Update an existing folder.

**Endpoint:** `PUT /api/folders/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Folder ID

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "description": "Updated description",
  "color": "#10B981"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Folder updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Updated Folder Name",
    "description": "Updated description",
    "color": "#10B981",
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

### Delete Folder

Delete a folder.

**Endpoint:** `DELETE /api/folders/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Folder ID

**Success Response (204):**
```
No Content
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Folder not found"
}
```

---

## Tag Endpoints

### Create Tag

Create a new tag for categorizing bookmarks.

**Endpoint:** `POST /api/tags`

**Access:** Protected (with Persona Context - **Persona Required**)

**Note:** Tags are automatically created when creating resources with new tag names. Manual tag creation is optional.

**Request Body:**
```json
{
  "name": "JavaScript",
  "color": "#F7DF1E"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439011",
    "persona": "student",
    "name": "JavaScript",
    "color": "#F7DF1E",
    "usageCount": 0,
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Tag with this name already exists"
}
```

---

### Get All Tags

Retrieve all tags for current persona.

**Endpoint:** `GET /api/tags`

**Access:** Protected (with Persona Context - **Persona Required**)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tags retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "JavaScript",
      "color": "#F7DF1E",
      "usageCount": 5,
      "createdAt": "2025-12-26T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Python",
      "color": "#3B82F6",
      "usageCount": 3,
      "createdAt": "2025-12-26T10:05:00.000Z"
    }
  ]
}
```

---

### Get Tag by ID

Retrieve a specific tag.

**Endpoint:** `GET /api/tags/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Tag ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tag retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "JavaScript",
    "color": "#F7DF1E",
    "usageCount": 5,
    "createdAt": "2025-12-26T10:00:00.000Z"
  }
}
```

---

### Get Popular Tags

Retrieve most frequently used tags.

**Endpoint:** `GET /api/tags/popular`

**Access:** Protected (with Persona Context - **Persona Required**)

**Query Parameters:**
- `limit` (optional) - Number of tags to return (default: 10)

**Example:**
```
GET /api/tags/popular?limit=5
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Popular tags retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "JavaScript",
      "color": "#F7DF1E",
      "usageCount": 15
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Python",
      "color": "#3B82F6",
      "usageCount": 10
    }
  ]
}
```

---

### Update Tag

Update an existing tag.

**Endpoint:** `PUT /api/tags/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Tag ID

**Request Body:**
```json
{
  "name": "JavaScript ES6+",
  "color": "#FFD700"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tag updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "name": "JavaScript ES6+",
    "color": "#FFD700",
    "usageCount": 5,
    "updatedAt": "2025-12-26T11:00:00.000Z"
  }
}
```

---

### Delete Tag

Delete a tag.

**Endpoint:** `DELETE /api/tags/:id`

**Access:** Protected (with Persona Context - **Persona Required**)

**Path Parameters:**
- `id` - Tag ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tag deleted successfully",
  "data": null
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Tag not found"
}
```

---

## Persona-Specific Endpoints

Each persona has its own specialized endpoints for managing persona-specific data. All endpoints require authentication and that the user has added the specific persona to their account.

---

### General Persona

**Base Path:** `/api/genaral`

**Access:** Protected (Requires `genaral` persona)

#### Get Dashboard

Retrieve dashboard data for general persona.

**Endpoint:** `GET /api/genaral/dashboard`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalResources": 45,
      "totalFolders": 8,
      "totalTags": 15
    }
  }
}
```

---

### Student Persona

**Base Path:** `/api/student`

**Access:** Protected (Requires `student` persona)

#### Get Dashboard

**Endpoint:** `GET /api/student/dashboard`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard retrieved successfully",
  "data": {
    "assignments": [],
    "courses": [],
    "recentSessions": []
  }
}
```

#### Assignment Endpoints

**Create Assignment**

**Endpoint:** `POST /api/student/assignments`

**Request Body:**
```json
{
  "title": "Math Homework",
  "description": "Chapter 5 exercises",
  "course": "507f1f77bcf86cd799439014",  // Course ID
  "dueDate": "2025-12-31T23:59:59.000Z",
  "priority": "high",
  "status": "in-progress"
}
```

**Get All Assignments**

**Endpoint:** `GET /api/student/assignments`

**Query Parameters:**
- `status` (optional) - Filter by status (pending, in-progress, completed)
- `priority` (optional) - Filter by priority (low, medium, high)
- `course` (optional) - Filter by course ID

**Update Assignment**

**Endpoint:** `PUT /api/student/assignments/:id`

**Request Body:**
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Delete Assignment**

**Endpoint:** `DELETE /api/student/assignments/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Assignment deleted successfully",
  "data": null
}
```

#### Course Endpoints

**Create Course**

**Endpoint:** `POST /api/student/courses`

**Request Body:**
```json
{
  "name": "Web Development 101",
  "code": "CS-301",
  "instructor": "Dr. Smith",
  "schedule": "Mon, Wed, Fri 10:00 AM",
  "credits": 3,
  "semester": "Fall 2026"
}
```

**Get All Courses**

**Endpoint:** `GET /api/student/courses`

**Update Course**

**Endpoint:** `PUT /api/student/courses/:id`

**Delete Course**

**Endpoint:** `DELETE /api/student/courses/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "data": null
}
```

#### Study Session Endpoints

**Create Study Session**

**Endpoint:** `POST /api/student/study-sessions`

**Request Body:**
```json
{
  "course": "507f1f77bcf86cd799439014",  // Course ID
  "duration": 120,  // minutes
  "topic": "React Hooks",
  "notes": "Covered useState and useEffect hooks",
  "date": "2025-12-26T14:00:00.000Z"
}
```

**Get All Study Sessions**

**Endpoint:** `GET /api/student/study-sessions`

**Update Study Session**

**Endpoint:** `PUT /api/student/study-sessions/:id`

**Delete Study Session**

**Endpoint:** `DELETE /api/student/study-sessions/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Study session deleted successfully",
  "data": null
}
```

---

### Professional Persona

**Base Path:** `/api/professional`

**Access:** Protected (Requires `professional` persona)

#### Get Dashboard

**Endpoint:** `GET /api/professional/dashboard`

#### Project Endpoints

**Create Project**

**Endpoint:** `POST /api/professional/projects`

**Request Body:**
```json
{
  "name": "E-commerce Platform",
  "description": "Building a new e-commerce system",
  "client": "Acme Corp",
  "status": "in-progress",
  "startDate": "2026-01-01",
  "deadline": "2026-06-30",
  "priority": "high"
}
```

**Get All Projects**

**Endpoint:** `GET /api/professional/projects`

**Update Project**

**Endpoint:** `PUT /api/professional/projects/:id`

**Delete Project**

**Endpoint:** `DELETE /api/professional/projects/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

#### Contact Endpoints

**Create Contact**

**Endpoint:** `POST /api/professional/contacts`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "company": "Tech Corp",
  "position": "CTO",
  "email": "jane@techcorp.com",
  "phone": "+1234567890",
  "notes": "Met at tech conference",
  "tags": ["networking", "technology"]
}
```

**Get All Contacts**

**Endpoint:** `GET /api/professional/contacts`

**Update Contact**

**Endpoint:** `PUT /api/professional/contacts/:id`

**Delete Contact**

**Endpoint:** `DELETE /api/professional/contacts/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "data": null
}
```

---

### Creator Persona

**Base Path:** `/api/creator`

**Access:** Protected (Requires `creator` persona)

#### Get Dashboard

**Endpoint:** `GET /api/creator/dashboard`

#### Project Endpoints

**Create Project**

**Endpoint:** `POST /api/creator/projects`

**Request Body:**
```json
{
  "title": "YouTube Video Series",
  "description": "Web development tutorial series",
  "platform": "YouTube",
  "status": "planning",
  "deadline": "2026-03-31",
  "priority": "high"
}
```

**Get All Projects**

**Endpoint:** `GET /api/creator/projects`

**Update Project**

**Endpoint:** `PUT /api/creator/projects/:id`

**Delete Project**

**Endpoint:** `DELETE /api/creator/projects/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

#### Calendar Endpoints

**Create Calendar Entry**

**Endpoint:** `POST /api/creator/calendar`

**Request Body:**
```json
{
  "title": "Upload New Video",
  "contentType": "video",
  "platform": "YouTube",
  "scheduledDate": "2026-01-30T10:00:00.000Z",
  "status": "scheduled",
  "notes": "Tutorial about React hooks"
}
```

**Get Calendar**

**Endpoint:** `GET /api/creator/calendar`

**Update Calendar Entry**

**Endpoint:** `PUT /api/creator/calendar/:id`

**Delete Calendar Entry**

**Endpoint:** `DELETE /api/creator/calendar/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Calendar entry deleted successfully",
  "data": null
}
```

---

### Entrepreneur Persona

**Base Path:** `/api/entrepreneur`

**Access:** Protected (Requires `entrepreneur` persona)

#### Get Dashboard

**Endpoint:** `GET /api/entrepreneur/dashboard`

#### Startup Endpoints

**Create Startup**

**Endpoint:** `POST /api/entrepreneur/startups`

**Request Body:**
```json
{
  "name": "Tech Startup Inc",
  "description": "AI-powered analytics platform",
  "industry": "SaaS",
  "stage": "seed",
  "founded": "2026-01-01",
  "website": "https://techstartup.com"
}
```

**Get All Startups**

**Endpoint:** `GET /api/entrepreneur/startups`

**Update Startup**

**Endpoint:** `PUT /api/entrepreneur/startups/:id`

**Delete Startup**

**Endpoint:** `DELETE /api/entrepreneur/startups/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Startup deleted successfully",
  "data": null
}
```

#### Investor Endpoints

**Create Investor**

**Endpoint:** `POST /api/entrepreneur/investors`

**Request Body:**
```json
{
  "name": "Venture Capital Partners",
  "contactPerson": "John Investor",
  "email": "john@vcpartners.com",
  "phone": "+1234567890",
  "investmentRange": "$500K - $2M",
  "sector": "Technology",
  "notes": "Interested in AI startups"
}
```

**Get All Investors**

**Endpoint:** `GET /api/entrepreneur/investors`

**Update Investor**

**Endpoint:** `PUT /api/entrepreneur/investors/:id`

**Delete Investor**

**Endpoint:** `DELETE /api/entrepreneur/investors/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Investor deleted successfully",
  "data": null
}
```

---

### Researcher Persona

**Base Path:** `/api/researcher`

**Access:** Protected (Requires `researcher` persona)

#### Get Dashboard

**Endpoint:** `GET /api/researcher/dashboard`

#### Research Project Endpoints

**Create Research Project**

**Endpoint:** `POST /api/researcher/projects`

**Request Body:**
```json
{
  "title": "Machine Learning Study",
  "description": "Research on neural networks",
  "status": "active",
  "startDate": "2026-01-01",
  "field": "Computer Science",
  "collaborators": ["Dr. Jane Doe", "Prof. John Smith"]
}
```

**Get All Projects**

**Endpoint:** `GET /api/researcher/projects`

**Update Project**

**Endpoint:** `PUT /api/researcher/projects/:id`

**Delete Project**

**Endpoint:** `DELETE /api/researcher/projects/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": null
}
```

#### Publication Endpoints

**Create Publication**

**Endpoint:** `POST /api/researcher/publications`

**Request Body:**
```json
{
  "title": "Neural Networks in Practice",
  "authors": ["Dr. Smith", "Dr. Jones"],
  "journal": "AI Research Journal",
  "year": 2026,
  "doi": "10.1234/example",
  "url": "https://journal.example.com/paper",
  "abstract": "This paper explores...",
  "keywords": ["machine learning", "neural networks", "AI"]
}
```

**Get All Publications**

**Endpoint:** `GET /api/researcher/publications`

**Update Publication**

**Endpoint:** `PUT /api/researcher/publications/:id`

**Delete Publication**

**Endpoint:** `DELETE /api/researcher/publications/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Publication deleted successfully",
  "data": null
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## API Versioning

Currently using **v1** (implicit). Future versions will be explicitly versioned:
```
/api/v2/bookmarks
```

---

## Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get bookmarks (with token)
curl -X GET http://localhost:3000/api/bookmarks \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Register with initial persona
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    initialPersona: 'student'  // Important: Include persona
  })
});
const { data: registerData } = await registerResponse.json();
let token = registerData.token;

// Or if already registered, login and add persona
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});
const { data: loginData } = await loginResponse.json();
token = loginData.token;

// Add persona if not already added
const personaResponse = await fetch('http://localhost:3000/api/auth/personas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ persona: 'student' })
});
const { data: personaData } = await personaResponse.json();
token = personaData.token;  // Use updated token

// Now you can access resources
const resources = await fetch('http://localhost:3000/api/resources', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json());

// Get bookmarks
const bookmarks = await fetch('http://localhost:3000/api/bookmarks', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json());
```

---

## Webhooks (Future Feature)

Webhook support for real-time notifications (planned for future release):
- Bookmark created
- Persona switched
- Assignment due soon

---

## Support & Additional Resources

- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **Documentation**: See `SETUP_AND_STRUCTURE.md` for setup details

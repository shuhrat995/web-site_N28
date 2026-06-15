# School Website Backend & Admin Panel

Backend server and admin panel for the State School Website.

## 🔐 Admin Panel Access

The admin panel is located at: `http://localhost:3001/admin/`

### Default Admin Credentials
- **Username:** `admin`
- **Password:** `School@Admin2024!`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already configured with defaults. You can modify it if needed:

```env
PORT=3001
JWT_SECRET=school-website-secret-key-2024-change-in-production
JWT_EXPIRES_IN=24h
ADMIN_USERNAME=admin
ADMIN_PASSWORD=School@Admin2024!
MAX_IMAGE_SIZE_KB=500
MAX_TEXT_LENGTH=2500
UPLOAD_DIR=./uploads
DB_PATH=./database.sqlite
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

### 4. Access the Admin Panel

Open your browser and navigate to:
```
http://localhost:3001/admin/
```

Or open the HTML file directly:
```
backend/admin/index.html
```

## 📁 Project Structure

```
backend/
├── admin/                   # Admin panel (separate from React app)
│   ├── index.html          # Admin panel HTML
│   ├── css/
│   │   └── admin.css       # Admin panel styles
│   └── js/
│       └── admin.js        # Admin panel JavaScript
├── src/
│   ├── config/
│   │   └── database.ts     # Database configuration & initialization
│   ├── controllers/
│   │   ├── authController.ts     # Authentication logic
│   │   ├── contentController.ts  # Content management logic
│   │   └── settingsController.ts # Settings management logic
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── content.ts      # Content routes
│   │   ├── queue.ts        # Queue routes
│   │   └── settings.ts     # Settings routes
│   ├── middleware/
│   │   └── validation.ts   # Validation middleware
│   ├── utils/
│   │   ├── auth.ts         # Authentication utilities
│   │   ├── upload.ts       # File upload utilities
│   │   └── queue.ts        # Offline queue utilities
│   ├── types/              # TypeScript type definitions
│   └── server.ts           # Main server file
├── uploads/                 # Uploaded images (auto-created)
├── database.sqlite          # SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── .env
```

## 🔑 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@school.edu"
  }
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer <token>

Response:
{
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@school.edu",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Change Password
```
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

Response:
{
  "message": "Password changed successfully"
}
```

### Content Management

#### Get All Content
```
GET /content?category=news&published=true&page=1&limit=20

Query Parameters:
- category: Filter by category (news, events, announcements, gallery)
- published: Filter by published status (true, false)
- page: Page number (default: 1)
- limit: Items per page (default: 20)

Response:
{
  "content": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get Single Content
```
GET /content/:id

Response:
{
  "content": {
    "id": 1,
    "title": "Sample Content",
    "description": "Description text",
    "content_text": "Full content text...",
    "image_url": "/uploads/image-1234567890.jpg",
    "image_path": "/path/to/image.jpg",
    "category": "news",
    "is_published": true,
    "created_by": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Create Content
```
POST /content
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- title: "Content Title" (required)
- category: "news" (required)
- description: "Short description" (optional, max 500 chars)
- content_text: "Full content" (optional, max 2500 chars)
- image: <file> (optional, max 500KB)
- is_published: true/false

Response:
{
  "message": "Content created successfully",
  "content": {...}
}
```

#### Update Content
```
PUT /content/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Same form data as Create Content

Response:
{
  "message": "Content updated successfully",
  "content": {...}
}
```

#### Delete Content
```
DELETE /content/:id
Authorization: Bearer <token>

Response:
{
  "message": "Content deleted successfully"
}
```

#### Upload Image Only
```
POST /content/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: <file> (required, max 500KB)

Response:
{
  "message": "Image uploaded successfully",
  "image_url": "/uploads/image-1234567890.jpg",
  "image_path": "/path/to/image.jpg"
}
```

### Offline Queue

#### Get Queue Stats
```
GET /queue/stats
Authorization: Bearer <token>

Response:
{
  "stats": {
    "pending": 5,
    "processing": 0,
    "completed": 10,
    "failed": 2,
    "total": 17
  }
}
```

#### Get Pending Items
```
GET /queue/pending
Authorization: Bearer <token>

Response:
{
  "items": [...]
}
```

#### Process Queue
```
POST /queue/process
Authorization: Bearer <token>

Response:
{
  "message": "Queue processing completed",
  "results": [...]
}
```

### Settings

#### Get Settings
```
GET /settings

Response:
{
  "settings": {
    "site_name": "State School Website",
    "site_description": "Official State School Website",
    "maintenance_mode": "false",
    "allow_registration": "false"
  }
}
```

#### Update Setting
```
PUT /settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "site_name",
  "value": "New School Name"
}

Response:
{
  "message": "Setting updated successfully"
}
```

### Health Check

```
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 🎨 Admin Panel Features

### 1. Dashboard
- View total content count
- Track published vs draft content
- Monitor offline queue
- See recent content

### 2. Content Management
- Create, edit, and delete content
- Upload images (max 500KB)
- Add text content (max 2500 characters)
- Categorize content (News, Events, Announcements, Gallery)
- Publish/unpublish content
- Filter and search content

### 3. Offline Queue
- Automatic queue when offline
- View pending items
- Manual queue processing
- Retry failed items

### 4. Settings
- Update site name and description
- Toggle maintenance mode
- Configure site settings

### 5. Profile
- View admin details
- Change password
- Account management

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS protection
- File upload validation
- Input sanitization
- SQL injection prevention (parameterized queries)

## 📊 Database Schema

### admins
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE)
- password_hash (TEXT)
- email (TEXT)
- is_active (BOOLEAN)
- created_at (DATETIME)
- updated_at (DATETIME)

### content
- id (INTEGER PRIMARY KEY)
- title (TEXT)
- description (TEXT)
- content_text (TEXT)
- image_url (TEXT)
- image_path (TEXT)
- category (TEXT)
- is_published (BOOLEAN)
- publish_date (DATETIME)
- created_by (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)

### offline_queue
- id (INTEGER PRIMARY KEY)
- action (TEXT)
- payload (TEXT)
- status (TEXT)
- retry_count (INTEGER)
- max_retries (INTEGER)
- error_message (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
- processed_at (DATETIME)

### settings
- id (INTEGER PRIMARY KEY)
- key (TEXT UNIQUE)
- value (TEXT)
- description (TEXT)
- updated_at (DATETIME)

## ⚙️ Configuration

### Image Upload Limits
- Maximum file size: 500KB
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- Storage location: `backend/uploads/`

### Text Limits
- Title: 200 characters
- Description: 500 characters
- Content text: 2500 characters

### Offline Queue
- Auto-processes every 5 minutes
- Maximum 10 retry attempts per item
- Stored in localStorage when offline
- Syncs when connection is restored

## 🐛 Error Handling

The system includes:
- File size validation (500KB limit)
- Text length validation (2500 char limit)
- Connection error handling
- Offline mode with queue
- Graceful error messages
- Toast notifications
- Form validation

## 🔄 Running Both Servers

To run the frontend and backend together:

**Terminal 1 - Frontend:**
```bash
cd "d:\Desktop\State School Website Design"
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd "d:\Desktop\State School Website Design\backend"
npm run dev
```

## 📝 Notes

1. The admin panel is completely separate from the React frontend
2. All uploaded images are stored in `backend/uploads/` folder
3. The database is SQLite and stored in `backend/database.sqlite`
4. The admin panel is hidden and requires the exact URL to access
5. Offline mode saves changes locally and syncs when reconnected
6. Default credentials should be changed immediately after first login

## 🆘 Troubleshooting

### Port Already in Use
Change the PORT in `.env` file to a different port (e.g., 3002)

### Database Issues
Delete `database.sqlite` and restart the server - it will recreate

### Upload Issues
- Check file size (max 500KB)
- Check file format (JPEG, PNG, GIF, WebP only)
- Ensure `uploads/` folder has write permissions

### Login Issues
- Verify backend server is running
- Check credentials in `.env` file
- Clear browser cache and try again

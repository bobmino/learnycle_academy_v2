# LearnCycle Academy

A comprehensive MERN stack learning management system (LMS) for developer education with multilingual support.

## 🚀 Features

### Backend

- **Authentication**: JWT with access/refresh tokens, HttpOnly cookies
- **Role-Based Access Control**: Admin, Teacher, Student, Prospect roles
- **Security**: Helmet, CORS, rate limiting, input validation with Joi
- **File Upload**: Multer for PDF document management
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful endpoints with proper error handling

### Frontend

- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS with dark mode support
- **Internationalization**: i18next (French, English, Arabic)
- **Routing**: React Router v6
- **HTTP**: Axios with automatic token refresh

### Core Functionality

- ✅ User authentication and authorization
- ✅ **Formation → Module → Content** hierarchical structure
- ✅ Formation management (create, edit, assign modules)
- ✅ Module and lesson management
- ✅ Quiz system with scoring
- ✅ Project/Case study management
- ✅ Student progress tracking
- ✅ Prospect form submission
- ✅ Three case study modules (Café, Restaurant, Hotel)
- ✅ Git collaboration tutorial
- ✅ Multi-language support (FR/EN/AR)
- ✅ Light/Dark theme toggle
- ✅ Responsive design

### Content Structure

The LMS follows a hierarchical structure:

```
Formation (Course)
  └── Module
      ├── Lessons
      ├── Quizzes
      └── Projects/Case Studies
```

- **Formations**: Top-level courses that group related modules
- **Modules**: Learning units within a formation
- **Lessons**: Content pages with text and optional PDFs
- **Quizzes**: Assessments linked to modules
- **Projects/Case Studies**: Practical assignments (can be transversal across multiple modules)

## 📂 Project Structure

```
learncycle-academy/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/    # Reusable components
│   │   ├── i18n/          # Translation files (FR/EN/AR)
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── store/         # Redux store and slices
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js/Express backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, validation, upload
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Helper utilities
│   ├── docs/             # PDF storage
│   │   ├── templates/    # Case study PDFs
│   │   └── uploads/      # User-uploaded PDFs
│   ├── server.js
│   └── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/learncycle
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CLIENT_URL=http://localhost:5173
```

4. Seed the database:

```bash
npm run seed
```

This will create:

- Admin user: `admin@learncycle.com` / `admin123`
- Teacher user: `teacher@learncycle.com` / `teacher123`
- Student user: `student@learncycle.com` / `student123`
- 3 case study modules (Café, Restaurant, Hotel)
- Sample lessons and quizzes

5. Start the server:

```bash
npm run dev    # Development with nodemon
# or
npm start      # Production
```

Server runs on http://localhost:5000

### Frontend Setup

1. Navigate to client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:

```bash
npm run dev
```

Frontend runs on http://localhost:5173

## 👥 User Roles & Access

### Student

- View modules and lessons
- Track progress
- Take quizzes
- Access teamwork tutorial

### Teacher

- All student permissions
- Create formations and modules
- Create lessons
- Upload PDF documents
- Create/edit quizzes
- Create projects/case studies
- Manage content assigned to them

### Admin

- All teacher permissions
- Manage users
- View prospect submissions
- Delete modules/lessons
- Full system access

### Prospect

- Submit discovery form
- Limited access

## 📱 Pages

### Public

- **Landing Page**: Hero section, case studies overview
- **Login/Register**: Authentication forms
- **Prospect Form**: Lead capture form

### Protected

- **Dashboard**: Role-specific dashboards
- **Content Creator**: Create formations, modules, lessons, quizzes, and projects
- **Content Management**: Manage all content with hierarchical view
- **Formations**: List of all formations with their modules
- **Modules**: List of all learning modules
- **Module Detail**: Lessons, PDFs, quizzes
- **Teamwork**: Git collaboration tutorial

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Formations

- `GET /api/formations` - Get all formations
- `GET /api/formations/:id` - Get formation by ID
- `POST /api/formations` - Create formation (Teacher/Admin)
- `PUT /api/formations/:id` - Update formation (Teacher/Admin)
- `DELETE /api/formations/:id` - Delete formation (Teacher/Admin)
- `POST /api/formations/:id/modules` - Add module to formation
- `DELETE /api/formations/:id/modules/:moduleId` - Remove module from formation

### Modules

- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create module (Teacher/Admin)
- `PUT /api/modules/:id` - Update module (Teacher/Admin)
- `DELETE /api/modules/:id` - Delete module (Admin)

### Lessons

- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/module/:moduleId` - Get lessons by module
- `POST /api/lessons` - Create lesson with PDF (Teacher/Admin)
- `PUT /api/lessons/:id` - Update lesson (Teacher/Admin)
- `DELETE /api/lessons/:id` - Delete lesson (Admin)

### Quiz

- `GET /api/quiz/module/:moduleId` - Get quizzes by module
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `POST /api/quiz` - Create quiz (Teacher/Admin)

### Progress

- `GET /api/progress/me` - Get my progress
- `POST /api/progress/lesson/:lessonId/complete` - Mark lesson complete

### Prospects

- `POST /api/prospects` - Submit prospect form (Public)
- `GET /api/prospects` - Get all prospects (Admin)

### Users (Admin only)

- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🚀 Deployment

### Frontend (Vercel)

1. Build the project:

```bash
cd client
npm run build
```

2. Deploy to Vercel:

```bash
vercel deploy --prod
```

3. Update environment variables in Vercel dashboard:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### Backend (Render)

1. Create a new Web Service on Render

2. Connect your GitHub repository

3. Configure:

   - **Build Command**: `npm install`
   - **Start Command**: `npm start `
   - **Add Environment Variables**:
     ```
     NODE_ENV=production
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_ACCESS_SECRET=your_secret
     JWT_REFRESH_SECRET=your_secret
     CLIENT_URL=https://your-app.vercel.app
     ```

4. Deploy

### MongoDB Atlas

1. Create a cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGO_URI` in backend environment variables
4. Whitelist Render's IP addresses or use 0.0.0.0/0

## 🧪 Testing

### Manual Testing

1. Start both backend and frontend
2. Register with different roles
3. Test authentication flow
4. Create modules/lessons as teacher
5. View progress as student
6. Submit prospect form
7. Check admin dashboard

### Test Credentials

```
Admin:   admin@learncycle.com   / admin123
Teacher: teacher@learncycle.com / teacher123
Student: student@learncycle.com / student123
```

## 📋 Features Checklist

- [x] User authentication (JWT + HttpOnly cookies)
- [x] Role-based access control
- [x] Formation management (hierarchical structure)
- [x] Module management with formation assignment
- [x] Lesson management with PDF upload
- [x] Quiz system
- [x] Project/Case study management
- [x] Progress tracking
- [x] Prospect form
- [x] Three case study modules
- [x] Multilingual (FR/EN/AR)
- [x] Dark mode
- [x] Responsive design
- [x] Teamwork/Git tutorial
- [x] Admin dashboard
- [x] Teacher dashboard
- [x] Student dashboard
- [x] Content creation and management interface

## 🤝 Contributing

This is an educational project. Students should:

1. Fork the repository
2. Create feature branches
3. Follow the Git workflow in the Teamwork page
4. Submit pull requests
5. Request code reviews

## 📄 License

MIT License - Educational purposes

## 👨‍💻 Tech Stack Summary

**Frontend**: React, Vite, Redux Toolkit, TailwindCSS, i18next, Axios, React Router  
**Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Joi  
**Dev Tools**: ESLint, Nodemon, PostCSS, Autoprefixer

---

**LearnCycle Academy** - Learn. Build. Collaborate.

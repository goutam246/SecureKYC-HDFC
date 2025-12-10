# Secure KYC Platform

A comprehensive Know Your Customer (KYC) verification platform built with React, TypeScript, and Node.js. This platform enables secure digital onboarding with document verification, photo capture, and selfie matching capabilities.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Personal Details Form**: Collect user information with validation
- **Document Upload**: Support for multiple document types:
  - Aadhaar Card (Mandatory)
  - PAN Card (Mandatory)
  - Passport (Optional)
  - Voter ID (Optional)
- **Document Number Entry**: Manual entry of document numbers (Aadhaar, PAN, Passport, Voter ID)
- **Document Scanning**: Image quality detection and edge detection
- **Photo & Selfie Capture**: Profile photo and selfie upload with face matching
- **Progress Tracking**: Step-by-step progress indicator
- **Real-time Validation**: Form validation and error handling
- **Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components
- **Database Integration**: SQLite database for data persistence

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "final kyc project___etue -experiment"
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
npm run server:install
```

Or manually:

```bash
cd server
npm install
cd ..
```

## 🚀 Running the Project

### Option 1: Run Both Frontend and Backend Together (Recommended)

This is the easiest way to run the entire application:

```bash
npm run dev:all
```

This command will start:
- Frontend development server on `http://localhost:8080`
- Backend API server on `http://localhost:3001`

### Option 2: Run Frontend and Backend Separately

**Terminal 1 - Start Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```

### Option 3: Production Mode

**Build the frontend:**
```bash
npm run build
```

**Start the backend:**
```bash
npm run server:start
```

**Preview the built frontend:**
```bash
npm run preview
```

## 📁 Project Structure

```
final kyc project___etue -experiment/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── kyc/                 # KYC-specific components
│   │   │   ├── steps/           # KYC step components
│   │   │   └── ProgressStepper.tsx
│   │   ├── layout/              # Layout components
│   │   └── ui/                  # UI components (shadcn/ui)
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication context
│   │   └── KYCContext.tsx        # KYC application context
│   ├── pages/                   # Page components
│   ├── lib/                     # Utility functions
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Helper functions
│   ├── types/                   # TypeScript type definitions
│   │   └── kyc.ts               # KYC-related types
│   └── main.tsx                 # Application entry point
├── server/                      # Backend server
│   ├── routes/                  # API routes
│   │   ├── auth.js              # Authentication routes
│   │   ├── kyc.js               # KYC routes
│   │   └── upload.js            # File upload routes
│   ├── database.js              # Database configuration
│   ├── server.js                # Express server setup
│   ├── uploads/                 # Uploaded files directory
│   └── kyc_database.db          # SQLite database
├── public/                      # Static assets
├── package.json                 # Frontend dependencies
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_URL=http://localhost:3001/api
PORT=3001
```

The application will use default values if `.env` is not provided:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3001/api`

### Port Configuration

- **Frontend**: Port `8080` (configured in `vite.config.ts`)
- **Backend**: Port `3001` (configured in `server/server.js`)

To change ports, modify:
- Frontend: `vite.config.ts` → `server.port`
- Backend: `server/server.js` → `PORT` variable or set `PORT` environment variable

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/login/app-id` - Login with application ID
- `GET /api/auth/user/:userId` - Get user details

### KYC Application
- `GET /api/kyc/application/:userId` - Get KYC application
- `PUT /api/kyc/application/:userId/personal-details` - Update personal details
- `PUT /api/kyc/application/:userId/step` - Update current step
- `POST /api/kyc/application/:userId/submit` - Submit for verification

### File Upload
- `POST /api/upload/document` - Upload document (Aadhaar, PAN, Passport, Voter ID)
- `POST /api/upload/photo` - Upload photo or selfie

## 🎯 Usage Guide

### 1. Registration
- Navigate to the registration page
- Enter email, mobile number, password, and name
- Click "Register" to create an account

### 2. Login
- Use your email and password to login
- Or use your Application ID and password

### 3. KYC Process
The KYC process consists of the following steps:

1. **Personal Details**
   - Fill in personal information
   - Optionally enter document numbers (Aadhaar, PAN, Passport, Voter ID)
   - Select additional documents (Passport, Voter ID)

2. **Document Scanning**
   - Upload or scan each document
   - System validates image quality
   - Maximum 3 attempts per document

3. **Document Upload Confirmation**
   - Review scanned documents
   - Optionally enter document numbers for each document
   - Confirm and upload to server

4. **Photo Capture**
   - Upload profile photo

5. **Selfie Capture**
   - Capture selfie for face matching

6. **Verification**
   - Review all submitted information
   - Submit for final verification

## 🛠️ Available Scripts

### Frontend Scripts
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm run dev:server` - Start backend development server with watch mode
- `npm run server:start` - Start backend server (production)
- `npm run server:install` - Install backend dependencies

### Combined Scripts
- `npm run dev:all` - Run both frontend and backend together

## 🗄️ Database

The application uses SQLite database (`server/kyc_database.db`). The database is automatically initialized when the server starts.

### View Database

To view the database contents:

```bash
cd server
npm run view-db
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Personal details form validation
- [ ] Document number entry (Aadhaar, PAN, Passport, Voter ID)
- [ ] Document upload and scanning
- [ ] Photo upload
- [ ] Selfie capture
- [ ] Progress tracking
- [ ] Form validation errors
- [ ] Responsive design on mobile/tablet

## 🐛 Troubleshooting

### Port Already in Use

If port 8080 or 3001 is already in use:

**Frontend:**
- Modify `vite.config.ts` and change the port number

**Backend:**
- Set `PORT` environment variable: `PORT=3002 npm run dev:server`
- Or modify `server/server.js` directly

### Database Issues

If you encounter database errors:
- Delete `server/kyc_database.db` and restart the server (database will be recreated)
- Ensure SQLite3 is properly installed: `npm install sqlite3`

### CORS Errors

If you see CORS errors:
- Ensure backend server is running
- Check that frontend URL is in the CORS whitelist in `server/server.js`
- Verify API base URL in `src/lib/api.ts`

### Module Not Found Errors

If you see module not found errors:
- Run `npm install` in the root directory
- Run `npm run server:install` for backend dependencies
- Delete `node_modules` and reinstall if issues persist

### Build Errors

If build fails:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be v18+)

## 📦 Technologies Used

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Framer Motion** - Animations
- **React Router** - Routing
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📝 Notes

- The application uses SQLite for simplicity. For production, consider using PostgreSQL or MySQL.
- File uploads are stored in `server/uploads/` directory
- Maximum file size: 5MB per upload
- Document scanning includes quality checks (blur detection)
- Maximum 3 attempts per document upload
- All document number fields are optional
- Sometimes after registration it directly shows kyc approved, if that happens refresh the page and it will redirect to the kyc form

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👤 Support

For issues or questions, please contact the development team or create an issue in the repository.
Email - goutam2462004@gmail.com
---

**Happy Coding! 🎉**


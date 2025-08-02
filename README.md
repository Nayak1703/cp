# Career Portal

A modern career portal built with Next.js 15, featuring role-based authentication for HR and Candidates, job posting and browsing capabilities with a professional dark theme.

## 🚀 Features

### Frontend

- **Modern UI/UX**: Professional dark theme with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Role-based Authentication**: Separate login flows for HR and Candidates
- **Job Browsing**: Advanced filtering and search through job listings
- **Google OAuth**: Social login integration
- **Email Verification**: OTP-based signup process
- **Uniform Design**: Consistent styling across all pages

### Backend

- **Next.js API Routes**: RESTful API endpoints
- **Prisma ORM**: Type-safe database operations
- **MySQL Database**: Reliable data storage
- **NextAuth.js**: Secure authentication system
- **Email Integration**: Nodemailer for OTP delivery

## 🏗️ Architecture

### Project Structure

```
career-portal/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── components/        # Reusable UI Components
│   ├── auth/             # Authentication pages
│   ├── candidate/        # Candidate dashboard
│   ├── hr/              # HR dashboard
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   └── page.tsx         # Home page
├── src/                  # Source code organization
│   ├── components/       # Shared components
│   ├── lib/             # Library configurations
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   └── constants/       # Application constants
├── lib/                  # Core libraries
├── prisma/              # Database schema

└── public/              # Static assets
```

### Database Schema

- **CandidateInfo**: Job seeker profiles
- **HrInfo**: HR recruiter profiles
- **Jobs**: Job postings with relationships
- **Otp**: Email verification system

### User Types

1. **Candidates**: Can browse and apply for jobs
2. **HR**: Can post and manage job listings

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: NextAuth.js with Google OAuth
- **Email**: Nodemailer
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd career-portal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:

   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/career_portal"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Email
   EMAIL_FROM="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Home Page (`/`)

- **NavBar**: Logo and login/signup buttons
- **Hero Section**: Company branding with statistics
- **Jobs Section**: Filterable job listings with HR information

### Authentication

- **Login** (`/login`): Role-based authentication with tab selection
- **Signup** (`/signup`): Candidate registration with email verification

### Dashboards

- **HR Dashboard** (`/hr/dashboard`): Job posting and management
- **Candidate Dashboard** (`/candidate/dashboard`): Job browsing and applications

## 🔧 API Endpoints

### Jobs

- `GET /api/jobs` - Fetch jobs with filters
- `GET /api/jobs/[jobId]` - Get specific job details

### Authentication

- `POST /api/auth/role-login` - Role-based login
- `POST /api/signup/*` - Signup flow endpoints

## 🎨 UI Components

### Core Components

- **NavBar**: Navigation with login/signup buttons
- **HeroSection**: Company branding and call-to-action
- **JobFilters**: Advanced filter dropdowns
- **JobCard**: Individual job listing with HR info
- **JobsSection**: Main jobs listing with filtering

### Design Features

- **Dark Theme**: Professional glassmorphism design
- **Responsive**: Mobile-first approach
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with Zod

## 🗄️ Database Schema

### Jobs Table

```sql
- jobId (Primary Key)
- role (Job title)
- designation (Job description)
- jobStatus (ACTIVE/INACTIVE)
- experience (Experience level enum)
- department (Department enum)
- location (Location enum)
- jobDescription (HTML content)
- postedOn (Timestamp)
- hrId (Foreign key to HR)
```

### Enums

- **JobStatus**: ACTIVE, INACTIVE
- **Experience**: LESS_THAN_2, TWO_TO_FIVE, FIVE_TO_EIGHT, EIGHT_TO_TWELVE, MORE_THAN_12
- **Department**: ENGINEERING, MARKETING, QA, DEVOPS, PRODUCT_MANAGER
- **Location**: MUMBAI, BHUBANESWAR, DELHI, BANGALORE, HYDERABAD

## 📁 Code Organization

### Type Definitions (`src/types/`)

- Centralized TypeScript interfaces
- API response types
- Form data types
- User and job types

### Constants (`src/constants/`)

- Application constants
- API endpoints
- Error messages
- Route definitions

### Utilities (`src/utils/`)

- Date formatting
- API error handling
- Form validation
- Local storage helpers

### Custom Hooks (`src/hooks/`)

- `useJobs`: Job fetching with filters
- Reusable state management
- API integration patterns

## 🚀 Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📝 Environment Variables

Make sure to configure these environment variables:

- `DATABASE_URL`: MySQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `EMAIL_FROM`: Gmail address for sending emails
- `EMAIL_PASSWORD`: Gmail app password

## 🔄 Recent Improvements

### UI/UX Enhancements

- ✅ **Uniform dark theme** across all pages
- ✅ **Professional glassmorphism design**
- ✅ **Consistent spacing and typography**
- ✅ **Enhanced job cards** with HR information
- ✅ **Improved form styling** with better UX

### Code Organization

- ✅ **Industry-standard project structure**
- ✅ **Centralized type definitions**
- ✅ **Reusable utility functions**
- ✅ **Custom hooks for data fetching**
- ✅ **Constants for maintainability**

### Performance Optimizations

- ✅ **Custom hooks** for better state management
- ✅ **Optimized API calls** with proper error handling
- ✅ **Type-safe operations** throughout the app
- ✅ **Efficient component structure**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

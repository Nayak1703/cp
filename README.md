# Career Portal - Job Application Management System

## 🔐 Credentials

### Owner Login (HR)

- **Email**: owner123@gmail.com
- **Password**: owner123

**Note**: After hr's owner login, you have rights to create new HR users, decide their scope, and share email/password. HR users can later reset their passwords.

---

## 📋 Project Overview

A comprehensive job portal application that connects candidates with job opportunities and enables HR professionals to manage the entire recruitment process. Built with Next.js, TypeScript, and MySQL, featuring real-time job applications, resume management, and role-based access control.

## 🎯 Key Features

### For Candidates

- **Profile Management**: Complete profile creation with education, work experience, and skills
- **Resume Upload**: PDF resume upload with AWS S3 integration
- **Job Discovery**: Browse and search available job openings
- **Application Tracking**: Apply to jobs and track application status
- **Saved Jobs**: Save interesting positions for later review
- **Real-time Updates**: Instant notifications on application status changes

### For HR Professionals

- **Job Posting**: Create and manage job openings with detailed descriptions
- **Application Management**: Review, shortlist, and manage candidate applications
- **HR User Management**: Create and manage HR team members with scope-based permissions
- **Dashboard Analytics**: Overview of applications, job postings, and system metrics
- **Candidate Communication**: Direct communication with applicants

### For System Owner

- **HR Management**: Create new HR accounts with specific scopes and permissions
- **System Oversight**: Monitor overall system performance and user activities
- **Access Control**: Manage role-based permissions and user access

## 🏗️ Technical Architecture

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Hooks
- **Deployment**: Vercel

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: MySQL (AWS RDS)
- **File Storage**: AWS S3 for resume uploads
- **Authentication**: JWT with NextAuth.js
- **Deployment**: AWS EC2

### Database Schema

- **Users**: Candidate and HR user management
- **Jobs**: Job postings with detailed information
- **Applications**: Job application tracking
- **Saved Jobs**: Candidate job bookmarks
- **OTP System**: Email verification and password reset

## 🔄 Project Flow

### 1. User Registration & Authentication

```
Signup → Email Verification → Role Selection → Profile Creation → Dashboard Access
```

### 2. Candidate Journey

```
Login → Browse Jobs → Apply → Upload Resume → Track Applications → Receive Updates
```

### 3. HR Journey

```
Login → Post Jobs → Review Applications → Shortlist Candidates → Manage Team
```

### 4. Owner Journey

```
Login → Create HR Accounts → Set Permissions → Monitor System → Manage Access
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL Database
- AWS Account (for S3 and RDS)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket-name"
```

## 📱 User Interface

### Design Philosophy

- **Dark Theme**: Modern dark interface for better user experience
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: WCAG compliant with proper focus states and keyboard navigation
- **User-Friendly**: Intuitive navigation and clear call-to-action buttons

### Key Pages

- **Landing Page**: Job listings with search and filter capabilities
- **Dashboard**: Role-specific dashboards with relevant information
- **Profile Management**: Comprehensive profile creation and editing
- **Job Details**: Detailed job information with application functionality
- **Application Tracking**: Real-time application status updates

## 🔒 Security Features

- **Role-Based Access Control**: Different permissions for candidates, HR, and owners
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Comprehensive form validation and sanitization
- **CORS Protection**: Cross-origin request protection
- **File Upload Security**: File type and size validation for resume uploads

## 📊 Performance & Scalability

- **Database Optimization**: Proper indexing and query optimization
- **File Storage**: AWS S3 for scalable file storage
- **Caching**: Next.js built-in caching mechanisms
- **CDN Integration**: Vercel's global CDN for fast content delivery
- **Database Connection Pooling**: Efficient database connection management

## 🛠️ Development & Deployment

### Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Testing**: Comprehensive testing before deployment
3. **Code Review**: Peer review process for quality assurance
4. **Deployment**: Automated deployment to staging and production

### Deployment Strategy

- **Frontend**: Vercel for automatic deployments
- **Backend**: AWS EC2 with PM2 process management
- **Database**: AWS RDS for managed MySQL service
- **File Storage**: AWS S3 for scalable file storage

## 📈 Future Enhancements

- **Real-time Chat**: Direct messaging between HR and candidates
- **Video Interviews**: Integrated video calling functionality
- **Advanced Analytics**: Detailed reporting and analytics dashboard
- **Mobile App**: Native mobile application development
- **AI Integration**: Resume parsing and job matching algorithms
- **Multi-language Support**: Internationalization for global reach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a production-ready application with comprehensive features for job portal management. The system is designed to handle real-world recruitment processes with proper security, scalability, and user experience considerations.

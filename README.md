# Digital Internship & Placement Portal

A comprehensive web application for managing internships and placements for students, companies, and colleges.

## Project Overview

The Digital Internship & Placement Portal is a three-tier web application that facilitates the internship and placement process for students, companies, and colleges. It provides a platform for:

- Students to create profiles, upload resumes, and apply for internships
- Companies to post job openings and review applications
- Colleges to manage their students and track placement statistics
- Admins to oversee the entire system and generate reports

## Technology Stack

- **Frontend**: React.js with Bootstrap for responsive UI
- **Backend**: Node.js with Express.js
- **Database**: MySQL (with fallback to in-memory storage)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system for resumes and company logos

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)

### Database Setup

1. Install MySQL if you haven't already
2. Run the setup script to create the database and tables:
   ```
   setup-database.bat
   ```
   This script will:
   - Create the `internship_portal` database
   - Set up all required tables
   - Update your `.env` file with the database credentials

Alternatively, you can manually set up the database:
1. Create a database named `internship_portal`
2. Import the schema from `backend/config/database.sql`
3. Update the `.env` file with your database credentials

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

The backend server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The frontend application will run on http://localhost:3000

## Features

### User Authentication
- Registration and login for different user types (students, companies, colleges, admin)
- JWT-based authentication
- Role-based access control

### Student Features
- Create and edit profile
- Upload resume
- Browse and apply for internships
- Track application status

### Company Features
- Create and edit company profile
- Post internship opportunities
- Review applications
- Shortlist and select candidates

### College Features
- Create and edit college profile
- Add students to the college
- Track placement statistics

### Admin Features
- Approve company and college registrations
- Generate reports
- Monitor system activity

## Database Schema

The application uses a relational database with the following main tables:
- `users`: Stores user authentication information
- `student_profiles`: Student profile information
- `company_profiles`: Company profile information
- `college_profiles`: College profile information
- `internships`: Internship listings
- `applications`: Student applications for internships
- `college_students`: Mapping between colleges and students

## Fallback Mechanism

The application includes a fallback to in-memory storage if the database connection fails, ensuring that the system remains functional even when database issues occur.

## License

This project is licensed under the MIT License.

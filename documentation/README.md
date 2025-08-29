# Digital Internship & Placement Portal

A comprehensive web application that connects students, companies, and educational institutions to streamline the internship application and management process.

## Project Documentation

This directory contains the following documentation files:

- **[Project_Overview.md](./Project_Overview.md)** - Comprehensive overview of the project, its features, and architecture
- **[Tech_Stack.md](./Tech_Stack.md)** - Detailed information about the technologies used in the project
- **[ER_Diagram_Description.md](./ER_Diagram_Description.md)** - Description of the Entity-Relationship diagram
- **[ER_Diagram.txt](./ER_Diagram.txt)** - Text-based representation of the ER diagram
- **[ER_Diagram.puml](./ER_Diagram.puml)** - PlantUML file for generating a visual ER diagram
- **[Schema_Diagram.md](./Schema_Diagram.md)** - Markdown representation of the database schema
- **[Schema_Diagram.txt](./Schema_Diagram.txt)** - Text-based representation of the database schema
- **[Schema_Diagram.dbml](./Schema_Diagram.dbml)** - DBML file for generating a visual schema diagram
- **[Visual_Schema_Diagram.md](./Visual_Schema_Diagram.md)** - Mermaid-based visual representation of the database schema

## Technology Stack

### Frontend
- React.js
- Bootstrap
- React Router
- Axios
- Chart.js

### Backend
- Node.js
- Express.js
- JWT Authentication
- Multer for file uploads
- Express Validator

### Database
- Oracle 11g

## Getting Started

### Prerequisites
- Node.js (v14.17.0 or higher)
- npm (v6.14.0 or higher)
- Oracle 11g database

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   ```

2. Install frontend dependencies
   ```
   cd frontend
   npm install
   ```

3. Install backend dependencies
   ```
   cd backend
   npm install
   ```

4. Configure the database
   - Create the database schema using the SQL scripts in the `database` directory
   - Configure the database connection in `backend/.env`

5. Start the backend server
   ```
   cd backend
   npm start
   ```

6. Start the frontend development server
   ```
   cd frontend
   npm start
   ```

7. Access the application at `http://localhost:3000`

## Features

### For Students
- Profile creation and management
- Resume upload
- Internship discovery and application
- Application status tracking

### For Companies
- Company profile management
- Internship posting
- Applicant review and selection
- Analytics dashboard

### For Administrators/Colleges
- User management
- Campus drive organization
- Placement statistics and reporting

## Database Schema

The application uses a relational database with the following main tables:
- USERS - Authentication information for all user types
- STUDENTS - Detailed information about student users
- COMPANIES - Detailed information about company users
- INTERNSHIPS - Internship opportunities posted by companies
- APPLICATIONS - Student applications for internships

For detailed schema information, refer to the schema documentation files.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Oracle for the database technology
- React.js team for the frontend framework
- Node.js community for the backend runtime
- All contributors to the project

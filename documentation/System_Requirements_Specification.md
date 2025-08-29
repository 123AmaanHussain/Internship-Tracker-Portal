# System Requirements Specification (SRS)

## Digital Internship & Placement Portal

**Version:** 1.0  
**Date:** April 2, 2025  
**Status:** Final

## 1. Introduction

### 1.1 Purpose

This System Requirements Specification (SRS) document outlines the functional and non-functional requirements for the Digital Internship & Placement Portal. It serves as a comprehensive guide for the development, implementation, and evaluation of the system.

### 1.2 Scope

The Digital Internship & Placement Portal is a web-based application designed to streamline the internship and placement process for students, companies, and educational institutions. The system facilitates profile creation, internship posting, application management, and provides analytics and reporting capabilities.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term/Acronym | Definition |
|--------------|------------|
| SRS | System Requirements Specification |
| UI | User Interface |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| HTTPS | Hypertext Transfer Protocol Secure |
| DBMS | Database Management System |

### 1.4 References

1. IEEE Standard 830-1998, IEEE Recommended Practice for Software Requirements Specifications
2. Digital Internship & Placement Portal Project Overview
3. Database Schema Documentation
4. Literature Survey on Placement Management Systems

### 1.5 Overview

The remainder of this document is organized as follows:
- Section 2: Overall Description - Provides a high-level overview of the system
- Section 3: Specific Requirements - Details the functional and non-functional requirements
- Section 4: System Models - Presents the system architecture and data models
- Section 5: Appendices - Contains supplementary information

## 2. Overall Description

### 2.1 Product Perspective

The Digital Internship & Placement Portal is a standalone web application that can integrate with existing educational management systems through APIs. It consists of a three-tier architecture with a React.js frontend, Node.js/Express backend, and Oracle 11g database.

### 2.2 Product Functions

The primary functions of the system include:

1. User authentication and authorization with role-based access
2. Student profile management and resume upload
3. Company profile management and verification
4. Internship posting and management
5. Application submission and tracking
6. Search and filtering capabilities
7. Notification system
8. Analytics and reporting
9. Administrative functions for system management

### 2.3 User Classes and Characteristics

#### 2.3.1 Students

- College/university students seeking internships
- Require easy-to-use interface for profile creation and application submission
- Need tools to track application status and receive notifications
- Varying levels of technical proficiency

#### 2.3.2 Companies

- Organizations offering internship opportunities
- Need efficient tools for posting internships and managing applications
- Require access to student profiles and resumes
- May have HR personnel with varying technical skills

#### 2.3.3 College Administrators

- Staff responsible for overseeing the placement process
- Need comprehensive reporting and analytics tools
- Require capabilities to manage student and company accounts
- Typically have moderate technical proficiency

#### 2.3.4 System Administrators

- Technical personnel responsible for system maintenance
- Require access to all system functions
- High level of technical proficiency

### 2.4 Operating Environment

- **Client Environment:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server Environment:** Node.js runtime on Windows/Linux server
- **Database Environment:** Oracle 11g DBMS
- **Network:** Internet connectivity with HTTPS support

### 2.5 Design and Implementation Constraints

- The system must comply with educational data protection regulations
- The application must be responsive and accessible on various devices
- Database operations must maintain ACID properties
- The system must be developed using the specified technology stack
- Authentication must use secure methods (JWT with proper expiration)

### 2.6 User Documentation

The system will include:
- Online help documentation
- User manuals for each user role
- Video tutorials for common tasks
- Tooltips and contextual help within the application
- Administrator documentation for system management

### 2.7 Assumptions and Dependencies

- Users have access to modern web browsers
- The server has reliable internet connectivity
- Oracle 11g database is properly installed and configured
- The system has access to email services for notifications
- Users have basic computer literacy

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces

**General UI Requirements:**
- Responsive design for desktop, tablet, and mobile devices
- Consistent navigation and layout across all pages
- Accessibility compliance (WCAG 2.1 Level AA)
- Support for multiple languages (future enhancement)

**Student Interface:**
- Dashboard with application status overview
- Profile management screens
- Resume upload interface
- Internship search and filtering
- Application submission forms

**Company Interface:**
- Dashboard with applicant statistics
- Company profile management
- Internship posting and management
- Applicant review interface
- Communication tools

**Administrator Interface:**
- Dashboard with system statistics
- User management screens
- Verification workflows
- Reporting and analytics tools
- System configuration options

#### 3.1.2 Hardware Interfaces

The system does not directly interface with hardware components but requires:
- Server hardware capable of running Node.js and Oracle 11g
- Client devices with web browsers
- Network hardware for internet connectivity

#### 3.1.3 Software Interfaces

- **Database Interface:** Oracle 11g via node-oracledb driver
- **Email Service:** SMTP interface for sending notifications
- **File Storage:** Local or cloud storage for resumes and other documents
- **Authentication Service:** JWT-based authentication system

#### 3.1.4 Communications Interfaces

- **HTTP/HTTPS:** For all client-server communications
- **SMTP:** For email notifications
- **RESTful API:** For potential integration with external systems

### 3.2 Functional Requirements

#### 3.2.1 User Management

**User Registration**
- The system shall allow students to register with email verification
- The system shall allow companies to register with admin verification
- The system shall collect appropriate profile information during registration
- The system shall validate email uniqueness

**Authentication**
- The system shall authenticate users using email and password
- The system shall implement password complexity requirements
- The system shall provide password reset functionality
- The system shall maintain session management using JWT

**Authorization**
- The system shall implement role-based access control
- The system shall restrict access to features based on user roles
- The system shall prevent unauthorized access to protected resources

**Profile Management**
- The system shall allow users to update their profile information
- The system shall allow students to upload and manage resumes
- The system shall allow companies to update company details
- The system shall support profile completeness indicators

#### 3.2.2 Student Features

**Resume Management**
- The system shall allow students to upload resumes in PDF format
- The system shall support multiple resume versions
- The system shall extract basic information from uploaded resumes
- The system shall validate file types and sizes

**Internship Discovery**
- The system shall provide search functionality for internships
- The system shall support filtering by location, duration, and field
- The system shall recommend internships based on student profile
- The system shall display detailed internship information

**Application Management**
- The system shall allow students to apply for internships
- The system shall track application status
- The system shall allow students to withdraw applications
- The system shall notify students of application status changes

#### 3.2.3 Company Features

**Internship Management**
- The system shall allow companies to create internship listings
- The system shall support editing and closing internship listings
- The system shall provide templates for common internship types
- The system shall validate required internship information

**Applicant Management**
- The system shall display applicant lists for each internship
- The system shall allow filtering and sorting of applicants
- The system shall provide tools to review applicant profiles and resumes
- The system shall support status updates for applications

**Communication**
- The system shall allow companies to communicate with applicants
- The system shall support bulk actions for applicant management
- The system shall provide email templates for common communications
- The system shall track communication history

#### 3.2.4 Administrator Features

**User Management**
- The system shall allow administrators to view and manage all users
- The system shall support company verification workflows
- The system shall provide tools to disable or delete user accounts
- The system shall allow manual creation of administrator accounts

**System Management**
- The system shall provide configuration options for system parameters
- The system shall support email template customization
- The system shall allow management of system-wide announcements
- The system shall provide access to system logs

**Reporting**
- The system shall generate reports on placement statistics
- The system shall provide analytics on system usage
- The system shall support custom report generation
- The system shall allow export of reports in various formats

#### 3.2.5 Notification System

- The system shall send email notifications for important events
- The system shall provide in-application notifications
- The system shall allow users to configure notification preferences
- The system shall maintain a notification history

### 3.3 Non-Functional Requirements

#### 3.3.1 Performance Requirements

- The system shall support at least 1000 concurrent users
- Page load times shall not exceed 3 seconds under normal conditions
- Database queries shall complete within 1 second
- File uploads shall process at a minimum of 1MB per second
- The system shall handle peak loads during placement seasons

#### 3.3.2 Safety Requirements

- The system shall validate all inputs to prevent injection attacks
- The system shall implement proper error handling to prevent information leakage
- The system shall maintain audit logs for security-relevant actions
- The system shall implement rate limiting to prevent abuse

#### 3.3.3 Security Requirements

- All communications shall be encrypted using HTTPS
- Passwords shall be hashed using bcrypt with appropriate work factor
- The system shall implement CSRF protection for all forms
- The system shall follow the principle of least privilege
- The system shall implement session timeout after 30 minutes of inactivity
- The system shall log all authentication attempts

#### 3.3.4 Software Quality Attributes

**Reliability**
- The system shall have an uptime of at least 99.5%
- The system shall implement proper error handling and recovery
- The system shall maintain data integrity during failures

**Availability**
- The system shall be available 24/7 with scheduled maintenance windows
- Scheduled maintenance shall be performed during low-usage periods
- The system shall provide appropriate notifications for scheduled downtime

**Maintainability**
- The codebase shall follow consistent coding standards
- The system shall be modular to facilitate maintenance
- The system shall include comprehensive documentation

**Portability**
- The frontend shall work on all major browsers
- The backend shall be deployable on Windows and Linux servers
- The database schema shall be compatible with Oracle 11g and newer versions

**Usability**
- The user interface shall be intuitive and require minimal training
- The system shall provide helpful error messages
- The system shall include contextual help and tooltips
- The system shall support keyboard navigation for accessibility

#### 3.3.5 Business Rules

- Students can apply for multiple internships
- Students cannot apply twice for the same internship
- Companies must be verified before posting internships
- Internship listings must include essential information (title, description, duration)
- Applications cannot be submitted after the application deadline
- Administrators must approve company registrations

## 4. System Models

### 4.1 System Architecture

The Digital Internship & Placement Portal follows a three-tier architecture:

1. **Presentation Tier (Frontend)**
   - React.js components
   - Bootstrap for responsive design
   - Client-side validation
   - State management with Context API

2. **Application Tier (Backend)**
   - Node.js runtime
   - Express.js framework
   - RESTful API endpoints
   - Business logic implementation
   - Authentication and authorization

3. **Data Tier (Database)**
   - Oracle 11g database
   - Normalized schema design
   - Stored procedures for complex operations
   - Indexes for performance optimization

### 4.2 Data Model

The database schema consists of five primary entities:

1. **USERS**
   - Central authentication table for all user types
   - Contains login credentials and basic information

2. **STUDENTS**
   - Detailed student profile information
   - Links to the USERS table

3. **COMPANIES**
   - Company profile information
   - Links to the USERS table

4. **INTERNSHIPS**
   - Internship listing details
   - Posted by companies

5. **APPLICATIONS**
   - Tracks student applications for internships
   - Links students and internships

Refer to the ER Diagram and Schema Documentation for detailed information about the data model.

## 5. Appendices

### 5.1 Glossary

| Term | Definition |
|------|------------|
| Internship | A temporary position offering practical experience to students |
| Placement | The process of securing employment for students |
| Resume | A document summarizing a person's education, skills, and experience |
| Dashboard | A user interface showing key information at a glance |
| Verification | The process of confirming the authenticity of users or information |

### 5.2 Analysis Models

Refer to the separate documentation for:
- Use Case Diagrams
- Sequence Diagrams
- Activity Diagrams
- State Transition Diagrams

### 5.3 Issues List

| ID | Description | Priority | Status |
|----|-------------|----------|--------|
| 1 | Integration with existing college ERP systems | Medium | Planned for future release |
| 2 | Mobile application development | Low | Under consideration |
| 3 | Advanced analytics and reporting | High | Included in initial release |
| 4 | Multi-language support | Low | Planned for future release |
| 5 | AI-based matching algorithm | Medium | Under research |

---

*This System Requirements Specification is subject to change as the project evolves. All stakeholders will be notified of significant changes.*

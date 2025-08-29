# Digital Internship & Placement Portal - ER Diagram Description

## Overview
This document describes the Entity-Relationship (ER) diagram for the Digital Internship & Placement Portal database. The system facilitates internship applications and management between students, companies, colleges, and administrators.

## Entities

### 1. users
The users entity stores authentication information for all users of the system.

**Attributes:**
- user_id (Primary Key): Unique identifier for each user, auto-generated
- email: User's email address (unique)
- password: Hashed password for authentication
- user_type: Type of user ('student', 'company', 'college', or 'admin')
- created_at: Timestamp when the user account was created
- updated_at: Timestamp when the user account was last updated

### 2. student_profiles
The student_profiles entity stores detailed information about student users.

**Attributes:**
- profile_id (Primary Key): Unique identifier for each student profile, auto-generated
- user_id (Foreign Key): References the users table
- first_name: Student's first name
- last_name: Student's last name
- college: Name of the student's college or university
- degree: Student's degree program
- graduation_year: Expected year of graduation
- skills: Text field containing student's skills
- resume_url: URL to the student's uploaded resume
- phone: Student's contact number
- bio: Brief description or about section for the student
- created_at: Timestamp when the profile was created
- updated_at: Timestamp when the profile was last updated

### 3. company_profiles
The company_profiles entity stores detailed information about company users.

**Attributes:**
- profile_id (Primary Key): Unique identifier for each company profile, auto-generated
- user_id (Foreign Key): References the users table
- company_name: Name of the company
- industry: Industry sector the company operates in
- location: Physical location of the company
- website: Company's website URL
- description: Detailed description of the company
- logo_url: URL to the company's logo image
- approved: Boolean flag indicating if the company is approved by administrators
- created_at: Timestamp when the profile was created
- updated_at: Timestamp when the profile was last updated

### 4. college_profiles
The college_profiles entity stores detailed information about college users.

**Attributes:**
- profile_id (Primary Key): Unique identifier for each college profile, auto-generated
- user_id (Foreign Key): References the users table
- college_name: Name of the college or university
- location: Physical location of the college
- website: College's website URL
- description: Detailed description of the college
- contact_email: Contact email for the college
- contact_phone: Contact phone number for the college
- approved: Boolean flag indicating if the college is approved by administrators
- created_at: Timestamp when the profile was created
- updated_at: Timestamp when the profile was last updated

### 5. internships
The internships entity stores information about internship opportunities posted by companies.

**Attributes:**
- internship_id (Primary Key): Unique identifier for each internship, auto-generated
- company_id (Foreign Key): References the company_profiles table
- title: Title of the internship position
- description: Detailed description of the internship
- requirements: Specific requirements for applicants
- location: Location where the internship will take place
- stipend: Compensation offered for the internship
- duration: Duration of the internship
- application_deadline: Deadline for submitting applications
- status: Current status of the internship ('open', 'closed', or 'filled')
- created_at: Timestamp when the internship was created
- updated_at: Timestamp when the internship was last updated

### 6. applications
The applications entity tracks student applications for internships.

**Attributes:**
- application_id (Primary Key): Unique identifier for each application, auto-generated
- student_id (Foreign Key): References the student_profiles table
- internship_id (Foreign Key): References the internships table
- status: Current status of the application ('pending', 'shortlisted', 'rejected', or 'selected')
- application_date: Timestamp when the application was submitted
- updated_at: Timestamp when the application was last updated

### 7. college_students
The college_students entity tracks relationships between colleges and their students.

**Attributes:**
- id (Primary Key): Unique identifier for each college-student relationship, auto-generated
- college_id (Foreign Key): References the college_profiles table
- student_id (Foreign Key): References the student_profiles table
- verification_status: Status of the student verification ('pending', 'verified', or 'rejected')
- added_at: Timestamp when the relationship was created
- updated_at: Timestamp when the relationship was last updated

## Relationships

1. **user-student_profile Relationship (1:1)**
   - A user can be associated with at most one student profile
   - A student profile is associated with exactly one user
   - Relationship is enforced by the FOREIGN KEY constraint in the student_profiles table

2. **user-company_profile Relationship (1:1)**
   - A user can be associated with at most one company profile
   - A company profile is associated with exactly one user
   - Relationship is enforced by the FOREIGN KEY constraint in the company_profiles table

3. **user-college_profile Relationship (1:1)**
   - A user can be associated with at most one college profile
   - A college profile is associated with exactly one user
   - Relationship is enforced by the FOREIGN KEY constraint in the college_profiles table

4. **company_profile-internship Relationship (1:N)**
   - A company can post multiple internships
   - An internship is posted by exactly one company
   - Relationship is enforced by the FOREIGN KEY constraint in the internships table

5. **student_profile-application Relationship (1:N)**
   - A student can submit multiple applications
   - An application is submitted by exactly one student
   - Relationship is enforced by the FOREIGN KEY constraint in the applications table

6. **internship-application Relationship (1:N)**
   - An internship can receive multiple applications
   - An application is for exactly one internship
   - Relationship is enforced by the FOREIGN KEY constraint in the applications table

7. **college_profile-college_student Relationship (1:N)**
   - A college can track multiple students
   - A college-student relationship is associated with exactly one college
   - Relationship is enforced by the FOREIGN KEY constraint in the college_students table

8. **student_profile-college_student Relationship (1:N)**
   - A student can be associated with multiple colleges
   - A college-student relationship is associated with exactly one student
   - Relationship is enforced by the FOREIGN KEY constraint in the college_students table

9. **college_profile-student_profile Relationship (M:N)**
   - A college can have multiple students
   - A student can be associated with multiple colleges
   - This many-to-many relationship is implemented through the college_students table

10. **student_profile-internship Relationship (M:N)**
    - A student can apply to multiple internships
    - An internship can receive applications from multiple students
    - This many-to-many relationship is implemented through the applications table

## Constraints

1. **Primary Keys**: Each entity has a unique identifier
2. **Foreign Keys**: Maintain referential integrity between related tables
3. **Unique Constraints**: Prevent duplicate entries (e.g., email addresses)
4. **Check Constraints**: Ensure data validity (e.g., user types, application statuses, verification statuses)
5. **Cascade Delete**: When a user is deleted, associated profiles are also deleted
6. **Unique Application**: A student can apply to a specific internship only once (enforced by the unique constraint on student_id and internship_id in the applications table)
7. **Unique College-Student Relationship**: A student can be associated with a specific college only once (enforced by the unique constraint on college_id and student_id in the college_students table)

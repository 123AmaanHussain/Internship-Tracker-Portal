# Digital Internship & Placement Portal - Visual Schema Diagram

## Database Schema

```mermaid
erDiagram
    users ||--o{ student_profiles : "has"
    users ||--o{ company_profiles : "has"
    users ||--o{ college_profiles : "has"
    company_profiles ||--o{ internships : "posts"
    student_profiles ||--o{ applications : "submits"
    internships ||--o{ applications : "receives"
    college_profiles ||--o{ college_students : "tracks"
    student_profiles ||--o{ college_students : "belongs_to"

    users {
        int user_id PK
        varchar(255) email UK
        varchar(255) password
        enum user_type
        timestamp created_at
        timestamp updated_at
    }

    student_profiles {
        int profile_id PK
        int user_id FK
        varchar(100) first_name
        varchar(100) last_name
        varchar(255) college
        varchar(100) degree
        int graduation_year
        text skills
        varchar(20) phone
        text bio
        varchar(255) resume_url
        timestamp created_at
        timestamp updated_at
    }

    company_profiles {
        int profile_id PK
        int user_id FK
        varchar(255) company_name
        varchar(100) industry
        varchar(255) website
        varchar(255) location
        text description
        varchar(255) logo_url
        boolean approved
        timestamp created_at
        timestamp updated_at
    }

    college_profiles {
        int profile_id PK
        int user_id FK
        varchar(255) college_name
        varchar(255) location
        varchar(255) website
        text description
        varchar(255) contact_email
        varchar(20) contact_phone
        boolean approved
        timestamp created_at
        timestamp updated_at
    }

    internships {
        int internship_id PK
        int company_id FK
        varchar(255) title
        text description
        text requirements
        varchar(255) location
        varchar(100) stipend
        varchar(100) duration
        date application_deadline
        enum status
        timestamp created_at
        timestamp updated_at
    }

    applications {
        int application_id PK
        int student_id FK
        int internship_id FK
        enum status
        timestamp application_date
        timestamp updated_at
    }

    college_students {
        int id PK
        int college_id FK
        int student_id FK
        enum verification_status
        timestamp added_at
        timestamp updated_at
    }
```

## Table Constraints

### users
- Primary Key: user_id (auto-increment)
- Unique Key: email
- Check Constraint: user_type in ('student', 'company', 'college', 'admin')

### student_profiles
- Primary Key: profile_id (auto-increment)
- Foreign Key: user_id references users.user_id (cascade delete)

### company_profiles
- Primary Key: profile_id (auto-increment)
- Foreign Key: user_id references users.user_id (cascade delete)

### college_profiles
- Primary Key: profile_id (auto-increment)
- Foreign Key: user_id references users.user_id (cascade delete)

### internships
- Primary Key: internship_id (auto-increment)
- Foreign Key: company_id references company_profiles.profile_id (cascade delete)
- Check Constraint: status in ('open', 'closed', 'filled')

### applications
- Primary Key: application_id (auto-increment)
- Foreign Key: student_id references student_profiles.profile_id (cascade delete)
- Foreign Key: internship_id references internships.internship_id (cascade delete)
- Unique Constraint: (internship_id, student_id)
- Check Constraint: status in ('pending', 'shortlisted', 'rejected', 'selected')

### college_students
- Primary Key: id (auto-increment)
- Foreign Key: college_id references college_profiles.profile_id (cascade delete)
- Foreign Key: student_id references student_profiles.profile_id (cascade delete)
- Unique Constraint: (college_id, student_id)
- Check Constraint: verification_status in ('pending', 'verified', 'rejected')

---

*Note: This diagram uses Mermaid ER diagram syntax and can be rendered in compatible Markdown viewers or converted to an image using Mermaid tools.*

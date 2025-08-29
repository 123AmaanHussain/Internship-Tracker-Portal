# Database Schema Diagram

## Tables and Relationships

```
+----------------------------------+
|              USERS              |
+----------------------------------+
| USER_ID NUMBER PK (IDENTITY)    |
| EMAIL VARCHAR2(100) UNIQUE NN   |
| PASSWORD VARCHAR2(100) NN       |
| USER_TYPE VARCHAR2(20) NN       |
| CREATED_AT TIMESTAMP            |
+----------------------------------+
                |
                |
        +-------+-------+
        |               |
        |               |
+----------------------------------+    +----------------------------------+
|            STUDENTS             |    |            COMPANIES             |
+----------------------------------+    +----------------------------------+
| STUDENT_ID NUMBER PK (IDENTITY) |    | COMPANY_ID NUMBER PK (IDENTITY)  |
| USER_ID NUMBER FK NN            |    | USER_ID NUMBER FK NN             |
| FIRST_NAME VARCHAR2(50) NN      |    | COMPANY_NAME VARCHAR2(100) NN    |
| LAST_NAME VARCHAR2(50) NN       |    | INDUSTRY VARCHAR2(100)           |
| COLLEGE VARCHAR2(100)           |    | LOCATION VARCHAR2(100)           |
| DEGREE VARCHAR2(50)             |    | WEBSITE VARCHAR2(255)            |
| GRADUATION_YEAR NUMBER(4)       |    | DESCRIPTION VARCHAR2(1000)       |
| SKILLS VARCHAR2(500)            |    | LOGO_URL VARCHAR2(255)           |
| RESUME_URL VARCHAR2(255)        |    | APPROVED NUMBER(1) DEFAULT 0     |
| PHONE VARCHAR2(15)              |    +----------------------------------+
| BIO VARCHAR2(1000)              |                  |
+----------------------------------+                  |
        |                                             |
        |                                             |
        |                                    +----------------------------------+
        |                                    |          INTERNSHIPS            |
        |                                    +----------------------------------+
        |                                    | INTERNSHIP_ID NUMBER PK (IDENT)  |
        |                                    | COMPANY_ID NUMBER FK NN          |
        |                                    | TITLE VARCHAR2(100) NN           |
        |                                    | DESCRIPTION VARCHAR2(2000) NN    |
        |                                    | REQUIREMENTS VARCHAR2(1000)      |
        |                                    | LOCATION VARCHAR2(100)           |
        |                                    | TYPE VARCHAR2(20)                |
        |                                    | DURATION VARCHAR2(50)            |
        |                                    | STIPEND VARCHAR2(50)             |
        |                                    | APPLICATION_DEADLINE DATE        |
        |                                    | POSTED_DATE TIMESTAMP            |
        |                                    | STATUS VARCHAR2(20) DEFAULT 'open'|
        |                                    +----------------------------------+
        |                                                  |
        |                                                  |
+----------------------------------+                       |
|          APPLICATIONS           |                        |
+----------------------------------+                       |
| APPLICATION_ID NUMBER PK (IDENT)|                        |
| STUDENT_ID NUMBER FK NN         |------------------------+
| INTERNSHIP_ID NUMBER FK NN      |
| APPLY_DATE TIMESTAMP            |
| STATUS VARCHAR2(20)             |
| COVER_LETTER VARCHAR2(2000)     |
| LAST_UPDATED TIMESTAMP          |
+----------------------------------+
```

## Legend

- **PK**: Primary Key
- **FK**: Foreign Key
- **NN**: Not Null
- **IDENTITY**: Auto-incrementing column

## Constraints

1. **Check Constraints**:
   - USER_TYPE CHECK (USER_TYPE IN ('student', 'company', 'admin'))
   - INTERNSHIP TYPE CHECK (TYPE IN ('remote', 'onsite', 'hybrid'))
   - INTERNSHIP STATUS CHECK (STATUS IN ('open', 'closed'))
   - APPLICATION STATUS CHECK (STATUS IN ('applied', 'shortlisted', 'interview', 'selected', 'rejected'))

2. **Unique Constraints**:
   - EMAIL in USERS table
   - (STUDENT_ID, INTERNSHIP_ID) pair in APPLICATIONS table

3. **Referential Integrity**:
   - STUDENTS.USER_ID references USERS.USER_ID
   - COMPANIES.USER_ID references USERS.USER_ID
   - INTERNSHIPS.COMPANY_ID references COMPANIES.COMPANY_ID
   - APPLICATIONS.STUDENT_ID references STUDENTS.STUDENT_ID
   - APPLICATIONS.INTERNSHIP_ID references INTERNSHIPS.INTERNSHIP_ID

4. **Cascading Actions**:
   - ON DELETE CASCADE for all foreign key relationships with USERS

## Sequences

- USER_SEQ
- STUDENT_SEQ
- COMPANY_SEQ
- INTERNSHIP_SEQ
- APPLICATION_SEQ

## Data Flow

1. Users register and are stored in the USERS table with appropriate user type
2. Based on user type, profiles are created in either STUDENTS or COMPANIES tables
3. Companies can post multiple internships in the INTERNSHIPS table
4. Students can apply to internships, creating records in the APPLICATIONS table
5. Applications track the status of each student's application to an internship

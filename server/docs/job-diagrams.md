# Job Management System Specifications

## 1. Class Diagram

```mermaid
classDiagram
    class JobController {
        +createJob(jobData)
        +getJob(jobId)
        +getAllJobs()
        +updateJob(jobId, jobData)
        +expireJob(jobId)
        +deleteJob(jobId)
    }

    class JobModel {
        +company: ObjectId
        +category: ObjectId
        +title: String
        +description: String
        +experienceYears: Number
        +location: String
        +salary: Number
        +status: String
        +date: Date
        +endDate: Date
        +startDate: Date
        +applicantCount: Number
        +state: String
        +applications: Array
        +questions: Array
        +favouritedBy: Array
    }

    class CompanyProfile {
        +_id: ObjectId
        +companyName: String
        +description: String
        +location: String
    }

    class Category {
        +_id: ObjectId
        +name: String
        +description: String
    }

    class Application {
        +_id: ObjectId
        +jobId: ObjectId
        +userId: ObjectId
        +status: String
    }

    class Question {
        +_id: ObjectId
        +jobId: ObjectId
        +content: String
    }

    JobController --> JobModel : manages
    JobModel --> CompanyProfile : belongs to
    JobModel --> Category : belongs to
    JobModel --> Application : has many
    JobModel --> Question : has many
```

## 2. API Specifications

### JobController
- **Responsibilities:**
  - Handle job CRUD operations
  - Manage job status and applications
  - Process job-related requests
- **Methods:**
  - `createJob(jobData)`: Create new job posting
  - `getJob(jobId)`: Retrieve job details
  - `getAllJobs()`: List all active jobs
  - `updateJob(jobId, jobData)`: Modify job information
  - `expireJob(jobId)`: Mark job as expired
  - `deleteJob(jobId)`: Remove job posting

### JobModel
- **Properties:**
  - `company`: Company reference
  - `category`: Job category
  - `title`: Job title
  - `description`: Job description
  - `experienceYears`: Required experience
  - `location`: Job location
  - `salary`: Salary range
  - `status`: Job status
  - `date`: Posting date
  - `endDate`: Application deadline
  - `startDate`: Job start date
  - `applicantCount`: Number of applicants
  - `state`: Job state
  - `applications`: List of applications
  - `questions`: Job-related questions
  - `favouritedBy`: Users who saved the job

## 3. API Endpoints

### Create Job
- **Method:** POST
- **Endpoint:** `/api/jobs`
- **Description:** Create a new job posting
- **Request Body:** Job details
- **Response:** Created job object

### View Job
- **Method:** GET
- **Endpoint:** `/api/jobs/:id`
- **Description:** Get job details by ID
- **Response:** Job information

### Edit Job
- **Method:** PUT
- **Endpoint:** `/api/jobs/:id`
- **Description:** Update job information
- **Request Body:** Updated job details
- **Response:** Updated job object

### Expire Job
- **Method:** PUT
- **Endpoint:** `/api/jobs/:id/expire`
- **Description:** Mark job as expired
- **Response:** Updated job status

### List Jobs
- **Method:** GET
- **Endpoint:** `/api/jobs`
- **Description:** Get all active jobs
- **Query Parameters:** 
  - `category`: Filter by category
  - `location`: Filter by location
  - `status`: Filter by status
- **Response:** List of jobs

## 4. Sequence Diagrams

### Create Job
```mermaid
sequenceDiagram
    actor Employer
    participant UI as Frontend UI
    participant API as API Endpoint
    participant Controller as JobController
    participant Model as JobModel
    participant DB as MongoDB

    Employer->>UI: Fill job form
    UI->>API: POST /api/jobs
    Note over UI,API: Send job data
    
    API->>Controller: createJob(jobData)
    Controller->>Model: Create new job
    Model->>DB: Save job
    DB-->>Model: Return saved job
    Model-->>Controller: Return job object
    Controller-->>API: Return success response
    API-->>UI: Show success message
    UI-->>Employer: Display new job
```

### View Job
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend UI
    participant API as API Endpoint
    participant Controller as JobController
    participant Model as JobModel
    participant DB as MongoDB

    User->>UI: Click on job
    UI->>API: GET /api/jobs/:id
    
    API->>Controller: getJob(jobId)
    Controller->>Model: Find job
    Model->>DB: Query job
    DB-->>Model: Return job data
    Model-->>Controller: Return job object
    Controller-->>API: Return job data
    API-->>UI: Display job details
    UI-->>User: Show job information
```

### Edit Job
```mermaid
sequenceDiagram
    actor Employer
    participant UI as Frontend UI
    participant API as API Endpoint
    participant Controller as JobController
    participant Model as JobModel
    participant DB as MongoDB

    Employer->>UI: Click edit job
    UI->>API: GET /api/jobs/:id
    API-->>UI: Return job data
    UI-->>Employer: Show edit form
    
    Employer->>UI: Update job details
    UI->>API: PUT /api/jobs/:id
    Note over UI,API: Send updated data
    
    API->>Controller: updateJob(jobId, jobData)
    Controller->>Model: Update job
    Model->>DB: Update job
    DB-->>Model: Confirm update
    Model-->>Controller: Return updated job
    Controller-->>API: Return success response
    API-->>UI: Show success message
    UI-->>Employer: Display updated job
```

### Expire Job
```mermaid
sequenceDiagram
    actor Employer
    participant UI as Frontend UI
    participant API as API Endpoint
    participant Controller as JobController
    participant Model as JobModel
    participant DB as MongoDB

    Employer->>UI: Click expire job
    UI->>API: PUT /api/jobs/:id/expire
    
    API->>Controller: expireJob(jobId)
    Controller->>Model: Update job status
    Model->>DB: Update job
    DB-->>Model: Confirm update
    Model-->>Controller: Return updated job
    Controller-->>API: Return success response
    API-->>UI: Show success message
    UI-->>Employer: Display expired status
```

### Notes:
1. **Create Job:**
   - Employer tạo job mới
   - Hệ thống validate dữ liệu
   - Lưu job vào database

2. **View Job:**
   - User xem chi tiết job
   - Hệ thống lấy thông tin từ database
   - Hiển thị đầy đủ thông tin job

3. **Edit Job:**
   - Employer chỉnh sửa job
   - Hệ thống validate dữ liệu mới
   - Cập nhật thông tin trong database

4. **Expire Job:**
   - Employer đánh dấu job hết hạn
   - Hệ thống cập nhật trạng thái
   - Job không còn hiển thị trong danh sách active 
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend UI
    participant API as API Endpoint
    participant Auth as Auth Middleware
    participant Controller as Auth Controller
    participant Model as User Model
    participant DB as MongoDB
    participant Email as Email Service
    participant OTP as OTP Service

    User->>UI: Click "Forgot Password"
    Note over User,UI: Navigate to forgot password page
    
    User->>UI: Enter email
    UI->>API: POST /api/auth/forgot-password
    Note over UI,API: Send email address
    
    API->>Auth: Validate request
    Auth->>Controller: Pass to forgot password handler
    
    Controller->>Model: Check email exists
    Model->>DB: Query user collection
    DB-->>Model: Return user data
    Model-->>Controller: Return user object
    
    Controller->>OTP: Generate OTP
    OTP->>Email: Send OTP via email
    Email-->>User: Receive OTP email
    
    Controller-->>API: Return pending status
    API-->>UI: Show OTP input form
    
    User->>UI: Enter OTP
    UI->>API: POST /api/auth/verify-reset-otp
    Note over UI,API: Send OTP & email
    
    API->>Controller: Verify OTP
    Controller->>OTP: Validate OTP
    OTP-->>Controller: OTP validation result
    
    Controller-->>API: Return OTP valid status
    API-->>UI: Show new password form
    
    User->>UI: Enter new password
    UI->>API: POST /api/auth/reset-password
    Note over UI,API: Send new password & email
    
    API->>Controller: Reset password handler
    Controller->>Model: Update user password
    Model->>DB: Update user in collection
    DB-->>Model: Confirm update
    Model-->>Controller: Return updated user
    
    Controller->>Controller: Generate JWT token
    
    Controller-->>Auth: Return token & user data
    Auth-->>API: Add token to response
    API-->>UI: Return success response with token
    
    UI-->>User: Show password reset success message
    Note over UI: Store token in localStorage
    Note over UI: Update UI state (logged in)
``` 
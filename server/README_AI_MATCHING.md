# AI Matching System Documentation

## Overview

Hệ thống AI Matching sử dụng **Groq API** và **LlamaIndex** để tính toán độ phù hợp giữa CV của ứng viên và yêu cầu công việc. Hệ thống cung cấp điểm số từ 0-100 và phân tích chi tiết để giúp nhà tuyển dụng tìm ra top 5 ứng viên phù hợp nhất.

## Features

### 🤖 AI Analysis
- **Match Score**: Điểm từ 0-100 dựa trên độ phù hợp tổng thể
- **Skills Matching**: So khớp kỹ năng required vs có sẵn
- **Experience Analysis**: Đánh giá kinh nghiệm làm việc
- **Education Evaluation**: Phân tích background học vấn
- **Overall Recommendation**: Gợi ý từ AI (highly_recommended, recommended, consider, not_recommended)

### 📊 For Employers
- **Batch Analysis**: Phân tích hàng loạt tất cả ứng viên cho 1 job
- **Top 5 Candidates**: Xếp hạng và hiển thị top ứng viên
- **Analytics Dashboard**: Thống kê tổng quan về chất lượng ứng viên
- **Detailed Reports**: Báo cáo chi tiết từng ứng viên

### 🔄 Automatic Processing
- Tự động phân tích khi user apply job
- Fallback scoring nếu AI service fail
- Background processing không block user experience

## API Endpoints

### 1. Analyze Single Application
```http
POST /api/ai-matching/applications/:applicationId/analyze
```

**Description**: Tính AI match score cho 1 application cụ thể

**Permissions**: Application owner, Employer, Admin

**Response**:
```json
{
  "status": true,
  "code": 200,
  "message": "AI match score calculated successfully",
  "result": {
    "applicationId": "...",
    "aiAnalysis": {
      "matchScore": 85,
      "explanation": "Strong candidate with excellent skill alignment...",
      "skillsMatch": {
        "matched": ["JavaScript", "React", "Node.js"],
        "missing": ["Python"],
        "additional": ["AWS", "Docker"]
      },
      "experienceMatch": {
        "score": 90,
        "explanation": "5+ years experience exceeds 3 year requirement"
      },
      "educationMatch": {
        "score": 80,
        "explanation": "CS degree aligns well with technical role"
      },
      "overallRecommendation": "highly_recommended"
    }
  }
}
```

### 2. Batch Analyze Job Applications
```http
POST /api/ai-matching/jobs/:jobId/batch-analyze
```

**Description**: Phân tích hàng loạt tất cả applications cho 1 job

**Permissions**: Employer, Admin

**Body**:
```json
{
  "forceReanalyze": false
}
```

**Response**:
```json
{
  "status": true,
  "code": 200,
  "message": "Batch analysis completed. 15/20 applications analyzed",
  "result": {
    "jobId": "...",
    "jobTitle": "Senior Backend Developer",
    "totalApplications": 20,
    "analyzedApplications": 15,
    "results": [
      {
        "applicationId": "...",
        "candidateName": "John Doe",
        "matchScore": 92,
        "recommendation": "highly_recommended",
        "status": "success"
      }
    ]
  }
}
```

### 3. Get Top 5 Candidates
```http
GET /api/ai-matching/jobs/:jobId/top-candidates?limit=5&includeDetails=true
```

**Description**: Lấy top candidates đã được xếp hạng theo AI score

**Permissions**: Employer, Admin

**Response**:
```json
{
  "status": true,
  "code": 200,
  "message": "Top candidates retrieved successfully",
  "result": {
    "jobId": "...",
    "jobTitle": "Senior Backend Developer",
    "topCandidates": [
      {
        "applicationId": "...",
        "userId": "...",
        "matchScore": 92,
        "recommendation": "highly_recommended",
        "keyStrengths": [
          "High overall match",
          "Strong skill alignment",
          "Relevant experience"
        ],
        "concerns": [],
        "summary": "Excellent candidate with strong alignment to job requirements",
        "candidateDetails": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "...",
          "city": "HCMC",
          "applicationDate": "2024-01-15",
          "status": "pending"
        }
      }
    ],
    "totalAnalyzed": 15
  }
}
```

### 4. Get Application Analysis
```http
GET /api/ai-matching/applications/:applicationId/analysis
```

**Description**: Xem chi tiết AI analysis của 1 application

**Permissions**: Application owner, Employer, Admin

### 5. Get Job Analytics Summary
```http
GET /api/ai-matching/jobs/:jobId/analytics
```

**Description**: Thống kê tổng quan AI analysis cho 1 job (dashboard)

**Permissions**: Employer, Admin

**Response**:
```json
{
  "status": true,
  "result": {
    "jobId": "...",
    "totalApplications": 25,
    "analyzedApplications": 20,
    "averageMatchScore": 67,
    "scoreDistribution": {
      "excellent": 3,  // 80-100
      "good": 8,       // 60-79  
      "average": 7,    // 40-59
      "poor": 2        // 0-39
    },
    "recommendationBreakdown": {
      "highly_recommended": 3,
      "recommended": 8,
      "consider": 7,
      "not_recommended": 2
    }
  }
}
```

## Technical Implementation

### 1. AI Service Architecture
```
User Apply → Background AI Analysis → Store Results → Employer Dashboard
```

### 2. Technology Stack
- **Groq API**: Main LLM for analysis (LLaMA 3.1 70B)
- **LlamaIndex**: Document processing and vector search
- **Fallback System**: Rule-based scoring nếu AI fail

### 3. Data Flow
1. User applies to job
2. System triggers background AI analysis
3. AI service analyzes CV vs Job requirements
4. Results stored in Application.aiAnalysis
5. Employer can view ranked candidates

### 4. Database Schema
```javascript
// Application Model - Added fields
aiAnalysis: {
  matchScore: Number,        // 0-100
  explanation: String,       // AI explanation
  skillsMatch: {
    matched: [String],       // Matching skills
    missing: [String],       // Missing required skills  
    additional: [String]     // Extra valuable skills
  },
  experienceMatch: {
    score: Number,           // Experience relevance score
    explanation: String
  },
  educationMatch: {
    score: Number,           // Education relevance score
    explanation: String
  },
  overallRecommendation: String, // highly_recommended|recommended|consider|not_recommended
  analyzedAt: Date,
  aiModel: String           // llama-3.1-70b-versatile|fallback
}
```

## Setup Instructions

### 1. Environment Variables
```env
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here
GROQ_BASE_URL=https://api.groq.com/openai/v1

# Optional Fallback
OPENAI_API_KEY=your_openai_key_here
```

### 2. Install Dependencies
```bash
npm install llamaindex openai axios
```

### 3. Groq API Key Setup
1. Đăng ký tài khoản tại [console.groq.com](https://console.groq.com)
2. Tạo API key
3. Thêm vào `.env` file

## Usage Examples

### Frontend Integration Example
```javascript
// Analyze single application
const analyzeApplication = async (applicationId) => {
  const response = await fetch(`/api/ai-matching/applications/${applicationId}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  return result;
};

// Get top candidates for employer dashboard
const getTopCandidates = async (jobId) => {
  const response = await fetch(`/api/ai-matching/jobs/${jobId}/top-candidates?includeDetails=true`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  return result.result.topCandidates;
};

// Batch analyze all applications
const batchAnalyze = async (jobId) => {
  const response = await fetch(`/api/ai-matching/jobs/${jobId}/batch-analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ forceReanalyze: false })
  });
  
  return await response.json();
};
```

## Performance & Limitations

### Performance
- **Groq's Ultra-Fast Inference**: Groq hardware provides extremely fast LLM inference
- Background processing không block user experience
- Batch processing với delays để tránh rate limiting
- Fallback system đảm bảo luôn có kết quả

### Rate Limiting
- Groq có rate limit cao hơn so với các provider khác
- Xử lý tối đa 5 applications/batch để tránh timeout
- Delay 1s giữa các batches
- Retry logic cho network errors

### Limitations
- Phụ thuộc vào chất lượng Groq API
- Cần CV có đủ thông tin để phân tích chính xác
- Cost thấp hơn so với OpenAI nhờ Groq's efficiency

## Model Information

### Groq LLaMA 3.1 70B Versatile
- **Speed**: Extremely fast inference (10-100x faster than traditional cloud providers)
- **Quality**: High-quality analysis with 70B parameter model
- **Cost**: Very competitive pricing
- **Context**: Large context window for comprehensive analysis
- **Reliability**: High availability and consistent performance

## Troubleshooting

### Common Issues
1. **AI Analysis Failed**: Hệ thống sẽ dùng fallback scoring
2. **Rate Limiting**: Groq có limit cao nhưng vẫn cần handle gracefully
3. **Missing CV Data**: Yêu cầu user hoàn thiện CV trước khi apply

### Monitoring
- Check application logs cho AI service errors
- Monitor match score distributions
- Track fallback usage rates
- Monitor Groq API response times (should be very fast)

## Why Groq?

### Advantages over other providers:
- ⚡ **Ultra-fast inference**: 10-100x faster than traditional cloud LLM providers
- 💰 **Cost-effective**: Competitive pricing with excellent performance
- 🎯 **High quality**: LLaMA 3.1 70B provides excellent analysis quality
- 🔄 **Reliable**: High uptime and consistent performance
- 📈 **Scalable**: Can handle high throughput for batch processing

---

**Note**: Hệ thống này được thiết kế để scale và có thể dễ dàng thay đổi AI provider (từ Groq sang OpenAI, Claude, etc.) bằng cách update AIMatchingService class. 
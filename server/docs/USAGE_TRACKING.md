# Usage Tracking & Subscription Enforcement System

Hệ thống theo dõi và kiểm soát việc sử dụng dựa trên subscription của người dùng.

## Tổng quan

Hệ thống này cung cấp:
- **Theo dõi chi tiết** mọi hành động của người dùng
- **Kiểm soát giới hạn** dựa trên gói subscription
- **Báo cáo analytics** chi tiết
- **Thống kê sử dụng** theo thời gian thực

## Cấu trúc hệ thống

### 1. Models

#### UsageLog Model
```javascript
// Lưu trữ mọi hành động của người dùng
{
  userId: ObjectId,
  subscriptionId: ObjectId,
  action: String, // 'job_application', 'add_favorite', 'job_posting', etc.
  actionDetails: {
    jobId: ObjectId,
    companyId: ObjectId,
    // ... chi tiết khác
  },
  status: String, // 'success', 'failed', 'blocked', 'limit_reached'
  limitInfo: {
    currentUsage: Number,
    limit: Number,
    remaining: Number,
    isUnlimited: Boolean
  },
  subscriptionTier: String,
  timestamp: Date
}
```

### 2. Services

#### UsageTracker Service
```javascript
// Theo dõi và kiểm soát hành động
await UsageTracker.trackAction(userId, action, actionDetails, req);

// Kiểm tra giới hạn mà không tracking
await UsageTracker.checkActionLimit(user, subscription, action, billingPeriod);

// Lấy thống kê sử dụng
await UsageTracker.getUserUsageStats(userId, startDate, endDate);
```

### 3. Middleware

#### Tự động theo dõi hành động
```javascript
import { trackUsage, checkLimit, requirePremiumFeatures } from '../middlewares/usageMiddleware.js';

// Theo dõi và chặn nếu vượt giới hạn
router.post('/apply', trackUsage('job_application'), applyForJob);

// Chỉ kiểm tra giới hạn
router.get('/check', checkLimit('job_application'), checkHandler);

// Yêu cầu tính năng premium
router.get('/analytics', requirePremiumFeatures.seeJobViewers, getAnalytics);
```

## Cấu hình giới hạn theo gói

### Free Tier
```javascript
{
  job_application: { limit: 5, isUnlimited: false },
  add_favorite: { limit: 10, isUnlimited: false },
  job_posting: { limit: 0, isUnlimited: false },
  profile_view: { limit: 20, isUnlimited: false },
  cv_download: { limit: 3, isUnlimited: false }
}
```

### Basic Plan
```javascript
{
  job_application: { limit: 20, isUnlimited: false },
  add_favorite: { limit: 50, isUnlimited: false },
  job_posting: { limit: 5, isUnlimited: false },
  // ... thêm tính năng
}
```

### Premium Plan
```javascript
{
  job_application: { limit: -1, isUnlimited: true },
  add_favorite: { limit: -1, isUnlimited: true },
  job_posting: { limit: 20, isUnlimited: false },
  // ... tất cả tính năng cao cấp
}
```

### Enterprise Plan
```javascript
{
  // Tất cả unlimited
  job_application: { limit: -1, isUnlimited: true },
  job_posting: { limit: -1, isUnlimited: true },
  // ... không giới hạn
}
```

## API Endpoints

### User Usage Endpoints

#### GET /api/usage/stats
Lấy thống kê sử dụng của user hiện tại
```json
{
  "status": true,
  "result": {
    "period": { "start": "2024-01-01", "end": "2024-01-31" },
    "subscriptionTier": "free",
    "actionLimits": {
      "job_application": {
        "used": 3,
        "limit": 5,
        "remaining": 2,
        "isUnlimited": false,
        "percentage": 60
      }
    },
    "summary": {
      "totalActions": 15,
      "successfulActions": 12,
      "blockedActions": 3
    }
  }
}
```

#### GET /api/usage/check/:action
Kiểm tra xem có thể thực hiện hành động không
```json
{
  "status": true,
  "result": {
    "action": "job_application",
    "allowed": true,
    "limitInfo": {
      "currentUsage": 3,
      "limit": 5,
      "remaining": 2
    }
  }
}
```

#### GET /api/usage/history
Lịch sử hành động với pagination
```json
{
  "status": true,
  "result": {
    "logs": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

### Admin Endpoints

#### GET /api/usage/admin/analytics
Thống kê tổng quan hệ thống (chỉ admin)

#### POST /api/usage/admin/reset/:userId
Reset usage của user (chỉ admin)

## Cách sử dụng trong Controllers

### Cách cũ (Manual)
```javascript
const applyForJob = async (req, res) => {
  const user = await User.findById(req.user._id);
  const isPremium = await user.isPremiumUser();
  
  if (!isPremium && !user.canApplyToJobFree()) {
    return res.status(403).json({
      message: 'Limit reached'
    });
  }
  
  // Apply logic...
  await user.incrementJobApplication();
};
```

### Cách mới (Automatic)
```javascript
const applyForJob = async (req, res) => {
  // Usage tracking được thực hiện tự động bởi middleware
  // Nếu vượt giới hạn, middleware sẽ tự động trả về lỗi
  
  // Chỉ cần viết business logic
  const job = await Job.findById(req.params.id);
  job.applications.push({
    user: req.user._id,
    cv: req.body.cv
  });
  await job.save();
  
  return res.json({ success: true });
};

// Sử dụng trong routes
router.post('/:id/apply', 
  verifyAccessToken,
  trackUsage('job_application', (req) => ({ jobId: req.params.id })),
  applyForJob
);
```

## Scripts và Automation

### Reset Monthly Usage
```bash
# Reset usage hàng tháng
node scripts/usageReset.js reset

# Sync lại thống kê từ dữ liệu thực
node scripts/usageReset.js sync

# Tạo báo cáo usage
node scripts/usageReset.js report
```

### Cron Job Setup
```bash
# Thêm vào crontab để chạy tự động
# Reset usage vào ngày 1 hàng tháng lúc 00:00
0 0 1 * * cd /path/to/project && node scripts/usageReset.js reset

# Sync usage hàng tuần
0 0 * * 0 cd /path/to/project && node scripts/usageReset.js sync
```

## Frontend Integration

### React Component
```jsx
import UsageStats from '../components/common/UsageStats';

const Dashboard = () => {
  return (
    <div>
      <UsageStats 
        showDetailed={true}
        onUpgradeClick={() => navigate('/packages')}
      />
    </div>
  );
};
```

### Check Permission Before Action
```javascript
const handleApply = async () => {
  // Kiểm tra trước khi thực hiện
  const response = await fetch('/api/usage/check/job_application');
  const { result } = await response.json();
  
  if (!result.allowed) {
    setShowUpgradeModal(true);
    return;
  }
  
  // Tiếp tục apply
  await applyToJob();
};
```

## Monitoring và Analytics

### Database Indexes
```javascript
// Đã được tạo sẵn để tối ưu performance
UsageLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
UsageLogSchema.index({ subscriptionTier: 1, action: 1 });
UsageLogSchema.index({ timestamp: -1, status: 1 });
```

### Performance Considerations
- Logs cũ (>6 tháng) được tự động xóa
- Indexes được tối ưu cho queries thường dùng
- Background logging không làm chậm response

## Error Handling

### Limit Reached Response
```json
{
  "status": false,
  "code": 403,
  "message": "job_application limit reached for free plan",
  "result": {
    "action": "job_application",
    "currentUsage": 5,
    "limit": 5,
    "remaining": 0,
    "upgradeRequired": true,
    "currentTier": "free"
  }
}
```

### Feature Not Available Response
```json
{
  "status": false,
  "code": 403,
  "message": "This feature requires a premium subscription",
  "result": {
    "requiredFeature": "canSeeJobViewers",
    "currentTier": "basic",
    "upgradeRequired": true
  }
}
```

## Best Practices

### 1. Controller Implementation
- Sử dụng middleware để tracking thay vì manual
- Kiểm tra permissions ở route level
- Log errors nhưng không block request nếu tracking fails

### 2. Frontend Implementation
- Hiển thị usage stats prominently
- Warn users khi gần limit
- Provide upgrade path rõ ràng

### 3. Performance
- Sử dụng background logging khi có thể
- Cache subscription data
- Optimize database queries với indexes

### 4. Monitoring
- Track system-wide usage patterns
- Monitor blocked actions để optimize limits
- Regular cleanup của old logs

## Troubleshooting

### Common Issues

#### 1. Usage not being tracked
```javascript
// Kiểm tra middleware đã được add chưa
router.post('/apply', trackUsage('job_application'), controller);

// Kiểm tra user authentication
if (!req.user || !req.user._id) {
  // Tracking chỉ hoạt động với authenticated users
}
```

#### 2. Limits not being enforced
```javascript
// Đảm bảo UsageTracker.trackAction được gọi
const result = await UsageTracker.trackAction(userId, action, details, req);
if (!result.success) {
  return res.status(403).json(result);
}
```

#### 3. Performance issues
```javascript
// Sử dụng background logging
import { logUsage } from '../middlewares/usageMiddleware.js';
router.get('/jobs', logUsage('job_view'), getJobs);
```

## Migration Guide

Để migrate từ hệ thống cũ:

1. **Install new models**
   ```bash
   # Models đã được tạo sẵn
   ```

2. **Update controllers**
   ```javascript
   // Thay thế manual checks bằng middleware
   // Xem examples ở trên
   ```

3. **Sync existing data**
   ```bash
   node scripts/usageReset.js sync
   ```

4. **Update frontend**
   ```jsx
   // Import và sử dụng UsageStats component
   ```

Hệ thống này cung cấp foundation hoàn chỉnh cho việc quản lý subscription và usage tracking trong ứng dụng của bạn. 
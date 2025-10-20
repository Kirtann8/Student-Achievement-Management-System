# MongoDB Queries Reference for Viva
## Student Achievement Management System

### 🎯 Quick Reference for Interview Questions

---

## 📋 Table of Contents
1. [User Authentication Queries](#user-authentication-queries)
2. [Achievement CRUD Queries](#achievement-crud-queries)
3. [Analytics Aggregation Queries](#analytics-aggregation-queries)
4. [File Management Queries](#file-management-queries)
5. [Security & Performance Queries](#security--performance-queries)

---

## 👤 User Authentication Queries

### Q1: How do you check if a user already exists during registration?

**Location**: `controllers/authController.js:12`
```javascript
// Check for existing user before registration
const exists = await User.findOne({ email });
if (exists) return res.status(400).json({ message: 'Email already registered' });

// ✅ Uses email index for O(1) lookup
// ✅ Prevents duplicate registrations
// ✅ Returns boolean check
```

### Q2: How do you create a new user in MongoDB?

**Location**: `controllers/authController.js:14`
```javascript
// Create new user with validation
const user = await User.create({ name, email, password });

// ✅ Triggers pre-save hook for password hashing
// ✅ Schema validation applied automatically
// ✅ Returns created document with _id
```

### Q3: How do you authenticate a user during login?

**Location**: `controllers/authController.js:26`
```javascript
// Find user by email for authentication
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ message: 'Invalid credentials' });

// Verify password using bcrypt
const match = await user.comparePassword(password);
if (!match) return res.status(400).json({ message: 'Invalid credentials' });

// ✅ Uses indexed email field
// ✅ Includes password for comparison
// ✅ Secure credential validation
```

### Q4: How do you validate JWT tokens and get user data?

**Location**: `middleware/authMiddleware.js:10`
```javascript
// Validate JWT and get user (excluding password)
const user = await User.findById(decoded.id).select('-password');
if (!user) return res.status(401).json({ message: 'Invalid token' });

// ✅ Primary key lookup - fastest query
// ✅ Excludes password for security
// ✅ Used on every authenticated request
```

---

## 🏆 Achievement CRUD Queries

### Q5: How do you create a new achievement submission?

**Location**: `controllers/achievementController.js:18`
```javascript
// Student creates new achievement
const achievement = await Achievement.create({
  student: req.user._id,
  title,
  category,
  description,
  date,
  filePath: `/uploads/${req.file.filename}`,
  fileOriginalName: req.file.originalname
});

// ✅ Auto-sets status to 'Pending'
// ✅ Links to authenticated user
// ✅ Includes file upload handling
```

### Q6: How do you get a student's own achievements?

**Location**: `controllers/achievementController.js:31`
```javascript
// Get user's achievements (newest first)
const items = await Achievement.find({ student: req.user._id })
                              .sort({ createdAt: -1 });

// ✅ Uses student index for efficient filtering
// ✅ Sorts by creation date (newest first)  
// ✅ Only returns user's own data
```

### Q7: How do you securely update an achievement?

**Location**: `controllers/achievementController.js:37`
```javascript
// Find achievement with ownership verification
const achievement = await Achievement.findOne({ 
  _id: id, 
  student: req.user._id 
});
if (!achievement) return res.status(404).json({ message: 'Not found' });

// Update fields
if (title !== undefined) achievement.title = title;
if (category !== undefined) achievement.category = category;

// Reset status on edit
achievement.status = 'Pending';
achievement.reviewerComment = '';
await achievement.save();

// ✅ Ownership verification in query
// ✅ Prevents unauthorized edits
// ✅ Resets status for re-review
```

### Q8: How do you delete an achievement with ownership check?

**Location**: `controllers/achievementController.js:61`
```javascript
// Delete with ownership verification
const achievement = await Achievement.findOneAndDelete({ 
  _id: id, 
  student: req.user._id 
});
if (!achievement) return res.status(404).json({ message: 'Not found' });

// ✅ Atomic find and delete operation
// ✅ Built-in ownership verification
// ✅ Returns deleted document or null
```

### Q9: How does admin get all achievements with student details?

**Location**: `controllers/achievementController.js:73`
```javascript
// Admin dashboard with filtering and population
const { category, status } = req.query;
const filter = {};
if (category) filter.category = category;
if (status) filter.status = status;

const items = await Achievement.find(filter)
  .populate('student', 'name email')
  .sort({ createdAt: -1 });

// ✅ Dynamic filtering by category/status
// ✅ Population joins with User collection
// ✅ Returns student name and email
// ✅ Sorted by newest first
```

### Q10: How do admins review (approve/reject) achievements?

**Location**: `controllers/achievementController.js:80-86`
```javascript
// Admin reviews achievement
const achievement = await Achievement.findById(id);
if (!achievement) return res.status(404).json({ message: 'Not found' });

// Update based on action
if (action === 'approve') achievement.status = 'Approved';
else if (action === 'reject') achievement.status = 'Rejected';

achievement.reviewerComment = comment || '';
await achievement.save();

// ✅ Primary key lookup for speed
// ✅ Status workflow management  
// ✅ Admin comments stored
```

---

## 📊 Analytics Aggregation Queries

### Q11: How do you get category-wise achievement count?

**Location**: `controllers/achievementController.js:92-95`
```javascript
// Category distribution for pie chart
Achievement.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $project: { category: '$_id', count: 1, _id: 0 } }
]);

// Output: [{ category: 'Academic', count: 5 }, { category: 'Sports', count: 3 }]
// ✅ Groups by category field
// ✅ Counts documents in each group
// ✅ Reshapes output for frontend
```

### Q12: How do you get status-wise achievement count?

**Location**: `controllers/achievementController.js:96-99`
```javascript
// Status distribution for bar chart  
Achievement.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $project: { status: '$_id', count: 1, _id: 0 } }
]);

// Output: [{ status: 'Pending', count: 2 }, { status: 'Approved', count: 8 }]
// ✅ Groups by status field
// ✅ Provides approval/rejection analytics
// ✅ Used for admin dashboard metrics
```

### Q13: How do you get monthly submission trends?

**Location**: `controllers/achievementController.js:100-105`
```javascript
// Monthly trends for line chart
Achievement.aggregate([
  { 
    $group: { 
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { _id: 1 } },
  { $project: { month: '$_id', count: 1, _id: 0 } }
]);

// Output: [{ month: '2025-09', count: 12 }, { month: '2025-10', count: 15 }]
// ✅ Extracts year-month from createdAt
// ✅ Sorts chronologically  
// ✅ Time-series data for trends
```

### Q14: How do you execute multiple aggregations efficiently?

**Location**: `controllers/achievementController.js:91`
```javascript
// Parallel execution for analytics dashboard
const [byCategory, byStatus, monthly] = await Promise.all([
  // Category aggregation
  Achievement.aggregate([...]),
  // Status aggregation  
  Achievement.aggregate([...]),
  // Monthly aggregation
  Achievement.aggregate([...])
]);

res.json({ byCategory, byStatus, monthly });

// ✅ Runs all aggregations concurrently
// ✅ Reduces total response time
// ✅ Efficient resource utilization
```

---

## 🔒 Security & Performance Queries

### Q15: How do you ensure users can only access their own data?

**Pattern used throughout the application:**
```javascript
// Always include ownership in query
const userAchievements = await Achievement.find({ student: req.user._id });

// For updates/deletes, verify ownership
const achievement = await Achievement.findOne({ 
  _id: achievementId, 
  student: req.user._id 
});

// ✅ Prevents unauthorized data access
// ✅ Security built into query level
// ✅ No additional checks needed
```

### Q16: How do you handle password security?

**Location**: `models/User.js:14`
```javascript
// Pre-save middleware for password hashing
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ✅ Automatic password encryption
// ✅ Salt rounds = 10 for security
// ✅ Never stores plain text passwords
```

### Q17: What indexes are used for performance optimization?

**Schema definitions with indexes:**
```javascript
// User model indexes
email: { type: String, unique: true, lowercase: true, index: true }

// Achievement model indexes  
student: { type: ObjectId, ref: 'User', index: true }
status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], index: true }

// ✅ Email index for O(1) user lookups
// ✅ Student index for user filtering  
// ✅ Status index for admin filtering
```

---

## 🎯 Common Viva Questions & Answers

### Q18: What is the difference between `findOne()` and `findById()`?

```javascript
// findById() - for primary key lookup (fastest)
const user = await User.findById(userId);

// findOne() - for custom field lookup  
const user = await User.findOne({ email: userEmail });

// ✅ findById uses _id index (O(1))
// ✅ findOne can use any indexed field
// ✅ Both return single document or null
```

### Q19: How do you handle validation in MongoDB queries?

```javascript
// Schema-level validation
category: { 
  type: String, 
  enum: ['Academic', 'Sports', 'Extracurricular'], 
  required: true 
}

// Custom validation in controller
const { title, category } = req.body;
if (!title || !category) {
  return res.status(400).json({ message: 'Required fields missing' });
}

// ✅ Schema validates data types and constraints
// ✅ Controller validates business logic
// ✅ Prevents invalid data in database
```

### Q20: How do you use populate() for joining collections?

```javascript
// Basic population
await Achievement.find().populate('student', 'name email');

// Population with conditions
await Achievement.find().populate({
  path: 'student',
  select: 'name email role',
  match: { role: 'student' }
});

// ✅ Replaces ObjectId with actual document
// ✅ Select specific fields to reduce data
// ✅ Similar to SQL JOIN operation
```

---

## 📈 Performance Optimization Questions

### Q21: How do you optimize query performance?

```javascript
// Use indexes for filtering
await Achievement.find({ student: userId }); // Uses student index

// Use projection to limit fields
await User.findById(id).select('name email'); // Excludes password

// Use lean queries for read-only data
await Achievement.find(filter).lean(); // Returns plain objects

// ✅ Indexes reduce query time
// ✅ Projection reduces network overhead
// ✅ Lean queries skip Mongoose overhead
```

### Q22: How do you handle large datasets?

```javascript
// Pagination (future enhancement)
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

await Achievement.find(filter)
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

// ✅ Limits memory usage
// ✅ Improves response time
// ✅ Better user experience
```

---

## 🔧 Error Handling Questions

### Q23: How do you handle MongoDB errors?

```javascript
try {
  const result = await User.create(userData);
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error (email already exists)
    return res.status(400).json({ message: 'Email already registered' });
  }
  if (error.name === 'ValidationError') {
    // Schema validation failed
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ errors });
  }
  // Other database errors
  res.status(500).json({ message: 'Database error' });
}

// ✅ Specific error handling for different cases
// ✅ User-friendly error messages
// ✅ Proper HTTP status codes
```

---

## 💡 Key Points for Viva

1. **Always use indexes** for frequently queried fields
2. **Include ownership checks** in queries for security
3. **Use aggregation pipelines** for complex analytics
4. **Handle errors gracefully** with specific error types
5. **Optimize with projection** and lean queries
6. **Use Promise.all()** for parallel operations
7. **Validate data** at both schema and controller level
8. **Never store plain text passwords**
9. **Use population** instead of manual joins
10. **Monitor query performance** and optimize accordingly

---

*This reference covers all MongoDB queries used in the Student Achievement Management System. Each query includes location, purpose, and optimization notes for comprehensive understanding during viva voce.*
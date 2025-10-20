# MongoDB Queries Cheat Sheet - Viva Quick Reference

## 🚀 Must-Know Queries for Viva

### 1️⃣ User Authentication Queries

```javascript
// Check if user exists (Registration)
const exists = await User.findOne({ email });

// Create new user  
const user = await User.create({ name, email, password });

// Login authentication
const user = await User.findOne({ email });

// JWT token validation
const user = await User.findById(decoded.id).select('-password');
```

### 2️⃣ Achievement CRUD Queries

```javascript
// Create achievement
const achievement = await Achievement.create({
  student: req.user._id,
  title, category, description, date,
  filePath: `/uploads/${req.file.filename}`
});

// Get user's achievements
const items = await Achievement.find({ student: req.user._id })
                              .sort({ createdAt: -1 });

// Update with ownership check
const achievement = await Achievement.findOne({ 
  _id: id, student: req.user._id 
});

// Delete with ownership check
const achievement = await Achievement.findOneAndDelete({ 
  _id: id, student: req.user._id 
});

// Admin get all with population
const items = await Achievement.find(filter)
  .populate('student', 'name email')
  .sort({ createdAt: -1 });
```

### 3️⃣ Analytics Aggregation Queries

```javascript
// Category distribution
Achievement.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $project: { category: '$_id', count: 1, _id: 0 } }
]);

// Status distribution  
Achievement.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $project: { status: '$_id', count: 1, _id: 0 } }
]);

// Monthly trends
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

// Parallel execution
const [byCategory, byStatus, monthly] = await Promise.all([...]);
```

## 🎯 Top 10 Viva Questions & Answers

### Q1: How do you prevent duplicate user registration?
**A**: `const exists = await User.findOne({ email });` - Uses email index for O(1) lookup

### Q2: How do you ensure data security in queries?
**A**: Always include ownership: `{ _id: id, student: req.user._id }` in queries

### Q3: What's the difference between findOne() and findById()?
**A**: `findById()` uses _id index (fastest), `findOne()` uses any indexed field

### Q4: How do you optimize query performance?
**A**: Use indexes, projection (`select()`), and lean queries for read-only data

### Q5: How do you handle password security?
**A**: Pre-save middleware with bcrypt: `bcrypt.hash(password, 10)`

### Q6: How do you join collections in MongoDB?
**A**: Use populate: `.populate('student', 'name email')`

### Q7: How do you get analytics data efficiently?
**A**: Aggregation pipelines with `$group`, `$project`, and parallel execution

### Q8: How do you handle file uploads in queries?
**A**: Store file path: `filePath: /uploads/${req.file.filename}`

### Q9: How do you implement role-based access?
**A**: Middleware checks: `req.user.role` and ownership verification in queries

### Q10: How do you handle database errors?
**A**: Try-catch with specific error handling for duplicate keys and validation

## 🔥 Performance Tips

- **Indexes**: email (unique), student, status
- **Security**: Always verify ownership in queries  
- **Optimization**: Use `select()`, `lean()`, `Promise.all()`
- **Validation**: Schema + controller level
- **Aggregation**: Group, project, sort for analytics

## 📊 Schema Quick Reference

```javascript
// User Schema
{
  name: String (required),
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  role: enum ['student', 'admin']
}

// Achievement Schema  
{
  student: ObjectId (ref: User, indexed),
  title: String (required),
  category: enum ['Academic', 'Sports', 'Extracurricular'],
  status: enum ['Pending', 'Approved', 'Rejected'] (indexed),
  filePath: String,
  createdAt: Date
}
```

## ⚡ Quick Commands

```javascript
// Find operations
.findOne({ field: value })
.findById(id)
.find(filter).sort().limit()

// Create/Update operations  
.create(data)
.save()
.findOneAndUpdate()

// Advanced operations
.populate('field', 'select')
.aggregate([pipeline])
.select('field1 field2')
.lean()
```

---

**💡 Remember**: Always explain the **purpose**, **performance**, and **security** aspects of each query during viva!
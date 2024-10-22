const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: Replace with your MongoDB connection string
mongoose.set('strictQuery', false); // Add this line to address the deprecation warning

mongoose.connect('mongodb://mongo:27017/smemory', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Add a timeout
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err);
});

// User model update
const User = mongoose.model('User', {
  username: String,
  password: String,
  isLinked: { type: Boolean, default: false },
  sqlUsername: String,
  isAdmin: { type: Boolean, default: false }
});

// Performance model
const Performance = mongoose.model('Performance', {
  userId: mongoose.Schema.Types.ObjectId,
  date: Date,
  score: Number
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body.username ? req.body : req.query;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, 'your-secret-key', async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    next();
  });
};

// Submit performance data
app.post('/api/performance', verifyToken, async (req, res) => {
  try {
    const { score } = req.body;
    const performance = new Performance({
      userId: req.user._id,
      date: new Date(),
      score: score
    });
    await performance.save();
    res.status(201).json({ message: 'Performance data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving performance data', error: error.message });
  }
});

// Get performance data
app.get('/api/performance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isLinked) {
      return res.status(403).json({ message: 'User not linked to SQL database' });
    }
    // TODO: Replace with actual SQL query using user.sqlUsername
    const performances = [
      { date: new Date(), score: 95 },
      { date: new Date(Date.now() - 86400000), score: 88 },
      // ... more mock data
    ];
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching performance data', error: error.message });
  }
});

// Check user link status
app.get('/api/user/status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ isLinked: user.isLinked });
  } catch (error) {
    res.status(500).json({ message: 'Error checking user status', error: error.message });
  }
});

// Admin: Get all users
app.get('/api/admin/users', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const users = await User.find({}, 'username isLinked');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Admin: Get SQL users (mock endpoint, replace with actual SQL query)
app.get('/api/admin/sql-users', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  res.json([
    { id: 1, username: 'sqluser1' },
    { id: 2, username: 'sqluser2' },
    // ... more users
  ]);
});

// Admin: Link user
app.post('/api/admin/link-user', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { userId, sqlUsername } = req.body;
    await User.findByIdAndUpdate(userId, { isLinked: true, sqlUsername });
    res.json({ message: 'User linked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error linking user', error: error.message });
  }
});

// Add this near your other endpoints
app.post('/api/create-admin', async (req, res) => {
  const { username, password, secretKey } = req.body.username ? req.body : req.query;
  
  // Check if the secret key is correct
  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ message: 'Invalid secret key' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({
      username,
      password: hashedPassword,
      isAdmin: true
    });
    await adminUser.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error: error.message });
  }
});

// Admin: Delete user
app.delete('/api/admin/users/:userId', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Admin: Edit user
app.put('/api/admin/users/:userId', verifyToken, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  try {
    const { userId } = req.params;
    const { username, isLinked, sqlUsername } = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, 
      { username, isLinked, sqlUsername },
      { new: true, runValidators: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Route placeholder (will add actual routes later)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});


// Render signup page
app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
});

// Handle signup logic
app.post('/signup', async (req, res) => {
  const { mbti, gender, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { message: '⚠️ Email already registered.' });
    }

    const newUser = new User({ mbti, gender, email, password });
    await newUser.save();

    res.send('✅ Account created successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Server error.');
  }
});

// POST signup logic
app.post('/signup', async (req, res) => {
  const { mbti, gender, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { message: '⚠️ Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ mbti, gender, email, password: hashed });
    await newUser.save();

    res.send('✅ Signup successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Server error');
  }
});
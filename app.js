const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});
// Sign In Page
app.get('/signin', (req, res) => {
  res.render('signin', { message: null });
});

// Contact Page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Game Catalog Page (placeholder)
app.get('/games', (req, res) => {
  const sampleGames = [
    { title: 'Zelda', mbti: 'INFP' },
    { title: 'Fortnite', mbti: 'ESTP' }
  ];
  res.render('games', { games: sampleGames });
});

// MBTI Recommendation Form Page
app.get('/recommend', (req, res) => {
  res.render('recommend', { result: null });
});

app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
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

// Sign In Logic (to be implemented)
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.render('signin', { message: '⚠️ Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.render('signin', { message: '⚠️ Wrong password' });

  res.send('✅ Login successful!');
});

// Contact form handler (optional)
app.post('/contact', (req, res) => {
  console.log(req.body); // You can save to DB later
  res.send('✅ Message sent!');
});

// MBTI Recommendation Logic (simple example)
app.post('/recommend', (req, res) => {
  const { mbti } = req.body;

  const recommendations = {
    INFP: 'Journey',
    ESTP: 'Call of Duty',
    INTJ: 'The Witness',
    ESFP: 'Just Dance',
  };

  const result = recommendations[mbti] || 'Try Animal Crossing!';
  res.render('recommend', { result });
});

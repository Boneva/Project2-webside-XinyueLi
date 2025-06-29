const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const session = require('express-session');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'your-secret-key', // make sure this is strong in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));


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
    { title: 'The Legend of Zelda: Breath of the Wild', mbti: 'INFP', image: '/images/zelda.jpg', desc: 'Explore a vast open world full of wonder and magic.' },
    { title: 'Call of Duty: Warzone', mbti: 'ESTP', image: '/images/warzone.jpg', desc: 'Fast-paced action shooter for tactical thrill seekers.' },
    { title: 'Stardew Valley', mbti: 'ISFP', image: '/images/stardew.jpg', desc: 'Relaxed farming game full of charm and choice.' },
    { title: 'League of Legends', mbti: 'ENTJ', image: '/images/lol.jpg', desc: 'Strategic competitive MOBA with deep teamplay.' },
    { title: 'The Sims 4', mbti: 'ESFP', image: '/images/sims.jpg', desc: 'Creative life simulation full of fun and style.' },
    { title: 'Dark Souls III', mbti: 'ISTP', image: '/images/darksouls.jpg', desc: 'Challenging combat and rich dark fantasy.' },
    { title: 'Civilization VI', mbti: 'INTJ', image: '/images/civ6.jpg', desc: 'Rule an empire through strategy and science.' },
    { title: 'Among Us', mbti: 'ENFP', image: '/images/amongus.jpg', desc: 'Social deduction and fun with friends.' },
    { title: 'Animal Crossing: New Horizons', mbti: 'ISFJ', image: '/images/animalcrossing.jpg', desc: 'Chill life sim full of cute characters and peace.' },
    { title: 'Overwatch 2', mbti: 'ENFJ', image: '/images/overwatch.jpg', desc: 'Team shooter with hero roles and energy.' },
    { title: 'Minecraft', mbti: 'ISTJ', image: '/images/minecraft.jpg', desc: 'Endless creativity and survival fun.' },
    { title: 'Firewatch', mbti: 'INFJ', image: '/images/firewatch.jpg', desc: 'Emotional narrative and beautiful nature visuals.' },
    { title: 'Fortnite', mbti: 'ESTP', image: '/images/fortnite.jpg', desc: 'Build, battle, and explore in a vibrant world.' },
    { title: 'Portal 2', mbti: 'INTP', image: '/images/portal.jpg', desc: 'Mind-bending puzzles and brilliant humor.' },
    { title: 'Mass Effect', mbti: 'ENTP', image: '/images/masseffect.jpg', desc: 'Sci-fi RPG with choice-driven story and action.' },
    { title: 'Final Fantasy XIV', mbti: 'ESFJ', image: '/images/ffxiv.jpg', desc: 'MMORPG full of epic quests and camaraderie.' }
  ];

  res.render('games', { games: sampleGames });
});



app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
});


// POST signup logic
app.post('/signup', async (req, res) => {
  const { mbti, gender, email, password, birthday } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { message: '⚠️ Email already registered.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ mbti, gender, birthday, email, password: hashed });
    await newUser.save();

    req.session.user = newUser;
    req.session.success = '✅ Signup successful! Welcome!';
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('❌ Server error');
  }
});


app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render('signin', { message: '⚠️ Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render('signin', { message: '⚠️ Wrong password' });
  }

  // Save user data in session
  req.session.user = {
    email: user.email,
    mbti: user.mbti,
    gender: user.gender,
  };

  // Redirect to profile
  res.redirect('/profile');
});

// GET Profile Page
app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/signin');
  }
  res.render('profile', { user: req.session.user });
});

// POST MBTI recommendation
app.post('/profile', (req, res) => {
  const { mbti } = req.body;

  const recommendations = {
    INFP: 'Journey',
    ESTP: 'Call of Duty',
    INTJ: 'The Witness',
    ESFP: 'Just Dance',
    ENFP: 'Among Us',
    ENTJ: 'League of Legends',
    INFJ: 'Firewatch',
    ISFP: 'Stardew Valley',
    ENFJ: 'Overwatch 2',
    ISTP: 'Dark Souls III',
    ISFJ: 'Animal Crossing: New Horizons',
    ISTJ: 'Minecraft',
    INTP: 'Portal 2',
    ESFJ: 'Final Fantasy XIV',
    ESTJ: 'StarCraft II',
    ENTJ: 'Civilization VI'
  };

  const result = recommendations[mbti] || 'Try Animal Crossing!';

  if (!req.session.user) {
    return res.redirect('/signin');
  }

  res.render('profile', {
    user: req.session.user,
    result
  });
});


// Contact form handler (optional)
app.post('/contact', (req, res) => {
  console.log(req.body); // You can save to DB later
  res.send('✅ Message sent!');
});

app.get('/signout', (req, res) => {
  req.session.destroy(() => {
    res.render('signout');
  });
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});


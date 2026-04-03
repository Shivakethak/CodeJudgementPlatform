require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedProblems = require('./data/seeder');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const userRoutes = require('./routes/users');
const challengeRoutes = require('./routes/challenges');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to DB
connectDB().then(() => {
  console.log('DB Connection successful');
});

// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK', service: 'backend' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/challenges', challengeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});

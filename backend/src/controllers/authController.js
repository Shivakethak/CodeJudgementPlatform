const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const uid = id && typeof id.toString === 'function' ? id.toString() : String(id);
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: uid }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const authPayload = (user, token) => ({
  _id: user._id,
  email: user.email,
  displayName: user.displayName || (user.email ? String(user.email).split('@')[0] : ''),
  tagline: user.tagline || '',
  token,
  isPremiumStatus: !!user.isPremiumStatus,
  tokens: user.tokens ?? 0,
  streakDays: user.streak?.count ?? 0,
});

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const local = String(email).split('@')[0] || 'coder';
    const user = await User.create({
      email,
      password: hashedPassword,
      displayName: local.slice(0, 80),
      tagline: ''
    });

    if (user) {
      res.status(201).json(authPayload(user, generateToken(user._id)));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json(authPayload(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

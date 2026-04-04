const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const normalizeUser = (decoded) => {
  const id = decoded.id ?? decoded._id ?? decoded.sub ?? decoded.userId;
  return { ...decoded, id: id != null ? String(id) : undefined };
};

const protect = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: 'Server misconfigured: JWT_SECRET is not set' });
  }
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'undefined') {
        return res.status(401).json({ message: 'Not authorized, no token' });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = normalizeUser(decoded);
      if (!req.user.id) {
        return res.status(401).json({ message: 'Not authorized, invalid token payload' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // We can also allow anonymous run for some endpoints, but let's strictly require auth for submissions
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalAuth = (req, res, next) => {
  let token;
  if (!JWT_SECRET) return next();
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token === 'undefined') return next();
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = normalizeUser(decoded);
    } catch (error) {
      // ignore
    }
  }
  next();
};

module.exports = { protect, optionalAuth };

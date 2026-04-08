const jwt = require('jsonwebtoken');
const User = require('../models/User');

const attachUser = async (req, res, next, required = true) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      if (!required) {
        next();
        return;
      }

      res.status(401).json({ error: 'Authentication token is required.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'studentai_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ error: 'Invalid token.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed.' });
  }
};

const auth = (req, res, next) => attachUser(req, res, next, true);

const optionalAuth = (req, res, next) => attachUser(req, res, next, false);

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
};

const authorizeAdminLike = authorize('admin', 'faculty');

const isAdminLike = (role) => ['admin', 'faculty'].includes(role);

module.exports = { auth, optionalAuth, authorize, authorizeAdminLike, isAdminLike };


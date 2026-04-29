const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/customErrors');

exports.protect = async (req, res, next) => {
  let token;
  // Check header (CLI) or Cookies (Web)
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) return next(new AppError('Authentication required', 401));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id, role, github_id
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Permission denied', 403));
    }
    next();
  };
};
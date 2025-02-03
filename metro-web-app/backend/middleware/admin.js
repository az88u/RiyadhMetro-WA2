// backend/middleware/admin.js

module.exports = function (req, res, next) {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
  };
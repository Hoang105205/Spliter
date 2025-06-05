function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Bạn cần đăng nhập!" });
}
module.exports = ensureAuthenticated;
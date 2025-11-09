const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

/**
 * Sign a new token for a given user object.  Only username and role are encoded.
 */
function signToken(user) {
  return jwt.sign({ username: user.username, role: user.role, id: user.id }, JWT_SECRET, {
    expiresIn: '12h',
  });
}

/**
 * Middleware to verify JWT and attach user to request.  Assumes Express-style
 * signature `(req, res, next)`; if invalid, responds with 401.
 */
function requireAuth(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/Bearer /i, '');
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = { signToken, requireAuth };
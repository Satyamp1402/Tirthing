import jwt from 'jsonwebtoken';

/**
 * Authentication middleware — validates the JWT from the httpOnly cookie.
 *
 * Previously this read the token from the Authorization header (Bearer scheme).
 * Now it reads from req.cookies.token, which is set by the auth controller
 * and sent automatically by the browser on every request.
 *
 * The cookie approach is more secure because:
 *   - httpOnly cookies are invisible to JavaScript (XSS-proof)
 *   - The frontend never handles the raw token
 *   - The browser manages cookie lifecycle automatically
 */
export const requireAuth = (req, res, next) => {
  try {
    // Read JWT from the httpOnly cookie (set by login/signup)
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

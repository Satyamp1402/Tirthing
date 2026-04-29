// ============================================================================
// Auth Controller — Login, Signup, Me, Logout
// ============================================================================
//
// WHY COOKIES INSTEAD OF LOCALSTORAGE:
// localStorage tokens are readable by any JavaScript on the page, making them
// vulnerable to XSS attacks — a single injected script can steal the token
// and impersonate the user. httpOnly cookies are invisible to JavaScript
// entirely — the browser sends them automatically, but no script can read,
// modify, or exfiltrate them. This is the industry standard for JWT auth.
// ============================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';


// ─── COOKIE CONFIGURATION ───────────────────────────────────────────────────
// Shared settings for the auth cookie across login/signup/logout.
// httpOnly: true    → JS cannot access the cookie (XSS protection)
// secure: true      → Cookie only sent over HTTPS (production safety)
// sameSite: 'none'  → Allows cross-origin requests (frontend on Vercel, backend on Render)
// maxAge: 7 days    → Matches JWT expiry so they expire together

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/'
};


/**
 * Generates a JWT for the given user and sets it as an httpOnly cookie.
 * Also returns the user object in the response body (without the token —
 * the frontend never needs to see or store the raw JWT).
 *
 * @param {Object} user - Mongoose user document
 * @param {number} statusCode - HTTP status (201 for signup, 200 for login)
 * @param {Object} res - Express response object
 */
const sendTokenCookie = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Set the JWT as an httpOnly cookie — the browser will send it
  // automatically on every subsequent request to this origin
  res.cookie('token', token, COOKIE_OPTIONS);

  res.status(statusCode).json({
    message: statusCode === 201 ? 'User created successfully' : 'Login successful',
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};


/**
 * POST /api/auth/signup
 * Creates a new user account and sets the auth cookie.
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await newUser.save();
    sendTokenCookie(newUser, 201, res);

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};


/**
 * POST /api/auth/login
 * Validates credentials and sets the auth cookie.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    sendTokenCookie(user, 200, res);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};


/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * The frontend calls this on every page load to check if the cookie
 * is still valid — this replaces the old localStorage.getItem('user') pattern.
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware (from the cookie JWT)
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


/**
 * POST /api/auth/logout
 * Clears the auth cookie by setting it to an empty value with immediate expiry.
 */
export const logout = (req, res) => {
  res.cookie('token', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.status(200).json({ message: 'Logged out successfully' });
};

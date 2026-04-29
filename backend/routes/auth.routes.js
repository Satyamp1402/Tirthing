import express from 'express';
import { signup, login, getMe, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// /me requires an active cookie — the middleware validates it
router.get('/me', requireAuth, getMe);

// Logout clears the httpOnly cookie server-side
router.post('/logout', logout);

export default router;

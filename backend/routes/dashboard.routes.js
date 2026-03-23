import express from 'express';
import { getUserDashboardData, getAdminDashboard } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/user', requireAuth, getUserDashboardData);

router.get('/admin', requireAuth, requireAdmin, getAdminDashboard);

export default router;
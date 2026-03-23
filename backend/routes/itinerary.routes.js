import express from 'express';
import { generateItinerary, getMyItineraries } from '../controllers/itinerary.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/generate', requireAuth, generateItinerary);
router.get('/my', requireAuth, getMyItineraries);

export default router;

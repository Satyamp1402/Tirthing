import express from 'express';
import { generateItinerary, getMyItineraries, getItineraryById, deleteItinerary } from '../controllers/itinerary.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/generate', requireAuth, generateItinerary);
router.get('/my', requireAuth, getMyItineraries);
router.get('/:id', requireAuth, getItineraryById);
router.delete('/:id', requireAuth, deleteItinerary);
export default router;

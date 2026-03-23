import express from 'express';
import { addPlace, getAllPlaces, deletePlace, updatePlace, getPlaceById } from '../controllers/place.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/add', requireAuth, requireAdmin, addPlace);
router.get('/all', getAllPlaces);
router.get('/:id', getPlaceById);

router.put('/:id', requireAuth, requireAdmin, updatePlace);

router.delete('/:id', requireAuth, requireAdmin, deletePlace);

export default router;
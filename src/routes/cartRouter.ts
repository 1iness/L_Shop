import { Router } from 'express';
import { addToCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/add', requireAuth, addToCart);

export default router;
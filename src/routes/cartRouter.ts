import { Router } from 'express';
import { addToCart, getCart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/add', requireAuth, addToCart);
router.get('/', requireAuth, getCart);
router.post('/increase', requireAuth, increaseQuantity);
router.post('/decrease', requireAuth, decreaseQuantity);
router.post('/remove', requireAuth, removeFromCart);
router.post('/clear', requireAuth, clearCart);

export default router;
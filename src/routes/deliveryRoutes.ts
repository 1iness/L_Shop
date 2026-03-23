import { Router } from 'express';
import { createDeliveryOrder, getOrders, getOrderById } from '../controllers/deliveryController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/order', requireAuth, createDeliveryOrder);
router.get('/', requireAuth, getOrders);
router.get('/:id', requireAuth, getOrderById);

export default router;

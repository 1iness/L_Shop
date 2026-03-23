import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRouter.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import express from 'express';
import type { Request, Response } from 'express'; 
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use(express.static(path.resolve('public')));

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import express from 'express';
import type { Request, Response } from 'express'; 

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
import type { Request, Response } from 'express';
import { readData, writeData } from '../utils/fileDb.js';

interface CartItem {
    productId: string;
    quantity: number;
}

interface UserCart {
    username: string;
    items: CartItem[];
}

export const addToCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId, quantity } = req.body;
        const username = req.cookies?.username || 'guest'; 

        const carts = await readData<UserCart>('carts.json');
        let userCart = carts.find(c => c.username === username);

        if (!userCart) {
            userCart = { username, items: [] };
            carts.push(userCart);
        }

        const existingItem = userCart.items.find(i => i.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            userCart.items.push({ productId, quantity });
        }

        await writeData('carts.json', carts);
        res.status(200).json({ message: 'Товар добавлен в корзину', cart: userCart });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка корзины' });
    }
};
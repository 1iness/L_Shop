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

export const getCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = req.cookies?.username || 'guest';
        const carts = await readData<UserCart>('carts.json');
        
        const userCart = carts.find(c => c.username === username) || { username, items: [] };
        
        res.status(200).json(userCart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении корзины' });
    }
};

// Увеличение количества товара
export const increaseQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.body;
        const username = req.cookies?.username || 'guest';

        const carts = await readData<UserCart>('carts.json');
        const userCart = carts.find(c => c.username === username);

        if (!userCart) {
            res.status(404).json({ message: 'Корзина не найдена' });
            return;
        }

        const item = userCart.items.find(i => i.productId === productId);
        if (item) {
            item.quantity += 1;
            await writeData('carts.json', carts);
            res.status(200).json({ message: 'Количество увеличено', cart: userCart });
        } else {
            res.status(404).json({ message: 'Товар не найден в корзине' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Уменьшение количества товара
export const decreaseQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.body;
        const username = req.cookies?.username || 'guest';

        const carts = await readData<UserCart>('carts.json');
        const userCart = carts.find(c => c.username === username);

        if (!userCart) {
            res.status(404).json({ message: 'Корзина не найдена' });
            return;
        }

        const itemIndex = userCart.items.findIndex(i => i.productId === productId);
        if (itemIndex !== -1) {
            const item = userCart.items[itemIndex];
            if (item && item.quantity > 1) {
                item.quantity -= 1;
            } else if (item) {
                userCart.items.splice(itemIndex, 1);
            }
            await writeData('carts.json', carts);
            res.status(200).json({ message: 'Количество уменьшено', cart: userCart });
        } else {
            res.status(404).json({ message: 'Товар не найден в корзине' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Удаление товара из корзины
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const { productId } = req.body;
        const username = req.cookies?.username || 'guest';

        const carts = await readData<UserCart>('carts.json');
        const userCart = carts.find(c => c.username === username);

        if (!userCart) {
            res.status(404).json({ message: 'Корзина не найдена' });
            return;
        }

        const itemIndex = userCart.items.findIndex(i => i.productId === productId);
        if (itemIndex !== -1) {
            userCart.items.splice(itemIndex, 1);
            await writeData('carts.json', carts);
            res.status(200).json({ message: 'Товар удалён из корзины', cart: userCart });
        } else {
            res.status(404).json({ message: 'Товар не найден в корзине' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// Очистка корзины
export const clearCart = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = req.cookies?.username || 'guest';

        const carts = await readData<UserCart>('carts.json');
        const userCart = carts.find(c => c.username === username);

        if (userCart) {
            userCart.items = [];
            await writeData('carts.json', carts);
        }

        res.status(200).json({ message: 'Корзина очищена', cart: userCart || { username, items: [] } });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
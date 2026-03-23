import type { Request, Response } from 'express';
import { readData, writeData } from '../utils/fileDb.js';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

interface CartItem {
    productId: string;
    quantity: number;
}

interface UserCart {
    username: string;
    items: CartItem[];
}

interface DeliveryOrder {
    id: string;
    username: string;
    address: string;
    phone: string;
    email: string;
    date: string;
    items: CartItem[];
    totalPrice: number;
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: string;
}

export const createDeliveryOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address, phone, email, date } = req.body;
        const username = req.cookies?.username || 'guest';

        const carts = await readData<UserCart>('carts.json');
        const userCart = carts.find(c => c.username === username);

        if (!userCart || userCart.items.length === 0) {
            res.status(400).json({ message: 'Корзина пуста. Добавьте товары перед оформлением доставки.' });
            return;
        }

        const products = await readData<Product>('products.json');
        const productsMap = new Map(products.map(p => [p.id, p]));

        let totalPrice = 0;
        for (const item of userCart.items) {
            const product = productsMap.get(item.productId);
            if (product) {
                totalPrice += product.price * item.quantity;
            }
        }

        const orders = await readData<DeliveryOrder>('orders.json');
        const newOrder: DeliveryOrder = {
            id: Date.now().toString(),
            username,
            address,
            phone,
            email,
            date,
            items: [...userCart.items],
            totalPrice,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        await writeData('orders.json', orders);

        const cartIndex = carts.findIndex(c => c.username === username);
        if (cartIndex !== -1 && carts[cartIndex]) {
            carts[cartIndex].items = [];
            await writeData('carts.json', carts);
        }

        res.status(201).json({ 
            message: 'Заказ успешно оформлен!', 
            order: newOrder 
        });
    } catch (error) {
        console.error('Ошибка оформления доставки:', error);
        res.status(500).json({ message: 'Ошибка при оформлении заказа' });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const username = req.cookies?.username || 'guest';
        const orders = await readData<DeliveryOrder>('orders.json');
        
        const userOrders = orders.filter(o => o.username === username);
        res.status(200).json(userOrders);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении заказов' });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const username = req.cookies?.username || 'guest';
        const orders = await readData<DeliveryOrder>('orders.json');
        
        const order = orders.find(o => o.id === id && o.username === username);
        
        if (!order) {
            res.status(404).json({ message: 'Заказ не найден' });
            return;
        }
        
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении заказа' });
    }
};

import type { Request, Response } from 'express';
import { readData, writeData } from '../utils/fileDb.js';

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string; 
    isAvailable: boolean;
}

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        let products = await readData<Product>('products.json');

        const { search, category, available, sort } = req.query;

        if (typeof search === 'string') {
            const searchLower = search.toLowerCase();
            products = products.filter(p => 
                p.title.toLowerCase().includes(searchLower) || 
                p.description.toLowerCase().includes(searchLower)
            );
        }

        if (typeof category === 'string') {
            products = products.filter(p => p.category === category);
        }

        if (available === 'true') {
            products = products.filter(p => p.isAvailable === true);
        } else if (available === 'false') {
            products = products.filter(p => p.isAvailable === false);
        }

        if (sort === 'asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (sort === 'desc') {
            products.sort((a, b) => b.price - a.price);
        }

        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении товаров' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, price, category, isAvailable } = req.body;

        if (!title || !description || price === undefined || !category) {
            res.status(400).json({ message: 'Отсутствуют обязательные поля: title, description, price, category' });
            return;
        }

        const products = await readData<Product>('products.json');
        
        const maxId = products.reduce((max, p) => {
            const numId = parseInt(p.id);
            return numId > max ? numId : max;
        }, 0);
        const newId = String(maxId + 1);
        
        const newProduct: Product = {
            id: newId,
            title,
            description,
            price: Number(price),
            category,
            isAvailable: isAvailable ?? true
        };

        products.push(newProduct);
        await writeData('products.json', products);

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании товара' });
    }
};

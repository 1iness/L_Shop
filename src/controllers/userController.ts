import type { Request, Response } from 'express';
import { readData, writeData } from '../utils/fileDb.js';

export interface User {
    id: string;
    username: string;
    email: string;
    phone: string;
    password: string;
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, phone, password } = req.body;

        if (!username || !email || !password) {
            res.status(400).json({ message: 'Заполните обязательные поля' });
            return;
        }

        const users = await readData<User>('users.json');

        if (users.find(u => u.username === username || u.email === email)) {
            res.status(409).json({ message: 'Пользователь уже существует' });
            return;
        }

        const newUser: User = {
            id: Date.now().toString(),
            username,
            email,
            phone,
            password
        };

        users.push(newUser);
        await writeData('users.json', users);

        res.cookie('session_token', 'auth_' + newUser.id, {
            maxAge: 10 * 60 * 1000, 
            httpOnly: true,        
            secure: false,        
            sameSite: 'strict'
        });

        res.cookie('username', username, {
            maxAge: 10 * 60 * 1000, 
            httpOnly: false,
            secure: false,        
            sameSite: 'strict'
        });

        res.status(201).json({ message: 'Регистрация успешна' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при сохранении пользователя' });
    }
};
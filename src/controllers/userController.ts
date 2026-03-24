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

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ message: 'Введите имя пользователя и пароль' });
            return;
        }

        const users = await readData<User>('users.json');
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
            return;
        }

        res.cookie('session_token', 'auth_' + user.id, {
            maxAge: 10 * 60 * 1000, 
            httpOnly: true,        
            secure: false,        
            sameSite: 'strict'
        });

        res.cookie('username', user.username, {
            maxAge: 10 * 60 * 1000, 
            httpOnly: false,
            secure: false,        
            sameSite: 'strict'
        });

        res.status(200).json({ 
            message: 'Вход выполнен',
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при входе в систему' });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie('session_token');
        res.clearCookie('username');
        res.status(200).json({ message: 'Выход выполнен' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при выходе' });
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const sessionToken = req.cookies?.session_token;
        
        if (!sessionToken || !sessionToken.startsWith('auth_')) {
            res.status(401).json({ message: 'Не авторизован' });
            return;
        }

        const userId = sessionToken.replace('auth_', '');
        const users = await readData<User>('users.json');
        const user = users.find(u => u.id === userId);

        if (!user) {
            res.status(401).json({ message: 'Пользователь не найден' });
            return;
        }

        res.status(200).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
};
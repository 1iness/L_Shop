import type { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.session_token;

    if (!token) {
        res.status(401).json({ message: 'Доступ запрещен. Требуется авторизация.' });
        return;
    }
    next();
};
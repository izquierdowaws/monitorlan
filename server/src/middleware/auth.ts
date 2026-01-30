import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['x-admin-auth'];
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error('ADMIN_PASSWORD not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (authHeader === adminPassword) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

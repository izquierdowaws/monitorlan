import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import router from './routes';
import { startMonitoring } from './services/ping';
import { startServiceMonitoring } from './services/monitor';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', router);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Error interno del servidor (Unhandled)' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    startMonitoring();
    startServiceMonitoring();
});

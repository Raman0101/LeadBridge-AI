import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import './config/env';
import csvRoutes from './routes/csv.routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: (m) => logger.info(m.trim()) } }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', csvRoutes);

// Central error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Soul backend is running' });
});

app.use('/api', apiRoutes);
app.use(errorMiddleware);

export default app;

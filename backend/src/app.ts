import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'BWS Higher Volume Gym Tracker API', unit: 'kg' });
});

// API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'An internal server error occurred.' } });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`⚡ BWS Gym Tracker Backend running on port ${PORT} (Unit: KG)`);
  });
}

export default app;

import app from './app';
import dotenv from 'dotenv';
import { initDb } from './db';

dotenv.config();

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});

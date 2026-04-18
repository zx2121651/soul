import app from './app';
import { config } from './utils/config';
import { initDb } from './db';

const PORT = config.PORT;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});

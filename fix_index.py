import re

with open('soul-app-backend/src/index.ts', 'r') as f:
    content = f.read()

content = content.replace("import apiRoutes from './routes';", "import apiRoutes from './routes/index';\nimport { errorMiddleware } from './middlewares/error.middleware';")

content = content.replace("app.use('/api', apiRoutes);", "app.use('/api', apiRoutes);\napp.use(errorMiddleware);")

with open('soul-app-backend/src/index.ts', 'w') as f:
    f.write(content)

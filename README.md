# Soul App 原型工程

这是一个基于 **TypeScript** 的全栈社交 App 原型。项目采用 **Monorepo** 形态，包含前端 React 单页应用与后端 Node.js RESTful API。

## 1. 架构概览

- **前端 (`soul-app-web`)**:
  - 技术栈: React 19 + TypeScript + Vite + React Router DOM
  - 核心库: TailwindCSS (样式), Framer Motion (动画), Three.js & React Three Fiber (星球 3D 渲染)
  - 网络层: 统一的 `src/api/client.ts` 封装 `fetch`，自动处理 JWT 注入、10s 超时与统一脱壳 `{ code, message, data }`。

- **后端 (`soul-app-backend`)**:
  - 技术栈: Node.js + Express + TypeScript + PostgreSQL
  - 架构分层 (三层架构):
    - `Routes`: 负责 Zod 参数校验与请求分发。
    - `Services`: 承载核心业务逻辑 (如注册哈希、JWT签发)。
    - `Repositories`: 原生 SQL 查询与持久化。
  - 运维与迁移: 提供 `docker-compose.yml` 快速拉起 PG 库，以及 `npm run migrate` 独立 DDL 建表脚本。

---

## 2. 快速开始

### 前置依赖
- Node.js (>= 18)
- Docker (可选，用于本地启动 PostgreSQL)

### 后端启动
```bash
cd soul-app-backend
npm install

# 1. 启动数据库 (推荐使用 Docker)
docker-compose up -d

# 2. 执行数据库建表与预置数据
npm run migrate

# 3. 启动开发服务器 (默认端口 3001)
npm start &
```

### 前端启动
```bash
cd soul-app-web
npm install

# 启动 Vite 开发服务器 (默认端口 5173)
npm run build
```

---

## 3. 开发指引与环境说明

- **开发态静默登录 (`DEV` Only)**:
  - 为了极速调试，前端在 `import.meta.env.DEV` 模式下挂载页面时，若无 Token，会自动触发隐式的注册与登录，获取并存储真实合法的 JWT Token。
  - 该行为在生产构建 (`npm run build`) 后将自动剥离，强制要求走标准的注册/登录 UI 流程。

- **Mock 路由分离**:
  - 目前应用支持真实的数据库存取 (`/api/users/me`, `/api/moments`)。
  - 尚未实现 DB 层的高级社交功能 (如商城、游戏、语音房等) 的假数据接口，已被物理隔离在 `src/routes/mock.routes.ts` 中。
  - 生产环境可通过移除环境变量 `MOCK_ROUTES_ENABLED=true` 关闭演示数据暴露。

---

## 4. 接口契约规范 (API Schema)

全站严格遵循以下 HTTP 响应格式 (Envelope)：
```json
{
  "code": 0,           // 0 表示成功，非 0 表示各类业务错误
  "message": "Success",// 提示信息，可直接在前端 Toast 展示
  "data": { ... }      // 泛型负载，具体参考前端 src/types/index.ts
}
```

## 5. 测试
后端配置了 Jest 单元/集成测试：
```bash
cd soul-app-backend
npm test
```

# 🚀 Soul App 核心架构解析与前端极致补全计划书

## 一、 系统全景架构深度剖析

本项目是一个经典的 **Node.js (Express) + React (TypeScript/Vite) 单体架构**，数据库使用 Prisma 驱动的 SQLite。

### 1. 核心模块与数据库字段级流转

#### A. 社交与身份系统
*   **数据结构**: `User` 实体是核心，绑定 `UserFollow` (关注联合主键) 和 `UserBlock` (黑名单)。采用冗余字段 `followersCount` 和 `followingCount` 以应付高并发读。
*   **状态与验证**: `passwordHash` 负责鉴权，目前通过硬编码 `authMiddleware`（伪造 `req.user`）绕过了真实的鉴权，真实的 JWT 鉴权尚未在前端落地。

#### B. 瞬间广场与推荐引擎
*   **数据结构**: `Moment` 表包含 `viewsCount`（曝光量）、`likesCount`、`commentsCount` 冗余计数字段。通过一对多关联 `MomentLike` 和 `MomentComment`。
*   **推荐流转机制 (重要)**:
    1. 当用户进入 `ExplorePage`，调用 `/moment` 接口。
    2. 后端 `MomentService.getFeedRecommends()` 聚合数据。
    3. **防重机制**: 前端 `MomentDetailPage` 渲染时，应触发 `/moment/:id/view` 接口，在 `UserMomentHistory` 表中写入 `actionType='view'` 或 `'click'`，防止该瞬间被算法重复推送。乐观更新 (Optimistic UI) 应当在前端的 `Like` 按钮点击时触发，先改变组件 state，后台异步请求。

#### C. 即时通讯与音视频 (IM & RTC)
*   **IM 架构**: 依赖 `ChatRoom` 和 `ChatMessage`。
    *   **痛点/难点**: 当前端发送消息时，如果没有使用 WebSocket，则只能依赖轮询。当并发增加时，会导致 SQLite 产生表锁 (SQLITE_BUSY)。前端需要在 `ChatPage` 内维护 `setInterval` 轮询最新 `createdAt` 的消息，或者引入 `Socket.io` 进行全双工改造。
*   **RTC 架构**: 依赖 `VoiceRoom` 和外部 LiveKit 服务。
    *   **状态同步难点**: `VoiceRoom.onlineCount` 容易与 LiveKit 的真实状态脱节。需要通过 LiveKit 的 Webhook 回调到后端的 `/webhook/livekit` 接口，精准维护 `VoiceRoom` 的 `status ('active'|'closed')`。

---

## 二、 前端缺失页面深度盘点与伪代码级开发步骤

针对目前前端存在的缺失，我们将进行**四个阶段**的闭环开发。

### 📌 阶段一：鉴权闭环 (Priority: P0)
**现状**: `App.tsx` 使用 `bootstrapApp()` 假登录。`User` 表有鉴权字段但无配套界面。
**难点**: 路由保护、Token 存储策略 (HttpOnly Cookie vs localStorage)、Axios 请求拦截器。

**详细开发步骤 (Step 1-3)：**

1.  **开发 `src/pages/LoginPage.tsx` (登录)**
    *   **UI 布局**: Tailwind 深色星空背景 (`bg-[#12141d]`)。包含 `PhoneInput` 和 `PasswordInput`。
    *   **状态管理**: `const [phone, setPhone] = useState('')`, `const [loading, setLoading] = useState(false)`。
    *   **接口调用**: `axios.post('/api/auth/login', { phone, password })`。
    *   **逻辑流转**: 成功后将后端返回的 JWT Token 存入 `localStorage.getItem('token')`，并分发 Redux/Zustand Action 更新全局 User state，通过 `useNavigate` 重定向至 `/planet`。

2.  **开发 `src/pages/RegisterPage.tsx` (注册与资料初始化)**
    *   **UI 布局**: 分布式表单 (Step 1: 账号密码; Step 2: 头像上传/Three.js 星球模型选择; Step 3: `interests` 兴趣标签多选卡片)。
    *   **数据流**: 将兴趣标签 `['动漫', '音乐']` 转换并 `JSON.stringify` 存入 `User.interests` 字段。

3.  **开发 Axios 拦截器与路由守卫 (`src/utils/http.ts` & `App.tsx`)**
    *   **拦截器逻辑**: `instance.interceptors.request.use(config => { config.headers.Authorization = 'Bearer ' + token })`。如遇 401 错误，强制跳转 `/login`。
    *   **组件树**: `<Route element={<ProtectedRoute />}><Route path="/explore" ... /></Route>`。

---

### 📌 阶段二：消息互动与通知中枢 (Priority: P0)
**现状**: 虽然有 `MomentLike` 等表，但别人赞了你，你根本不知道，缺乏全局系统信箱。

**详细开发步骤 (Step 4)：**

4.  **开发 `src/pages/NotificationsPage.tsx`**
    *   **数据拉取**: 需在后端新增 `/user/notifications` API。整合针对该 `userId` 的 `MomentLike`, `MomentComment` 以及未读的 `Announcement`。
    *   **UI 结构**:
        *   顶部 `Tabs`: [互动通知], [系统广播]。
        *   卡片组件 `NotificationCard.tsx`：采用 `flex` 布局，左侧触发者头像，右侧文案 `<span className="text-cyan-500">{user.name}</span> 点赞了你的瞬间`，右下角附带动态缩略图。
    *   **业务逻辑**: 点击卡片，直接 `navigate('/moment/${momentId}')`；并在组件卸载时或滚动时，向后端发送 `/user/notifications/read` 清除未读红点状态。

---

### 📌 阶段三：社交关系图谱闭环 (Priority: P1)
**现状**: 只有 `UserFollow` 数据库记录，页面无入口。

**详细开发步骤 (Step 5-6)：**

5.  **开发 `src/pages/FollowerListPage.tsx` & `FollowingListPage.tsx`**
    *   **API 层面**: 后端需新增 `/user/followers` 和 `/user/following`。这里注意要进行 `User` 表的 Join 查询 (Prisma `include`) 拿到对方资料。
    *   **UI 复用**: 提取现有的 User 卡片为独立组件 `UserListCard.tsx`。
    *   **防抖与乐观更新**: 列表内提供【关注/取消关注】按钮。点击时，先 `setList(prev => prev.map(u => u.id === target ? {...u, isFollowing: !u.isFollowing}))` 进行视图**乐观更新**，再调用 Axios；若接口失败则回滚。

6.  **开发 `src/pages/BlockListPage.tsx` (黑名单管理)**
    *   位于 `SettingsPage` 的子路由。拉取 `UserBlock` 列表。
    *   点击【解除拉黑】调用 `DELETE /user/block/:id`，从状态数组中 `filter` 移除。

---

### 📌 阶段四：内容探索增强 (Priority: P2)
**现状**: 无法主动搜索人或帖子，话题标签 `#` 无法点击跳转。

**详细开发步骤 (Step 7-8)：**

7.  **开发 `src/pages/SearchPage.tsx` (全局搜索)**
    *   **UI 特性**: 顶部固定搜素框，带防抖 (Lodash `debounce(fetchData, 500)`)。
    *   **接口映射**: 调取已有的 `router.get('/search', { params: { q: keyword } })`。
    *   **视图渲染**: 根据返回结果的类型渲染，若是用户则渲染 `UserListCard`，若是动态则渲染小尺寸瀑布流排列的 `MomentCard`。

8.  **开发 `src/pages/TopicDetailPage.tsx` (话题落地页)**
    *   **路由解析**: `const { tagName } = useParams()`。
    *   **核心逻辑**: 调用后端根据 `tagName` 筛选的 `MomentTag` 和 `Moment` 聚合查询。顶部显示话题的大 Banner (`#寻找同频的灵魂`) 和参与人数，下半部分接入 `IntersectionObserver` 实现滚动无限加载 (Infinite Scroll) 的动态列表。

---

### 💡 核心架构挑战提示 (架构师备注)：
1.  **数据库并发写入瓶颈**：随着业务起飞，`Moment.likesCount` 这种冗余字段极易产生死锁。**建议优化方案**：在 Node.js 内存中或引入 Redis 进行批量缓冲，每 10 秒批量执行 Prisma `updateMany` 刷入 SQLite。
2.  **IM 未读数维护**：`ChatRoomMember.unreadCount` 的更新需要极高的一致性。当发送新消息时，需在一个 Prisma 事务 (`$transaction`) 中同时完成：创建 `ChatMessage` + 更新 `ChatRoom.updatedAt` + 递增其他群员的 `unreadCount`。

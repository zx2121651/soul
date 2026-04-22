# Soul App 架构分析文档

本项目是一个基于前后端分离架构的 Monorepo，包含三个主要子项目：面向用户的网页端 (`soul-app-web`)、管理后台 (`soul-app-admin`) 以及提供核心业务逻辑支持的后端服务 (`soul-app-backend`)。

以下是对整个代码库和架构的详细分析：

## 1. 整体架构概览

- **包管理与项目结构**: 采用 Monorepo 结构，将不同端的项目集中在一个仓库中，便于共享规范和统一管理。
- **技术栈**:
  - **后端 (`soul-app-backend`)**: Node.js + Express + TypeScript，数据库层使用 Prisma ORM 配合 SQLite（开发环境）。
  - **Web 端 (`soul-app-web`)**: React 19 + TypeScript + Vite，UI 和动画使用 TailwindCSS + Framer Motion，3D 渲染使用 Three.js 及 React Three Fiber 相关的生态，实时通讯使用 LiveKit。
  - **Admin 端 (`soul-app-admin`)**: React 19 + TypeScript + Vite，UI 组件库使用 Ant Design (antd)，数据可视化使用 Recharts。
- **端到端测试 (E2E)**: 使用 Playwright 进行测试保障。

---

## 2. 后端架构分析 (soul-app-backend)

后端采用经典的 MVC 分层架构，结合了 RESTful API 设计理念。

### 2.1 目录结构
- `src/app.ts` & `src/index.ts`: 应用入口及 Express 实例配置。
- `src/db.ts`: 数据库连接配置 (Prisma Client 实例化)。
- `src/routes/`: 路由层，定义 API 路径并分发请求到相应的处理函数。模块化路由（如 `auth.routes.ts`, `user.routes.ts`, `moment.routes.ts` 等）。
- `src/controllers/`: 控制器层，解析 HTTP 请求（如 body、query、params），调用 Service 处理业务逻辑，并返回 HTTP 响应。
- `src/services/`: 业务逻辑层，实现核心业务规则和数据处理。
- `src/repositories/`: 数据访问层 (DAO/Repository 模式)，直接与数据库交互（通过 Prisma），隔离底层数据库操作与上层业务逻辑。
- `src/middlewares/`: 中间件层，用于鉴权、错误处理、请求校验等全局拦截操作。
- `src/validations/`: 数据验证层，基于 Zod 进行输入数据的校验。
- `src/utils/`: 工具类函数，如密码哈希、JWT 生成、日期格式化等。

### 2.2 数据库模型设计 (Prisma)
数据库设计涵盖了典型的社交应用所需的复杂关系模型：
- **用户系统 (`User`)**: 包含基本信息、统计字段（粉丝、关注、访客）以及复杂的关联关系（动态、点赞、私聊、拉黑等）。使用 UUID 对外暴露，保护自增主键安全。
- **社交关系图谱 (`UserFollow`, `UserBlock`)**: 处理用户间的关注和拉黑逻辑，采用联合主键确保数据一致性。
- **动态广场系统 (`Moment`, `MomentLike`, `MomentComment`, `MomentTag`)**: 支持文本、图片、语音等多种类型的瞬间动态。引入了点赞、评论互动机制，以及用于分类的话题标签，并预留了用于推荐算法的历史记录表 (`UserMomentHistory`)。
- **即时通讯/私聊 (`ChatRoom`, `ChatRoomMember`, `ChatMessage`)**: 支持多对多/单对单的聊天房间设计，包含未读计数和已读状态管理。
- **语音房派对 (`VoiceRoom`)**: 提供异星派对功能，记录房间状态和在线人数。
- **后台运营 (`Banner`, `Announcement`)**: 支持配置轮播图和系统广播。

### 2.3 数据流转
`HTTP 请求 -> Middleware 拦截/校验 -> Router 路由分发 -> Controller 解析参数 -> Validation(Zod) 数据校验 -> Service 业务逻辑处理 -> Repository/Prisma 数据库操作 -> Controller 格式化响应 -> 客户端`。

---

## 3. 用户 Web 端架构分析 (soul-app-web)

Web 端侧重于沉浸式的交互体验和视觉效果。

### 3.1 目录结构
- `src/api/`: 封装 HTTP 请求（如使用 axios 或 fetch），与后端 API 进行通信。
- `src/components/`: 可复用的 UI 组件（基于 Tailwind CSS 封装）。
- `src/pages/`: 页面级组件（视图），对应具体的路由页面。
- `src/data/`: 可能是本地 Mock 数据或全局常量配置。
- `src/types/`: TypeScript 类型定义，用于约束前端数据结构。
- `src/utils/`: 前端通用的工具函数。

### 3.2 关键技术与业务逻辑
- **3D 交互星球**: 利用 `three`、`@react-three/fiber`、`@react-three/drei` 以及 `@react-spring/three` 实现了 3D 星球的渲染与交互，这是应用的一大特色亮点，为用户提供探索“灵魂星球”的体验。
- **UI 与动画**: 采用 `tailwindcss` 进行原子化样式管理，配合 `framer-motion` 实现流畅的页面过渡和复杂的 UI 动画。
- **实时语音通讯**: 集成了 `livekit-client` 和 `@livekit/components-react`，为异星派对（VoiceRoom）功能提供底层的 RTC 音视频和实时互动能力。
- **状态管理**: 基于 React 19 的 Hooks 特性（如 `Context` 或轻量级状态库）进行组件间的数据共享。

---

## 4. 管理后台架构分析 (soul-app-admin)

Admin 端侧重于数据管理和业务运营。

### 4.1 目录结构
- `src/api/`: 封装对后端 `/admin` 等相关接口的请求调用（使用 axios）。
- `src/layout/`: 后台整体的页面布局框架，通常包含侧边栏导航 (Sidebar)、顶部 Header 和内容主区域。
- `src/pages/`: 各个管理模块的具体页面（如用户管理、动态管理、广播发布等）。
- `src/assets/`: 静态资源文件。

### 4.2 关键技术与业务逻辑
- **UI 组件库**: 全面采用 `antd` 及其图标库构建标准化、高效率的后台管理界面，包含表格、表单、弹窗等经典交互。
- **数据可视化**: 引入 `recharts` 库，用于在 Dashboard 首页展示用户增长、动态活跃度等统计图表。
- **路由控制**: 使用 `react-router-dom` 实现前端单页应用的路由跳转和菜单高亮联动。
- **状态管理**: 通过标准的 React 状态管理方案（结合 Context/Hooks）管理表单数据、分页状态和全局配置。

---

## 5. 总结

该系统是一个架构清晰、功能完整的现代社交平台项目。
- **前端架构**兼顾了 C 端用户的沉浸式体验（通过 WebGL/Three.js + Framer Motion）和 B 端管理员的高效操作（通过 Antd + Recharts）。
- **后端架构**基于模块化设计，业务职责划分清晰（Controller -> Service -> Repository），并通过 Prisma 实现了健壮的数据模型设计，尤其是处理复杂的社交关系链和内容流分发方面，具备良好的扩展性。

## 6. 前端多级交互与页面链路深入分析

在基础的页面级架构（如广场、私聊、主页）之下，Soul App Web 端和 Admin 端还包含了大量细粒度的二级、三级页面或全屏弹窗。以下是对应用内部完整交互流转和深层嵌套结构的详细梳理：

### 6.1 认证鉴权链路 (Authentication Flow)
- **拦截逻辑 (`<RequireAuth>`)**: 系统所有的核心页面均被路由守卫包裹，未登录用户会被强制定向到 `/login`。
- **登录页 (`LoginPage`)**: 基于暗色青色星球主题，收集用户名/手机号与密码，校验成功后下发并存储 JWT Token，跳转 `/planet` 首页。
- **注册页 (`RegisterPage`)**: 收集星际代号(昵称)、账号和密码，完成注册后跳转登录页。

### 6.2 社交与关系链深层视图 (Social & Relationships)
- **他人主页 (`UserProfilePage`)**:
  - **交互**: 展示目标用户的基本信息、关注/粉丝统计及历史瞬间瀑布流。
  - **衍射视图 (`UserListPage`)**: 当用户点击“关注”或“粉丝”数字时，会通过路由 `/user/:id/:type` (type 为 `following` 或 `followers`) 进入独立的通用用户列表页。
- **个人设置抽屉 (`MePage` -> `isSettingsOpen`)**:
  - **交互**: 个人主页右上角的汉堡菜单会拉出侧边设置抽屉 (Drawer)。
  - **衍生四级子页面**: 抽屉内的条目分别通过 `useNavigate` 链接至四个独立的设置详情页：
    - `/settings/account`: 账号与安全 (绑定手机、注销等)。
    - `/settings/notifications`: 消息通知 (互动提醒、私信开关)。
    - `/settings/privacy`: 隐私设置 (在线状态隐藏、黑名单管理)。
    - `/settings/help`: 帮助与反馈 (联系客服、常见问题)。
- **个人资料编辑 (`EditProfilePage`)**:
  - **交互**: 点击头像区域调起系统原生的 `input[type="file"]` 选择器，通过 `FileReader.readAsDataURL` 实时转换为 Base64 本地预览并随表单提交。

### 6.3 动态广场与评论交互树 (Moments & Comments)
- **话题标签聚合页 (`TagMomentsPage`)**:
  - **链路**: 在 `ExplorePage` 或 `MomentDetailPage` 的底部，带有 `#标签` 的内容均为可点击的热区。
  - **交互**: 点击后跳转 `/tag/:tagName`，后端会利用 Prisma 的 `tags: { some: { tagName } }` 聚合查询返回所有携带该话题的公开瞬间动态，以全屏瀑布流形式渲染。
- **瞬间详情与评论区 (`MomentDetailPage`)**:
  - **一级评论**: 在动态详情页的吸底输入框发送内容，可增加该动态的一级评论列表。
  - **二级轻量互动 (回复)**: 点击其他用户的评论记录时，输入框会自动填入并聚焦 `回复 @该用户名: ` 的前缀文本。虽然后端 `MomentComment` 未使用树状 `parentId`，但通过前端预设前缀的约定，满足了社交互动中最核心的轻量级 At 提醒体验。

### 6.4 实时私聊与富媒体面板 (IM & Rich Media)
- **聊天室覆盖层 (`ChatRoom`)**:
  - **链路**: 在 `ChatPage` (消息列表) 点击联系人，会以 `AnimatePresence` 滑动覆盖整个屏幕，而不是新开路由，保持上下文连贯。
  - **富媒体发送面板 (`showPlusMenu`)**: 点击输入框左侧的 `+` 号会弹出包含“拍摄”和“相册”的抽屉。通过隐藏的 `input` 和 `capture="environment"` 调起相机，获取照片后转化为 Base64/`ObjectURL` 并带有 `[img]` 前缀作为私聊文本流转。
  - **气泡渲染引擎**: 聊天气泡层 (Message Area) 能自动正则识别 `[img]` 前缀文本，将其剥离并渲染成原生无边框 `<img />`，以适应图文混排。
  - **高级聊天设置 (`showSettings`)**: 右上角呼出 Bottom Sheet，包含“拉黑”、“举报”、“清空聊天记录”等选项。

### 6.5 异星派对与麦位管理链路 (VoiceRoom & RTC)
- **Web 端参与者视图 (`VoiceRoomPage`)**:
  - **实时抽屉 (`useParticipants`)**: 点击底部带有人数角标的按钮，从下方弹出房间成员列表抽屉。通过 LiveKit Hook 实时更新在麦听众。
  - **礼物面板 (`showGifts`)**: 点击礼物图标弹出网格系统。选择特效礼物发送后，全房间会收到 Toast 广播动效。
- **Admin 端超级监控视图 (`VoiceRooms` -> `Drawer`)**:
  - **链路**: 客服人员在后台的“语音房管理”列表，可以通过“隐身监听”操作调用特殊的 `/admin/voice-rooms/:id/monitor` 接口。
  - **交互**: 系统利用此 token 签发具备管理员权限的隐藏终端，挂载 LiveKit 房间组件。客服可直观监控所有麦位，并强制对特定成员下发“全麦静音”或“强制踢出房间”指令（模拟）。

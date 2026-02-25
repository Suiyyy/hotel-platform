# 酒店 O2O 预订平台

一个完整的酒店在线预订系统，包含 C 端用户应用、B 端管理后台和后端服务，集成 LangChain + 智谱 GLM 大模型提供 AI 能力。

## 项目架构

```
hotel-platform-main/
├── hotel-user-app/      # C端用户应用（Taro 4 + React 18 + TypeScript）
├── hotel-admin-app/     # B端管理后台（React 19 + Vite + Ant Design 5）
└── hotel-backend/       # 后端服务（Express 4 + TypeScript + Redis + LangChain）
```

## 技术栈

| 子项目 | 技术栈 |
|--------|--------|
| hotel-user-app | Taro 4、React 18、Vite、TypeScript、SCSS |
| hotel-admin-app | React 19、Vite、Ant Design 5、TypeScript |
| hotel-backend | Express 4、TypeScript、WebSocket (ws)、Redis (ioredis)、LangChain + 智谱 GLM |

## 功能特性

### C 端用户应用
- 首页搜索：关键词搜索 + 日历日期选择
- **AI 智能搜索**：自然语言描述需求，AI 提取结构化查询条件匹配酒店
- 酒店列表：虚拟列表渲染、服务端分页、多维度排序
- 酒店详情：图片轮播、房型按价格排序、最低价标注
- 收藏功能：本地持久化收藏
- 浏览历史：自动记录、支持清空
- 夜间模式：CSS 变量方案、一键切换
- WebSocket：实时接收酒店价格更新

### B 端管理后台
- 用户认证：商户/管理员角色、注册登录
- 酒店录入：完整信息表单、多房型管理
- **图片上传**：支持直接上传图片文件，服务端存储 + 缩略图预览
- **AI 润色简介**：一键调用 GLM 大模型美化酒店描述文案
- **设施服务勾选**：15 个预设设施标签，点选替代手动输入
- 酒店管理：我的酒店列表、编辑、软删除/恢复
- 审核管理：状态筛选、搜索、通过/拒绝（须填原因）
- 导航布局：角色感知侧边栏、响应式
- 夜间模式：Ant Design darkAlgorithm

### 后端服务
- Redis 存储：启动时从 JSON 文件 seed 初始数据，运行时全部走 Redis
- RESTful API：完整 CRUD + 认证中间件
- 请求校验：字段类型和范围验证
- 分页查询：keyword/sort/order/page/pageSize
- **文件上传**：multer 处理图片上传，静态文件服务
- **AI 能力**：LangChain 调用智谱 GLM-4-Flash，支持意图解析和文案润色，内置超时降级机制
- WebSocket：酒店价格变更实时广播
- 软删除：下线/恢复机制

## AI 功能说明

本项目使用 LangChain 调用智谱 GLM-4-Flash 大模型，提供两项 AI 能力：

### 1. Vibe Search（自然语言找房）

用户在 C 端输入自然语言描述（如"帮我找光谷附近便宜又安静的酒店"），后端调用 GLM 提取结构化搜索意图（关键词、标签、价格范围、星级、排序方式），然后在数据库中做多维度过滤。

**降级机制**：当 GLM 不可用（超时 10s / 网络异常）时，自动降级到本地正则规则提取意图，前端提示"AI 暂时不可用，已使用本地搜索"。

### 2. 酒店简介 AI 润色

管理端录入酒店时，输入简单描述后点击「AI 润色」，GLM 将其改写为更吸引人的营销文案。失败时返回原文。

## 快速启动

### 前置要求

- Node.js >= 18
- pnpm
- Redis

### 启动 Redis

```bash
brew install redis
brew services start redis
```

### 启动后端

```bash
cd hotel-backend
pnpm install
pnpm dev     # 默认端口 3001，启动时自动从 data/hotels.json seed 数据到 Redis
```

### 启动管理后台
```bash
cd hotel-admin-app
pnpm install
pnpm dev     # 默认端口 5173
```

### 启动用户应用
```bash
cd hotel-user-app
pnpm install
pnpm dev:h5  # H5 模式，默认端口 10086
```

## API 文档

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /auth/register | 注册（username, password, role） |
| POST | /auth/login | 登录（返回 token） |

### 酒店（公开）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /hotels/public | 查询酒店（支持 keyword, sort, order, page, pageSize） |

### 酒店（认证）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /hotels | 获取所有酒店（管理员） |
| GET | /hotels/mine | 获取我的酒店（商户） |
| POST | /hotels | 创建酒店 |
| PATCH | /hotels/:id | 更新酒店（含审核状态变更） |
| DELETE | /hotels/:id | 软删除（下线） |
| PATCH | /hotels/:id/restore | 恢复上线 |

### 文件上传

| 方法 | 路径    | 说明                                                 |
|------|---------|------------------------------------------------------|
| POST | /upload | 上传图片（multipart/form-data，字段名 file，限 5MB） |

### AI

| 方法 | 路径       | 说明                                             |
|------|------------|--------------------------------------------------|
| POST | /ai/search | AI 搜索（body: `{ query }` → 返回匹配酒店列表） |
| POST | /ai/polish | AI 润色（body: `{ text }` → 返回润色后文本）     |

### 默认账号
- 管理员：admin / 123456
- 商户：user / 123456
- 测试用户：test1 / 123456

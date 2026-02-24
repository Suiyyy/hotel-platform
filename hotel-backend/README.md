# hotel-backend

一个最小可用的本地后端，用于在 `hotel-admin-app` 与 `hotel-user-app` 之间同步酒店数据（开发环境）。

## 启动

```bash
cd hotel-backend
npm i
npm run dev
```

默认监听：`http://localhost:3001`

## API

- `GET /health`
- `GET /hotels`（管理端：全量）
- `GET /hotels/public`（用户端：仅 `approved && isOnline`）
- `POST /hotels`（新建，默认 `pending/isOnline=false`）
- `PATCH /hotels/:id`（修改任意字段）


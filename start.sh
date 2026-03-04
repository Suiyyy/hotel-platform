#!/bin/bash

# 酒店 O2O 预订平台 — 一键启动脚本
# 启动顺序：Redis → hotel-backend → hotel-admin-app + hotel-user-app (H5)

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS=()

cleanup() {
  echo ""
  echo "正在关闭所有服务..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null
  echo "所有服务已关闭"
  exit 0
}

trap cleanup SIGINT SIGTERM

# ---------- 检查 Redis ----------
echo "=========================================="
echo " 酒店 O2O 预订平台 — 启动中"
echo "=========================================="

if ! command -v redis-cli &>/dev/null; then
  echo "[错误] 未安装 Redis，请先运行: brew install redis"
  exit 1
fi

if redis-cli ping &>/dev/null; then
  echo "[Redis]   已在运行"
else
  echo "[Redis]   正在启动..."
  redis-server --daemonize yes
  sleep 1
  if redis-cli ping &>/dev/null; then
    echo "[Redis]   启动成功"
  else
    echo "[错误] Redis 启动失败"
    exit 1
  fi
fi

# ---------- 安装依赖（如果需要） ----------
for dir in hotel-backend hotel-admin-app hotel-user-app; do
  if [ ! -d "$ROOT_DIR/$dir/node_modules" ]; then
    echo "[$dir] 安装依赖..."
    (cd "$ROOT_DIR/$dir" && pnpm install --frozen-lockfile 2>/dev/null || pnpm install)
  fi
done

# ---------- 启动后端 ----------
echo "[Backend] 启动中... (http://localhost:3001)"
(cd "$ROOT_DIR/hotel-backend" && pnpm dev) &
PIDS+=($!)
sleep 2

# ---------- 启动管理后台 ----------
echo "[Admin]   启动中... (http://localhost:5173)"
(cd "$ROOT_DIR/hotel-admin-app" && pnpm dev) &
PIDS+=($!)

# ---------- 启动用户应用 (H5) ----------
echo "[User]    启动中... (http://localhost:10086)"
(cd "$ROOT_DIR/hotel-user-app" && pnpm dev:h5) &
PIDS+=($!)

# ---------- 完成 ----------
echo ""
echo "=========================================="
echo " 所有服务已启动！"
echo "  后端 API   → http://localhost:3001"
echo "  管理后台   → http://localhost:5173"
echo "  用户端 H5  → http://localhost:10086"
echo ""
echo "  按 Ctrl+C 关闭所有服务"
echo "=========================================="

wait

#!/bin/bash

# Expression Engine Playground 启动脚本

echo "🚀 Expression Engine Playground"
echo "================================"

# 检查是否安装了 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装，请先安装 pnpm："
    echo "   npm install -g pnpm"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖中..."
    pnpm install
fi

# 启动开发服务器
echo "🎯 启动开发服务器..."
echo "访问地址: http://localhost:5173"
pnpm dev 
#!/bin/bash
# NHK新闻应用启动脚本
# 用法: ./start.sh [API端口] [HTML端口]

set -e

# 默认端口
API_PORT=${1:-8888}
HTML_PORT=${2:-8001}

echo "=================================================="
echo "NHK新闻集成应用启动脚本"
echo "=================================================="
echo "🔧 使用端口: API=$API_PORT, HTML=$HTML_PORT"

# 检查app目录
if [ ! -d "app" ]; then
    echo "❌ app目录不存在"
    exit 1
fi

# 进入app目录
cd app

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "📦 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "📦 安装依赖..."
pip install -r requirements.txt

# 启动API服务器
echo "🚀 启动API服务器 (端口$API_PORT)..."
FLASK_PORT=$API_PORT python nhk_rss_scraper.py api &
API_PID=$!

# 等待API服务器启动
echo "⏳ 等待API服务器启动..."
sleep 5

# 启动HTML服务器
echo "🌐 启动HTML服务器 (端口$HTML_PORT)..."
cd ..
python3 -m http.server $HTML_PORT &
HTML_PID=$!

# 等待HTML服务器启动
echo "⏳ 等待HTML服务器启动..."
sleep 3

echo ""
echo "🎉 所有服务启动成功！"
echo "=================================================="
echo "访问地址:"
echo "📱 HTML界面: http://localhost:$HTML_PORT/"
echo "🔧 API健康检查: http://127.0.0.1:$API_PORT/api/nhk/health"
echo "📰 获取所有新闻: http://127.0.0.1:$API_PORT/api/nhk/articles"
echo "=================================================="
echo "按 Ctrl+C 停止服务"
echo ""

# 设置信号处理
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    kill $API_PID 2>/dev/null || true
    kill $HTML_PID 2>/dev/null || true
    echo "✅ 服务已停止"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 保持脚本运行
wait

#!/bin/bash
# NHK新闻集成服务启动脚本

echo "=========================================="
echo "启动NHK新闻集成服务"
echo "=========================================="

# 检查虚拟环境
if [ ! -d "python_scripts/venv" ]; then
    echo "❌ 虚拟环境不存在，请先运行: python3 -m venv python_scripts/venv"
    exit 1
fi

# 激活虚拟环境并安装依赖
echo "📦 检查并安装依赖..."
source python_scripts/venv/bin/activate
pip install -r python_scripts/requirements.txt > /dev/null 2>&1

# 启动NHK API服务器
echo "🚀 启动NHK API服务器 (端口5000)..."
source python_scripts/venv/bin/activate
python python_scripts/nhk_rss_scraper.py api &
API_PID=$!

# 等待API服务器启动
sleep 3

# 检查API服务器是否启动成功
if curl -s http://127.0.0.1:5000/api/nhk/health > /dev/null; then
    echo "✅ NHK API服务器启动成功"
else
    echo "❌ NHK API服务器启动失败"
    kill $API_PID 2>/dev/null
    exit 1
fi

# 启动HTML服务器
echo "🌐 启动HTML服务器 (端口8001)..."
python3 -m http.server 8001 &
HTML_PID=$!

# 等待HTML服务器启动
sleep 2

# 检查HTML服务器是否启动成功
if curl -s http://localhost:8001/ > /dev/null; then
    echo "✅ HTML服务器启动成功"
else
    echo "❌ HTML服务器启动失败"
    kill $API_PID $HTML_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 所有服务启动成功！"
echo "=========================================="
echo "访问地址:"
echo "📱 HTML界面: http://localhost:8001/"
echo "🔧 API健康检查: http://127.0.0.1:5000/api/nhk/health"
echo "📰 获取所有新闻: http://127.0.0.1:5000/api/nhk/articles"
echo "=========================================="
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $API_PID $HTML_PID 2>/dev/null; echo '✅ 服务已停止'; exit 0" INT

# 保持脚本运行
wait

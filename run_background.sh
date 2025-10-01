#!/bin/bash
# 后台运行NHK新闻服务

echo "启动NHK新闻后台服务..."

# 创建日志目录
mkdir -p logs

# 启动API服务器（后台运行）
echo "启动API服务器..."
cd /Users/tetsuya/Dev/Fudoki4Web
source python_scripts/venv/bin/activate
nohup python python_scripts/nhk_rss_scraper.py api > logs/api.log 2>&1 &
API_PID=$!
echo $API_PID > logs/api.pid

# 启动HTML服务器（后台运行）
echo "启动HTML服务器..."
nohup python3 -m http.server 8001 > logs/html.log 2>&1 &
HTML_PID=$!
echo $HTML_PID > logs/html.pid

echo "✅ 服务已启动"
echo "API服务器 PID: $API_PID"
echo "HTML服务器 PID: $HTML_PID"
echo ""
echo "访问地址: http://localhost:8001/"
echo "停止服务: ./stop_background.sh"
echo "查看日志: tail -f logs/api.log"

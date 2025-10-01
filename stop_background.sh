#!/bin/bash
# 停止NHK新闻后台服务

echo "停止NHK新闻服务..."

# 停止API服务器
if [ -f logs/api.pid ]; then
    API_PID=$(cat logs/api.pid)
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID
        echo "✅ API服务器已停止 (PID: $API_PID)"
    else
        echo "⚠️  API服务器未运行"
    fi
    rm -f logs/api.pid
else
    echo "⚠️  未找到API服务器PID文件"
fi

# 停止HTML服务器
if [ -f logs/html.pid ]; then
    HTML_PID=$(cat logs/html.pid)
    if kill -0 $HTML_PID 2>/dev/null; then
        kill $HTML_PID
        echo "✅ HTML服务器已停止 (PID: $HTML_PID)"
    else
        echo "⚠️  HTML服务器未运行"
    fi
    rm -f logs/html.pid
else
    echo "⚠️  未找到HTML服务器PID文件"
fi

echo "✅ 所有服务已停止"

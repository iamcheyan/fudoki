#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NHK新闻应用启动器
用法: python3 app.py [API端口] [HTML端口]
"""

import sys
import os
import subprocess
import time
import signal
import random
import socket

def get_random_port():
    """获取随机可用端口"""
    while True:
        port = random.randint(8000, 9999)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port

def is_port_available(port):
    """检查端口是否可用"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def main():
    """主函数"""
    print("=" * 50)
    print("NHK新闻集成应用")
    print("=" * 50)
    
    # 解析命令行参数
    api_port = 8888
    html_port = 8001
    
    if len(sys.argv) > 1:
        try:
            api_port = int(sys.argv[1])
        except ValueError:
            print("❌ 无效的API端口号")
            sys.exit(1)
    
    if len(sys.argv) > 2:
        try:
            html_port = int(sys.argv[2])
        except ValueError:
            print("❌ 无效的HTML端口号")
            sys.exit(1)
    
    # 检查端口是否可用
    if not is_port_available(api_port):
        print(f"⚠️  API端口 {api_port} 被占用，尝试随机端口...")
        api_port = get_random_port()
    
    if not is_port_available(html_port):
        print(f"⚠️  HTML端口 {html_port} 被占用，尝试随机端口...")
        html_port = get_random_port()
    
    print(f"🔧 使用端口: API={api_port}, HTML={html_port}")
    
    # 检查app目录
    app_dir = os.path.join(os.path.dirname(__file__), 'app')
    if not os.path.exists(app_dir):
        print("❌ app目录不存在")
        sys.exit(1)
    
    # 进入app目录
    os.chdir(app_dir)
    
    # 激活虚拟环境
    if os.name == 'nt':  # Windows
        python_cmd = os.path.join(app_dir, 'venv', 'Scripts', 'python.exe')
    else:  # Unix/Linux/macOS
        python_cmd = os.path.join(app_dir, 'venv', 'bin', 'python')
    
    # 启动API服务器
    print(f"🚀 启动API服务器 (端口{api_port})...")
    api_process = subprocess.Popen([
        python_cmd, 'nhk_rss_scraper.py', 'api'
    ], env={**os.environ, 'FLASK_PORT': str(api_port)})
    
    # 等待API服务器启动
    print("⏳ 等待API服务器启动...")
    time.sleep(5)
    
    # 启动HTML服务器
    print(f"🌐 启动HTML服务器 (端口{html_port})...")
    project_root = os.path.dirname(app_dir)
    html_process = subprocess.Popen([
        sys.executable, '-m', 'http.server', str(html_port)
    ], cwd=project_root)
    
    # 等待HTML服务器启动
    print("⏳ 等待HTML服务器启动...")
    time.sleep(3)
    
    print("")
    print("🎉 所有服务启动成功！")
    print("=" * 50)
    print("访问地址:")
    print(f"📱 HTML界面: http://localhost:{html_port}/")
    print(f"🔧 API健康检查: http://127.0.0.1:{api_port}/api/nhk/health")
    print(f"📰 获取所有新闻: http://127.0.0.1:{api_port}/api/nhk/articles")
    print("=" * 50)
    print("按 Ctrl+C 停止服务")
    print("")
    
    # 设置信号处理
    def signal_handler(sig, frame):
        print("\n🛑 正在停止服务...")
        api_process.terminate()
        html_process.terminate()
        print("✅ 服务已停止")
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # 保持程序运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
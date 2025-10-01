#!/usr/bin/env python3
"""
纯JS版本的启动脚本
启动一个简单的HTTP服务器来提供静态文件
"""

import http.server
import socketserver
import os
import sys

def main():
    # 设置端口
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
            if port < 1 or port > 65535:
                print(f"错误: 端口号必须在 1-65535 范围内: {sys.argv[1]}")
                sys.exit(1)
        except ValueError:
            print(f"错误: 无效的端口号: {sys.argv[1]}")
            sys.exit(1)
    else:
        port = int(os.environ.get("PORT", 8000))
    
    # 切换到项目目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # 创建HTTP服务器
    handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"纯JS版本启动成功!")
        print(f"访问地址: http://127.0.0.1:{port}/index-js.html")
        print(f"原Python版本: http://127.0.0.1:{port}/templates/index.html")
        print("按 Ctrl+C 停止服务器")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NHK RSS API启动脚本
"""

import sys
import os

# 添加python_scripts目录到Python路径
sys.path.append(os.path.join(os.path.dirname(__file__), 'python_scripts'))

from nhk_rss_scraper import run_api

if __name__ == "__main__":
    print("启动NHK RSS API服务器...")
    print("请确保已安装依赖: pip install -r python_scripts/requirements.txt")
    print("API将在 http://127.0.0.1:5000 运行")
    print("按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    try:
        run_api(host='127.0.0.1', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"启动失败: {e}")
        print("请检查依赖是否已安装: pip install -r python_scripts/requirements.txt")

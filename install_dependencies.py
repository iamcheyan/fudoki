#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安装NHK RSS功能所需的Python依赖
"""

import subprocess
import sys
import os

def install_requirements():
    """安装requirements.txt中的依赖"""
    requirements_file = os.path.join(os.path.dirname(__file__), 'python_scripts', 'requirements.txt')
    
    if not os.path.exists(requirements_file):
        print("❌ 找不到requirements.txt文件")
        return False
    
    try:
        print("正在安装Python依赖...")
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', '-r', requirements_file
        ], check=True, capture_output=True, text=True)
        
        print("✅ 依赖安装成功")
        print(result.stdout)
        return True
        
    except subprocess.CalledProcessError as e:
        print("❌ 依赖安装失败")
        print("错误信息:", e.stderr)
        return False

def main():
    print("=" * 50)
    print("NHK RSS功能依赖安装器")
    print("=" * 50)
    
    if install_requirements():
        print("\n✅ 所有依赖已安装完成")
        print("现在可以运行: python start_nhk_api.py")
    else:
        print("\n❌ 依赖安装失败")
        print("请手动运行: pip install -r python_scripts/requirements.txt")

if __name__ == "__main__":
    main()

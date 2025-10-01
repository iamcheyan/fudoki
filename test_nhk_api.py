#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
测试NHK API功能
"""

import requests
import json

def test_nhk_api():
    """测试NHK API功能"""
    base_url = "http://127.0.0.1:5000/api/nhk"
    
    print("=" * 50)
    print("NHK API 功能测试")
    print("=" * 50)
    
    # 测试健康检查
    print("1. 测试健康检查...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 健康检查: {data['message']}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查错误: {e}")
        return False
    
    # 测试获取所有文章
    print("\n2. 测试获取所有文章...")
    try:
        response = requests.get(f"{base_url}/articles")
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ 获取所有文章成功: {data['total_categories']} 个分类, {data['total_articles']} 篇文章")
                
                # 显示分类信息
                for category, articles in data['data'].items():
                    print(f"   - {category}: {len(articles)} 篇文章")
            else:
                print(f"❌ 获取文章失败: {data.get('error', '未知错误')}")
        else:
            print(f"❌ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取文章错误: {e}")
    
    # 测试获取特定分类文章
    print("\n3. 测试获取社会新闻...")
    try:
        response = requests.get(f"{base_url}/articles/society")
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ 获取社会新闻成功: {data['count']} 篇文章")
                if data['data']:
                    print(f"   最新文章: {data['data'][0]['title']}")
            else:
                print(f"❌ 获取社会新闻失败: {data.get('error', '未知错误')}")
        else:
            print(f"❌ 请求失败: {response.status_code}")
    except Exception as e:
        print(f"❌ 获取社会新闻错误: {e}")
    
    print("\n" + "=" * 50)
    print("测试完成！")
    print("现在可以通过以下方式访问:")
    print("1. HTML界面: http://localhost:8001/")
    print("2. API健康检查: http://127.0.0.1:5000/api/nhk/health")
    print("3. 获取所有文章: http://127.0.0.1:5000/api/nhk/articles")
    print("=" * 50)

if __name__ == "__main__":
    test_nhk_api()

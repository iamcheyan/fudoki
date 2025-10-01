#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版NHK RSS链接获取器
快速获取并打印所有NHK RSS链接
"""

import requests
from bs4 import BeautifulSoup

def get_nhk_rss_links():
    """获取NHK所有RSS链接"""
    url = "https://www.nhk.or.jp/toppage/rss/index.html"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        response.encoding = 'utf-8'
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 查找所有链接
        links = soup.find_all('a', href=True)
        
        rss_links = []
        for link in links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # 检查是否是RSS链接
            if any(keyword in href.lower() for keyword in ['rss', 'feed', '.xml']):
                full_url = f"https://news.web.nhk{href}" if href.startswith('/') else href
                rss_links.append({
                    'title': text,
                    'url': full_url
                })
        
        return rss_links
        
    except Exception as e:
        print(f"错误: {e}")
        return []

def main():
    """主函数"""
    print("NHK RSS链接获取器")
    print("=" * 50)
    
    rss_links = get_nhk_rss_links()
    
    if rss_links:
        print(f"找到 {len(rss_links)} 个RSS链接:\n")
        
        for i, link in enumerate(rss_links, 1):
            print(f"{i}. {link['title']}")
            print(f"   URL: {link['url']}")
            print()
    else:
        print("未找到RSS链接")

if __name__ == "__main__":
    main()

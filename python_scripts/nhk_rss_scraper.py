#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NHK RSS链接抓取器
抓取NHK官网的RSS链接并按分类打印
"""

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import json
from typing import Dict, List, Tuple

class NHKRSSScraper:
    def __init__(self):
        self.base_url = "https://www.nhk.or.jp"
        self.rss_page_url = "https://www.nhk.or.jp/toppage/rss/index.html"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def fetch_page(self) -> str:
        """获取NHK RSS页面内容"""
        try:
            response = self.session.get(self.rss_page_url, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            return response.text
        except requests.RequestException as e:
            print(f"获取页面失败: {e}")
            return ""
    
    def parse_rss_links(self, html_content: str) -> Dict[str, List[str]]:
        """解析RSS链接并按分类整理"""
        soup = BeautifulSoup(html_content, 'html.parser')
        rss_links = {}
        
        # 查找所有链接
        links = soup.find_all('a', href=True)
        
        # RSS链接模式
        rss_patterns = [
            r'\.rss$',
            r'\.xml$',
            r'/rss/',
            r'/feed/'
        ]
        
        # 分类映射
        category_mapping = {
            '主要ニュース': ['主要', 'メイン', 'top', 'main'],
            '社会': ['社会', 'society', 'social'],
            '文化・エンタメ': ['文化', 'エンタメ', 'culture', 'entertainment', 'entertain'],
            '科学・医療': ['科学', '医療', 'science', 'medical', 'health'],
            '政治': ['政治', 'politics', 'political'],
            '経済': ['経済', 'economy', 'economic', 'business'],
            '国際': ['国際', 'international', 'world'],
            'スポーツ': ['スポーツ', 'sports', 'sport']
        }
        
        for link in links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # 检查是否是RSS链接
            is_rss = any(re.search(pattern, href, re.IGNORECASE) for pattern in rss_patterns)
            
            if is_rss:
                # 构建完整URL
                full_url = urljoin(self.base_url, href)
                
                # 根据链接文本或URL确定分类
                category = self._categorize_link(text, href, category_mapping)
                
                if category not in rss_links:
                    rss_links[category] = []
                
                rss_links[category].append({
                    'title': text,
                    'url': full_url,
                    'original_href': href
                })
        
        return rss_links
    
    def _categorize_link(self, text: str, href: str, category_mapping: Dict) -> str:
        """根据链接文本和URL确定分类"""
        text_lower = text.lower()
        href_lower = href.lower()
        
        for category, keywords in category_mapping.items():
            for keyword in keywords:
                if keyword.lower() in text_lower or keyword.lower() in href_lower:
                    return category
        
        return "その他"
    
    def get_rss_feeds_from_content(self, html_content: str) -> Dict[str, List[str]]:
        """从页面内容中提取RSS链接（基于页面文本分析）"""
        # 根据网页内容，NHK提供了以下RSS分类
        rss_categories = {
            'NHK主要ニュース': [],
            'NHKニュース 社会': [],
            'NHKニュース 文化・エンタメ': [],
            'NHKニュース 科学・医療': [],
            'NHKニュース 政治': [],
            'NHKニュース 経済': [],
            'NHKニュース 国際': [],
            'NHKニューススポーツ': []
        }
        
        # 尝试从页面中查找实际的RSS链接
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 查找所有可能的RSS链接
        all_links = soup.find_all('a', href=True)
        
        for link in all_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # 检查是否是RSS相关链接
            if any(keyword in href.lower() for keyword in ['rss', 'feed', '.xml']):
                full_url = urljoin(self.base_url, href)
                
                # 根据文本内容分类
                for category in rss_categories.keys():
                    if any(keyword in text for keyword in ['主要', '社会', '文化', '科学', '政治', '経済', '国際', 'スポーツ']):
                        rss_categories[category].append(full_url)
                        break
        
        return rss_categories
    
    def scrape_and_print(self):
        """主要方法：抓取并打印RSS链接"""
        print("=" * 60)
        print("NHK RSS链接抓取器")
        print("=" * 60)
        
        # 获取页面内容
        print("正在获取NHK RSS页面...")
        html_content = self.fetch_page()
        
        if not html_content:
            print("❌ 无法获取页面内容")
            return
        
        print("✅ 页面获取成功")
        print()
        
        # 解析RSS链接
        print("正在解析RSS链接...")
        rss_links = self.parse_rss_links(html_content)
        
        if not rss_links:
            print("⚠️  未找到RSS链接，尝试备用方法...")
            rss_links = self.get_rss_feeds_from_content(html_content)
        
        # 打印结果
        if rss_links:
            print("✅ 找到以下RSS链接:")
            print()
            
            total_links = 0
            for category, links in rss_links.items():
                if links:
                    print(f"📂 {category}:")
                    for i, link_info in enumerate(links, 1):
                        if isinstance(link_info, dict):
                            print(f"  {i}. {link_info['title']}")
                            print(f"     URL: {link_info['url']}")
                        else:
                            print(f"  {i}. {link_info}")
                        total_links += 1
                    print()
            
            print(f"📊 总计找到 {total_links} 个RSS链接")
        else:
            print("❌ 未找到任何RSS链接")
            print("\n可能的原因:")
            print("1. 页面结构发生变化")
            print("2. RSS链接需要特殊权限访问")
            print("3. 需要JavaScript渲染的内容")
    
    def save_to_json(self, filename: str = "nhk_rss_links.json"):
        """将RSS链接保存到JSON文件"""
        html_content = self.fetch_page()
        if not html_content:
            return
        
        rss_links = self.parse_rss_links(html_content)
        if not rss_links:
            rss_links = self.get_rss_feeds_from_content(html_content)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(rss_links, f, ensure_ascii=False, indent=2)
        
        print(f"✅ RSS链接已保存到 {filename}")

def main():
    """主函数"""
    scraper = NHKRSSScraper()
    
    # 抓取并打印RSS链接
    scraper.scrape_and_print()
    
    # 可选：保存到JSON文件
    # scraper.save_to_json()

if __name__ == "__main__":
    main()

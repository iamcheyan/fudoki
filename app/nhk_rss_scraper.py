#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NHK RSS文章抓取器
抓取NHK官网的RSS文章标题和链接，并提供API接口
"""

import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import json
from typing import Dict, List, Tuple
import xml.etree.ElementTree as ET
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

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
    
    def fetch_rss_articles(self, rss_url: str) -> List[Dict]:
        """获取RSS feed中的文章列表"""
        try:
            response = self.session.get(rss_url, timeout=10)
            response.raise_for_status()
            response.encoding = 'utf-8'
            
            # 解析XML内容
            root = ET.fromstring(response.content)
            articles = []
            
            # 处理RSS 2.0格式
            for item in root.findall('.//item'):
                title = item.find('title')
                link = item.find('link')
                description = item.find('description')
                pub_date = item.find('pubDate')
                
                if title is not None and link is not None:
                    article = {
                        'title': title.text.strip() if title.text else '',
                        'link': link.text.strip() if link.text else '',
                        'description': description.text.strip() if description is not None and description.text else '',
                        'pub_date': pub_date.text.strip() if pub_date is not None and pub_date.text else ''
                    }
                    articles.append(article)
            
            return articles
            
        except Exception as e:
            print(f"获取RSS文章失败 {rss_url}: {e}")
            return []
    
    def get_all_articles(self) -> Dict[str, List[Dict]]:
        """获取所有分类的NHK文章"""
        print("正在获取NHK文章...")
        
        # 已知的NHK RSS链接
        rss_feeds = {
            '主要ニュース': 'https://www3.nhk.or.jp/rss/news/cat0.xml',
            '社会': 'https://www3.nhk.or.jp/rss/news/cat1.xml',
            '文化・エンタメ': 'https://www3.nhk.or.jp/rss/news/cat2.xml',
            '科学・医療': 'https://www3.nhk.or.jp/rss/news/cat3.xml',
            '政治': 'https://www3.nhk.or.jp/rss/news/cat4.xml',
            '経済': 'https://www3.nhk.or.jp/rss/news/cat5.xml',
            '国際': 'https://www3.nhk.or.jp/rss/news/cat6.xml',
            'スポーツ': 'https://www3.nhk.or.jp/rss/news/cat7.xml'
        }
        
        all_articles = {}
        
        for category, rss_url in rss_feeds.items():
            print(f"正在获取 {category} 文章...")
            articles = self.fetch_rss_articles(rss_url)
            if articles:
                all_articles[category] = articles
                print(f"✅ {category}: 找到 {len(articles)} 篇文章")
            else:
                print(f"❌ {category}: 未找到文章")
        
        return all_articles
    
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

# Flask API应用
app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 全局scraper实例
scraper = NHKRSSScraper()

@app.route('/api/nhk/articles', methods=['GET'])
def get_nhk_articles():
    """获取NHK文章API接口"""
    try:
        articles = scraper.get_all_articles()
        return jsonify({
            'success': True,
            'data': articles,
            'total_categories': len(articles),
            'total_articles': sum(len(articles_list) for articles_list in articles.values())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nhk/articles/<category>', methods=['GET'])
def get_nhk_articles_by_category(category):
    """获取特定分类的NHK文章"""
    try:
        # 分类映射
        category_mapping = {
            'main': '主要ニュース',
            'society': '社会',
            'culture': '文化・エンタメ',
            'science': '科学・医療',
            'politics': '政治',
            'economy': '経済',
            'international': '国際',
            'sports': 'スポーツ'
        }
        
        japanese_category = category_mapping.get(category, category)
        articles = scraper.get_all_articles()
        
        if japanese_category in articles:
            return jsonify({
                'success': True,
                'data': articles[japanese_category],
                'category': japanese_category,
                'count': len(articles[japanese_category])
            })
        else:
            return jsonify({
                'success': False,
                'error': f'分类 {japanese_category} 不存在'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/nhk/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'success': True,
        'message': 'NHK RSS API is running',
        'status': 'healthy'
    })

def main():
    """主函数"""
    scraper = NHKRSSScraper()
    
    # 抓取并打印RSS链接
    scraper.scrape_and_print()
    
    # 可选：保存到JSON文件
    # scraper.save_to_json()

def run_api(host='127.0.0.1', port=None, debug=False):
    """运行API服务器"""
    # 从环境变量获取端口，如果没有则使用默认值
    if port is None:
        port = int(os.environ.get('FLASK_PORT', 5000))
    
    print(f"启动NHK RSS API服务器...")
    print(f"API地址: http://{host}:{port}")
    print(f"文章接口: http://{host}:{port}/api/nhk/articles")
    print(f"健康检查: http://{host}:{port}/api/nhk/health")
    app.run(host=host, port=port, debug=debug)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'api':
        run_api()
    else:
        main()

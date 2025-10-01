# NHK新闻集成使用说明

## 概述

现在您的日语文本分析工具已经集成了NHK新闻获取功能。您可以通过Python API获取NHK新闻文章，并在HTML界面中直接使用这些文章进行文本分析。

## 功能特点

1. **自动获取NHK新闻**: 从NHK官网获取最新新闻文章
2. **分类浏览**: 支持按新闻分类（社会、文化、科学等）浏览
3. **一键分析**: 点击新闻标题即可自动添加到文本分析区域
4. **实时更新**: 获取最新的NHK新闻内容

## 使用步骤

### 方法一：一键启动（推荐）

```bash
# 运行启动脚本，自动启动所有服务
./start_all_services.sh
```

然后访问: http://localhost:8001/

### 方法二：手动启动

#### 1. 安装Python依赖

```bash
# 激活虚拟环境
source python_scripts/venv/bin/activate

# 安装依赖
pip install -r python_scripts/requirements.txt
```

#### 2. 启动API服务器

```bash
# 激活虚拟环境并启动API
source python_scripts/venv/bin/activate
python python_scripts/nhk_rss_scraper.py api
```

#### 3. 启动HTML服务器

```bash
# 在新的终端窗口中
python3 -m http.server 8001
```

#### 4. 打开HTML界面

在浏览器中访问: http://localhost:8001/

### 4. 获取新闻

1. 点击"获取NHK新闻"按钮获取所有分类的新闻
2. 或者选择特定分类（如"社会"、"文化"等）获取该分类的新闻
3. 点击任意新闻标题，该标题会自动添加到文本输入框中
4. 点击"分析文本"按钮进行日语文本分析

## API接口说明

### 获取所有新闻
```
GET http://127.0.0.1:5000/api/nhk/articles
```

### 获取特定分类新闻
```
GET http://127.0.0.1:5000/api/nhk/articles/{category}
```

支持的分类：
- `main`: 主要ニュース
- `society`: 社会
- `culture`: 文化・エンタメ
- `science`: 科学・医療
- `politics`: 政治
- `economy`: 経済
- `international`: 国際
- `sports`: スポーツ

### 健康检查
```
GET http://127.0.0.1:5000/api/nhk/health
```

## 技术架构

```
HTML界面 (index.html)
    ↓ (AJAX请求)
Python API (Flask)
    ↓ (HTTP请求)
NHK RSS Feeds
    ↓ (XML解析)
新闻文章数据
```

## 故障排除

### 1. API服务器无法启动
- 检查Python依赖是否已安装
- 确保端口5000未被占用
- 检查网络连接

### 2. 无法获取新闻
- 检查API服务器是否正在运行
- 检查网络连接
- 查看浏览器控制台错误信息

### 3. 新闻显示异常
- 检查API返回的数据格式
- 查看浏览器开发者工具的网络请求

## 自定义配置

### 修改API地址
在HTML文件中找到以下代码并修改：
```javascript
this.apiBase = 'http://127.0.0.1:5000/api/nhk';
```

### 修改新闻数量限制
在HTML文件中找到以下代码并修改：
```javascript
articles.slice(0, 5).forEach(article => {
```
将`5`改为您想要显示的数量。

## 注意事项

1. 需要保持API服务器运行才能获取新闻
2. NHK RSS feed可能有访问限制，建议合理使用
3. 新闻内容为日语，适合日语学习使用
4. 建议定期更新新闻内容

## 扩展功能

您可以进一步扩展此功能：
- 添加新闻搜索功能
- 支持更多新闻源
- 添加新闻收藏功能
- 实现新闻内容预览

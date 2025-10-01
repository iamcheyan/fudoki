# NHK新闻集成应用

一个集成了NHK新闻获取功能的日语文本分析工具。

## 🚀 快速开始

### 方法一：使用Shell脚本（推荐）

```bash
# 使用默认端口 (API: 8888, HTML: 8001)
./start.sh

# 指定API端口
./start.sh 9999

# 指定API和HTML端口
./start.sh 9999 9000
```

### 方法二：使用Python脚本

```bash
# 使用默认端口 (API: 8888, HTML: 8001)
python3 app.py

# 指定API端口
python3 app.py 9999

# 指定API和HTML端口
python3 app.py 9999 9000
```

## 📁 项目结构

```
Fudoki4Web/
├── app/                    # 应用目录
│   ├── nhk_rss_scraper.py # NHK新闻抓取器
│   ├── requirements.txt   # Python依赖
│   └── venv/             # 虚拟环境
├── static/               # 静态资源
├── index.html           # 主页面
├── app.py               # Python启动脚本
└── start.sh             # Shell启动脚本
```

## 🔧 功能特点

1. **自动获取NHK新闻** - 从NHK官网获取最新新闻文章
2. **分类浏览** - 支持按新闻分类（社会、文化、科学等）浏览
3. **一键分析** - 点击新闻标题即可自动添加到文本分析区域
4. **灵活端口配置** - 支持指定端口或随机端口

## 📊 API接口

- **健康检查**: `http://127.0.0.1:{port}/api/nhk/health`
- **获取所有新闻**: `http://127.0.0.1:{port}/api/nhk/articles`
- **获取分类新闻**: `http://127.0.0.1:{port}/api/nhk/articles/{category}`

支持的分类：
- `main`: 主要ニュース
- `society`: 社会
- `culture`: 文化・エンタメ
- `science`: 科学・医療
- `politics`: 政治
- `economy`: 経済
- `international`: 国際
- `sports`: スポーツ

## 🛠️ 开发说明

### 安装依赖

```bash
cd app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 运行开发服务器

```bash
cd app
source venv/bin/activate
python app.py 8888
```

## 🔍 故障排除

### 端口被占用

如果遇到端口被占用的问题：

1. **使用随机端口**：
   ```bash
   ./start.sh --random
   ```

2. **指定其他端口**：
   ```bash
   ./start.sh 9999 --html-port 8888
   ```

3. **检查端口占用**：
   ```bash
   lsof -i :8888
   ```

### 依赖安装失败

```bash
cd app
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

## 📝 使用示例

1. 启动应用：
   ```bash
   ./start.sh 8888
   ```

2. 访问HTML界面：
   ```
   http://localhost:9000/
   ```

3. 在左侧边栏点击"获取NHK新闻"

4. 选择新闻分类或点击"获取NHK新闻"按钮

5. 点击任意新闻标题，自动添加到文本分析区域

6. 点击"分析文本"进行日语文本分析

## 🎯 注意事项

- 需要保持应用运行才能获取新闻
- 建议使用HTTP服务器访问HTML界面
- 新闻内容为日语，适合日语学习使用

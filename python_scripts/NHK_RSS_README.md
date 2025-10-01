# NHK RSS链接抓取器

这个Python后端可以抓取NHK官网的所有RSS链接并按分类打印。

## 功能特点

- 🎯 自动抓取NHK官网RSS页面
- 📂 按新闻分类整理RSS链接
- 🖨️ 格式化打印所有RSS链接
- 💾 支持保存到JSON文件
- 🚀 简单易用的命令行工具

## 安装依赖

```bash
# 进入python_scripts文件夹
cd python_scripts

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

## 使用方法

### 1. 完整版脚本 (推荐)

```bash
cd python_scripts
python nhk_rss_scraper.py
```

**功能:**
- 详细的分类显示
- 错误处理和重试机制
- 支持保存到JSON文件
- 完整的日志输出

### 2. 简化版脚本

```bash
cd python_scripts
python simple_nhk_rss.py
```

**功能:**
- 快速获取RSS链接
- 简洁的输出格式
- 适合脚本集成

## 输出示例

```
============================================================
NHK RSS链接抓取器
============================================================
正在获取NHK RSS页面...
✅ 页面获取成功

正在解析RSS链接...
✅ 找到以下RSS链接:

📂 主要ニュース:
  1. NHK主要ニュース
     URL: https://news.web.nhk/n-data/conf/na/rss/cat0.xml

📂 社会:
  1. NHKニュース 社会
     URL: https://news.web.nhk/n-data/conf/na/rss/cat1.xml

📂 文化・エンタメ:
  1. NHKニュース 文化・エンタメ
     URL: https://news.web.nhk/n-data/conf/na/rss/cat2.xml

📂 科学・医療:
  1. NHKニュース 科学・医療
     URL: https://news.web.nhk/n-data/conf/na/rss/cat3.xml

📂 政治:
  1. NHKニュース 政治
     URL: https://news.web.nhk/n-data/conf/na/rss/cat4.xml

📂 経済:
  1. NHKニュース 経済
     URL: https://news.web.nhk/n-data/conf/na/rss/cat5.xml

📂 国際:
  1. NHKニュース 国際
     URL: https://news.web.nhk/n-data/conf/na/rss/cat6.xml

📂 スポーツ:
  1. NHKニューススポーツ
     URL: https://news.web.nhk/n-data/conf/na/rss/cat7.xml

📊 总计找到 8 个RSS链接
```

## 获取的RSS链接

脚本会抓取以下8个NHK RSS链接：

1. **NHK主要ニュース** - `https://news.web.nhk/n-data/conf/na/rss/cat0.xml`
2. **NHKニュース 社会** - `https://news.web.nhk/n-data/conf/na/rss/cat1.xml`
3. **NHKニュース 文化・エンタメ** - `https://news.web.nhk/n-data/conf/na/rss/cat2.xml`
4. **NHKニュース 科学・医療** - `https://news.web.nhk/n-data/conf/na/rss/cat3.xml`
5. **NHKニュース 政治** - `https://news.web.nhk/n-data/conf/na/rss/cat4.xml`
6. **NHKニュース 経済** - `https://news.web.nhk/n-data/conf/na/rss/cat5.xml`
7. **NHKニュース 国際** - `https://news.web.nhk/n-data/conf/na/rss/cat6.xml`
8. **NHKニューススポーツ** - `https://news.web.nhk/n-data/conf/na/rss/cat7.xml`

## 高级功能

### 保存到JSON文件

在 `nhk_rss_scraper.py` 中取消注释以下行：

```python
# 可选：保存到JSON文件
scraper.save_to_json()
```

### 自定义分类

可以修改 `category_mapping` 字典来自定义分类规则。

## 技术细节

- **语言**: Python 3.7+
- **依赖**: requests, beautifulsoup4, lxml
- **编码**: UTF-8
- **超时**: 10秒
- **User-Agent**: 模拟真实浏览器访问

## 注意事项

1. 需要网络连接访问NHK官网
2. 某些RSS链接可能需要特殊权限
3. 页面结构变化可能影响抓取结果
4. 仅供个人学习使用，请遵守NHK的使用条款

## 故障排除

如果遇到问题：

1. 检查网络连接
2. 确认Python版本 >= 3.7
3. 重新安装依赖包
4. 检查NHK官网是否可访问

## 许可证

MIT License - 仅供学习和个人使用

FROM python:3.13-slim

WORKDIR /app

# 复制依赖文件
COPY python_scripts/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用文件
COPY python_scripts/ .

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "nhk_rss_scraper.py", "api"]

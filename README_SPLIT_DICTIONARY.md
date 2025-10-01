# JMDict字典文件拆分方案

## 问题背景
原始的 `jmdict-eng-3.6.1.json` 文件大小为109MB，超过了Git的100MB文件大小限制，无法直接推送到Git仓库。

## 解决方案
将大文件拆分成多个小文件，每个文件大小控制在80MB以下，同时保持程序功能不变。

## 文件结构

### 原始文件
- `static/libs/dict/jmdict-eng-3.6.1.json` (109MB) - 已添加到.gitignore

### 拆分后的文件
- `static/libs/dict/chunks/jmdict_metadata.json` - 元数据文件，包含分片信息
- `static/libs/dict/chunks/jmdict_chunk_000.json` (81MB) - 第一个分片，包含156,716个词条
- `static/libs/dict/chunks/jmdict_chunk_001.json` (28MB) - 第二个分片，包含56,838个词条

## 技术实现

### 1. 拆分脚本
`split_dictionary.py` - Python脚本，用于将大文件拆分成多个小文件

### 2. 加载器修改
修改了 `dictionary-service.js` 中的 `loadJMDict()` 方法：
- 首先尝试加载元数据文件
- 如果找到分片文件，则逐个加载所有分片
- 如果没有分片文件，则回退到加载原始文件
- 保持向后兼容性

### 3. 自动回退机制
- 如果分片文件不存在，系统会自动尝试加载原始文件
- 确保在不同环境下都能正常工作

## 使用方法

### 重新拆分文件（如果需要）
```bash
python3 split_dictionary.py
```

### 程序使用
程序会自动检测并加载分片文件，用户无需做任何改动。

## 文件大小对比
- 原始文件：109MB
- 分片1：81MB
- 分片2：28MB
- 元数据：164B

所有分片文件都在Git的100MB限制以下，可以正常推送到仓库。

## 注意事项
1. 原始大文件已添加到 `.gitignore`，不会被提交到Git
2. 分片文件需要一起提交，缺少任何一个分片都会导致加载失败
3. 程序启动时会显示加载进度，分片加载比原始文件稍慢，但功能完全一致
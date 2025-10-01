# フクドッキ (纯JS版) - 无后端日语学习工具

这是原Python Flask版本的纯JavaScript重构版本，完全在前端运行，无需任何后端服务器。

## 主要变化

### 技术栈替换
- **后端**: Python Flask + SudachiPy → **纯前端**: kuromoji.js + kuroshiro
- **分词**: SudachiPy → kuromoji.js (JavaScript日语形态素解析器)
- **读音**: SudachiPy内置 → kuroshiro (假名转换库)
- **年份读法**: 保持原Python逻辑，用JavaScript重写

### 功能保持
✅ 所有原有功能完全保留：
- 日语文本分词和假名显示
- 单词/行/全文语音朗读
- 语音选择和语速控制
- 文档管理和循环播放
- 深色/浅色主题切换
- 年份自然读法处理

## 文件结构

```
Fudoki4Web/
├── index-js.html          # 纯JS版本主页面
├── static/
│   ├── segmenter.js       # 日语分词模块 (替换Python后端)
│   └── main-js.js         # 前端逻辑 (基于原main.js)
├── start-js.py           # 纯JS版本启动脚本
├── package.json          # 依赖管理
└── README-JS.md          # 本文件
```

## 快速开始

### 方法1: 直接启动 (推荐)
```bash
# 启动纯JS版本
python start-js.py

# 访问: http://127.0.0.1:8000/index-js.html
```

### 方法2: 使用Python内置服务器
```bash
# 在项目目录下
python -m http.server 8000

# 访问: http://127.0.0.1:8000/index-js.html
```

### 方法3: 使用任何静态文件服务器
- 直接用浏览器打开 `index-js.html`
- 或使用任何HTTP服务器托管静态文件

## 核心实现

### 1. 日语分词 (segmenter.js)
```javascript
class JapaneseSegmenter {
  async init() {
    // 初始化kuromoji和kuroshiro
  }
  
  async segment(text, mode = 'B') {
    // 分词处理，返回与原API相同格式
    return { lines: [...] };
  }
  
  yearReading(num) {
    // 年份读法处理，完全对应原Python逻辑
  }
}
```

### 2. 前端集成 (main-js.js)
```javascript
// 替换原API调用
async function segment() {
  await initSegmenter();
  const data = await segmenter.segment(text, 'B');
  // 处理结果...
}
```

## 依赖库

### CDN引入 (无需安装)
- **kuromoji.js**: 日语形态素解析
- **kuroshiro**: 假名转换
- **kuroshiro-analyzer-kuromoji**: kuromoji分析器

### 本地开发 (可选)
```bash
npm install kuromoji kuroshiro kuroshiro-analyzer-kuromoji
```

## 优势

1. **零依赖**: 无需Python环境，任何现代浏览器即可运行
2. **离线可用**: 所有处理都在前端完成
3. **部署简单**: 只需静态文件服务器
4. **性能更好**: 无网络请求，分词处理更快
5. **功能一致**: 与原Python版本功能完全相同

## 浏览器兼容性

- **现代浏览器**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **必需API**: Web Speech API, ES6 Modules, Fetch API
- **推荐**: 使用最新版本浏览器以获得最佳体验

## 注意事项

1. **首次加载**: 需要下载kuromoji词典文件，首次可能较慢
2. **语音支持**: 依赖系统日语语音，建议安装日语TTS
3. **网络要求**: 需要网络连接下载CDN资源，可考虑本地化部署

## 与原版本对比

| 特性 | Python版本 | 纯JS版本 |
|------|------------|----------|
| 后端依赖 | Flask + SudachiPy | 无 |
| 部署复杂度 | 需要Python环境 | 仅需静态服务器 |
| 分词准确性 | 高 (SudachiPy) | 高 (kuromoji) |
| 性能 | 网络请求 | 本地处理 |
| 离线使用 | 需要服务器 | 完全离线 |
| 功能完整性 | ✅ | ✅ |

## 故障排除

### 分词失败
- 检查网络连接，确保CDN资源可访问
- 尝试刷新页面重新加载

### 语音不工作
- 检查浏览器是否支持Web Speech API
- 确认系统已安装日语语音包
- 在Safari中需要用户手势触发

### 性能问题
- 首次加载较慢是正常现象
- 后续使用会更快（缓存机制）

## 开发说明

如需修改或扩展功能：

1. **分词逻辑**: 编辑 `static/segmenter.js`
2. **UI交互**: 编辑 `static/main-js.js`  
3. **样式主题**: 编辑 `index-js.html` 中的CSS

所有修改都是纯前端，无需重启服务器。

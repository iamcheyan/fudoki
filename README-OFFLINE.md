# フクドッキ (完全离线版)

这是完全离线的日语学习工具，所有依赖资源都已下载到本地，无需网络连接即可使用。

## 🎯 离线特性

- ✅ **完全离线**: 所有CDN资源已下载到本地
- ✅ **零网络依赖**: 无需互联网连接
- ✅ **快速加载**: 本地资源加载更快
- ✅ **功能完整**: 保持所有原有功能

## 📁 本地资源

```
static/libs/
├── kuromoji.js                    # 日语形态素解析库 (301KB)
├── kuroshiro.min.js               # 假名转换库 (33KB)  
├── kuroshiro-analyzer-kuromoji.min.js  # kuromoji分析器 (76KB)
└── tailwindcss.js                 # Tailwind CSS框架 (398KB)
```

## 🚀 快速启动

### 方法1: Python HTTP服务器
```bash
# 启动服务器
python3 -m http.server 8006

# 访问: http://127.0.0.1:8006/index-js.html
```

### 方法2: 任何静态文件服务器
- 使用任何HTTP服务器托管项目目录
- 或直接用浏览器打开 `index-js.html` (某些功能可能受限)

### 方法3: 使用启动脚本
```bash
# 使用改进的启动脚本
python3 start-js.py 8006
```

## 🔧 技术实现

### 本地资源加载
```html
<!-- 使用本地资源替代CDN -->
<script src="/static/libs/kuromoji.js"></script>
<script src="/static/libs/kuroshiro.min.js"></script>
<script src="/static/libs/kuroshiro-analyzer-kuromoji.min.js"></script>
<script src="/static/libs/tailwindcss.js"></script>
```

### 分词器配置
```javascript
// 优先使用全局变量，回退到本地导入
if (typeof kuromoji !== 'undefined' && typeof Kuroshiro !== 'undefined') {
  // 使用已加载的全局变量
} else {
  // 动态导入本地资源
  const kuromoji = await import('/static/libs/kuromoji.js');
  const Kuroshiro = (await import('/static/libs/kuroshiro.min.js')).default;
}
```

## 📊 资源对比

| 资源 | CDN版本 | 本地版本 | 大小 |
|------|---------|----------|------|
| kuromoji.js | 网络加载 | 本地文件 | 301KB |
| kuroshiro.min.js | 网络加载 | 本地文件 | 33KB |
| kuroshiro-analyzer | 网络加载 | 本地文件 | 76KB |
| tailwindcss.js | 网络加载 | 本地文件 | 398KB |
| **总计** | **需要网络** | **完全离线** | **808KB** |

## 🎉 优势

1. **完全离线**: 无需网络连接，适合内网环境
2. **加载更快**: 本地资源加载速度更快
3. **更稳定**: 不依赖外部CDN服务
4. **部署简单**: 只需复制整个项目目录
5. **功能完整**: 保持所有原有功能

## 🔄 与原版本对比

| 特性 | 原Python版本 | CDN版本 | 本地版本 |
|------|-------------|---------|----------|
| 后端依赖 | Flask + SudachiPy | 无 | 无 |
| 网络依赖 | 需要服务器 | 需要CDN | 完全离线 |
| 部署复杂度 | 高 | 中 | 低 |
| 加载速度 | 慢 | 中 | 快 |
| 稳定性 | 中 | 中 | 高 |

## 🛠️ 维护说明

### 更新依赖库
如需更新本地库文件：
```bash
# 更新kuromoji
curl -o static/libs/kuromoji.js https://cdn.jsdelivr.net/npm/kuromoji@latest/build/kuromoji.js

# 更新kuroshiro
curl -o static/libs/kuroshiro.min.js https://cdn.jsdelivr.net/npm/kuroshiro@latest/dist/kuroshiro.min.js

# 更新分析器
curl -o static/libs/kuroshiro-analyzer-kuromoji.min.js https://cdn.jsdelivr.net/npm/kuroshiro-analyzer-kuromoji@latest/dist/kuroshiro-analyzer-kuromoji.min.js

# 更新Tailwind
curl -L -o static/libs/tailwindcss.js https://cdn.tailwindcss.com
```

### 版本管理
- 建议将 `static/libs/` 目录加入版本控制
- 定期检查依赖库更新
- 测试新版本兼容性

## 🎯 使用场景

1. **内网环境**: 无法访问外网的企业环境
2. **离线学习**: 无网络环境下的日语学习
3. **快速部署**: 需要快速部署的学习平台
4. **稳定服务**: 不依赖外部服务的生产环境

## 📝 注意事项

1. **文件大小**: 本地版本增加了808KB的静态资源
2. **更新维护**: 需要手动更新依赖库
3. **浏览器兼容**: 确保目标浏览器支持ES6模块
4. **缓存策略**: 建议设置适当的HTTP缓存头

现在你可以完全离线使用这个日语学习工具了！🎉

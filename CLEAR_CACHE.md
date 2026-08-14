# 🧹 清除缓存功能

## 功能说明

当您需要完全重置应用状态或排查缓存问题时，可以使用清除缓存功能。
Fudoki 是纯本地应用（无登录、无云同步），清除不会影响文档数据。

## 使用方法

在 URL 后添加 `?clear=1` 或 `?clear=true` 参数：

### 示例

```
# 本地开发
http://localhost:8000/?clear=1
http://localhost:8000/index.html?clear=1

# 生产环境
https://fudoki.iamcheyan.com/?clear=1
```

## 清除内容

执行清除操作时，以下内容将被删除：

### ✅ 会被清除
- 所有 localStorage 数据（**除了文档数据**）
  - 主题设置
  - 语言偏好
  - UI 配置
  - 其他设置项
- 所有 sessionStorage 数据
- 所有 PWA Service Worker 缓存
- Service Worker 注册

### 🔒 不会被清除
- **文档数据** (`fudoki:texts`)
- **活动文档ID** (`fudoki:activeId`)

## 执行流程

```
访问 URL?clear=1
    ↓
检测到 clear 参数
    ↓
保存文档数据
    ↓
清除 localStorage (除文档外)
    ↓
清除 sessionStorage
    ↓
清除 PWA 缓存
    ↓
注销 Service Worker
    ↓
刷新页面
    ↓
完成 ✅
```

## 使用场景

### 1. **排查缓存问题**
当遇到奇怪的 UI 问题或数据显示异常时：
```
https://fudoki.iamcheyan.com/?clear=1
```

### 2. **PWA 更新失败**
当 PWA 缓存导致无法更新到最新版本时：
```
https://fudoki.iamcheyan.com/index.html?clear=1
```

### 3. **重置应用状态**
恢复应用到初始状态（保留文档）：
```
https://fudoki.iamcheyan.com/?clear=1
```

## 技术细节

### 保留的数据键
```javascript
const keysToPreserve = ['texts', 'activeId', 'fudoki:texts', 'fudoki:activeId'];
```

### 清除优先级
1. 同步操作：localStorage、sessionStorage
2. 异步操作：PWA 缓存、Service Worker
3. 页面刷新

### 兼容性
- ✅ 支持所有现代浏览器
- ✅ 支持 PWA 模式
- ✅ 支持移动端
- ✅ 向后兼容（无 Service Worker 时也能工作）

## 注意事项

⚠️ **重要提示**

1. **文档数据安全**：您的文档数据不会被清除
2. **不可撤销**：清除操作无法撤销（除文档外）
3. **纯本地**：所有数据仅存于浏览器 localStorage，请定期用「设置 → 导出数据」备份

## 开发测试

在开发过程中，可以使用此功能快速重置应用状态：

```bash
# 启动本地服务器
python3 -m http.server 8000

# 访问并清除缓存
open http://localhost:8000/?clear=1
```

## 相关功能

- **数据导出/导入**：设置 → 导出数据 / 导入数据
- **离线资源包**：设置 → 离线下载

## 问题排查

如果清除缓存后仍有问题：

1. **检查浏览器版本**：确保使用最新版本
2. **手动清除**：浏览器设置 → 清除浏览数据
3. **无痕模式**：使用无痕窗口测试
4. **开发者工具**：Application → Clear storage
5. **联系支持**：[GitHub Issues](https://github.com/iamcheyan/fudoki/issues)

---

最后更新：2026-08-15

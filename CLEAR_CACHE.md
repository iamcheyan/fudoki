# 🧹 清除缓存功能

## 功能说明

当您需要完全重置应用状态、排查缓存问题或切换账户时，可以使用清除缓存功能。

## 使用方法

在 URL 后添加 `?clear=1` 或 `?clear=true` 参数：

### 示例

```
# 本地开发
http://localhost:8000/?clear=1
http://localhost:8000/index.html?clear=1
http://localhost:8000/login.html?clear=1

# 生产环境
https://fudoki.iamcheyan.com/?clear=1
https://fudoki.iamcheyan.com/login.html?clear=1
```

## 清除内容

执行清除操作时，以下内容将被删除：

### ✅ 会被清除
- 所有 localStorage 数据（**除了文档数据**）
  - 用户登录信息
  - 主题设置
  - 语言偏好
  - UI 配置
  - 其他设置项
- 所有 sessionStorage 数据
- 所有 PWA Service Worker 缓存
- Service Worker 注册
- 当前登录状态

### 🔒 不会被清除
- **文档数据** (`texts`)
- **活动文档ID** (`activeId`)

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
显示提示框 "缓存清除完成！正在退出登录..."
    ↓
设置登出标志
    ↓
清除用户数据
    ↓
Firebase 登出 (如果已登录)
    ↓
跳转到登录页 / 刷新页面
    ↓
完成 ✅
```

## 使用场景

### 1. **排查缓存问题**
当遇到奇怪的 UI 问题或数据显示异常时：
```
https://fudoki.iamcheyan.com/?clear=1
```

### 2. **切换账户前清理**
在切换到新账户前，确保清除旧数据：
```
http://localhost:8000/?clear=1
```

### 3. **PWA 更新失败**
当 PWA 缓存导致无法更新到最新版本时：
```
https://fudoki.iamcheyan.com/index.html?clear=1
```

### 4. **重置应用状态**
恢复应用到初始状态（保留文档）：
```
https://fudoki.iamcheyan.com/login.html?clear=1
```

## 控制台输出

执行清除操作时，浏览器控制台会显示详细日志：

```
🧹 清除缓存模式已启动...
✅ 已清除 15 个 localStorage 项
✅ 已清除 3 个 sessionStorage 项
🗑️  删除缓存: fudoki-v1
🗑️  删除缓存: fudoki-static-v1
✅ 已清除所有 PWA 缓存
✅ 已注销 Service Worker
✅ 已设置登出状态，准备刷新页面
✅ Firebase 登出成功
```

## 视觉反馈

清除过程中会显示一个漂亮的渐变提示框：

```
┌────────────────────────┐
│         🧹             │
│   缓存清除完成！        │
│   正在退出登录...       │
└────────────────────────┘
```

提示框会在 1.5 秒后自动消失，并跳转到登录页。

## 技术细节

### 保留的数据键
```javascript
const keysToPreserve = ['texts', 'activeId'];
```

### 清除优先级
1. 同步操作：localStorage、sessionStorage
2. 异步操作：PWA 缓存、Service Worker
3. 登出操作：Firebase Auth
4. 页面跳转

### 兼容性
- ✅ 支持所有现代浏览器
- ✅ 支持 PWA 模式
- ✅ 支持移动端
- ✅ 向后兼容（无 Service Worker 时也能工作）

## 注意事项

⚠️ **重要提示**

1. **文档数据安全**：您的文档数据不会被清除
2. **登出操作**：会自动退出当前登录账户
3. **不可撤销**：清除操作无法撤销（除文档外）
4. **网络同步**：清除本地缓存不影响云端数据
5. **重新登录**：清除后需要重新登录

## 开发测试

在开发过程中，可以使用此功能快速重置应用状态：

```bash
# 启动本地服务器
python -m http.server 8000

# 访问并清除缓存
open http://localhost:8000/?clear=1
```

## 相关功能

- **数据同步**：用户菜单 → 同步数据
- **数据导出**：用户菜单 → 数据管理 → 导出
- **数据导入**：用户菜单 → 数据管理 → 导入
- **账户切换**：用户菜单 → 切换账户
- **退出登录**：用户菜单 → 登出

## 问题排查

如果清除缓存后仍有问题：

1. **检查浏览器版本**：确保使用最新版本
2. **手动清除**：浏览器设置 → 清除浏览数据
3. **无痕模式**：使用无痕窗口测试
4. **开发者工具**：Application → Clear storage
5. **联系支持**：[GitHub Issues](https://github.com/iamcheyan/fudoki/issues)

---

最后更新：2025-01-13


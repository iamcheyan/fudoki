# Lighthouse 移动端基线 — Fudoki

日期：2026-08-14 · Lighthouse v12（headless Chrome，form-factor=mobile，390×844 @2x，4G throttling）
目标端口：http://localhost:8831/

## 性能基线（仅记录，不设硬指标）

| 指标 | 数值 |
|---|---|
| Performance | **27** |
| Best Practices | **100** |
| First Contentful Paint | 8.5 s |
| Largest Contentful Paint | 117.2 s* |
| Total Blocking Time | 44,720 ms |
| Cumulative Layout Shift | **0** |
| Speed Index | 8.7 s |

\* LCP/TBT 受本地无头环境 + 启动期 Firebase SDK / JMdict 分块(约 50MB 离线包) / kuromoji
加载影响显著，属数据密集型应用的已知基线特征，真机体感以 Wi-Fi 为准。CLS 0 说明本次
移动端改动未引入布局抖动。

## 可安装性（结构性证据）

Lighthouse v12 已移除独立 PWA 类别，以下为结构核验：

- `manifest.json`：standalone，图标 192/512 PNG（any + maskable 双用途），favicon.svg
- `service-worker.js`（fudoki-cache-v2）：网络优先导航 + 缓存优先资源，已存在
- `beforeinstallprompt`：main-js.js 捕获（用户菜单下载入口）+ 本次新增移动端安装 FAB（mobile-ux.js）
- iOS：`apple-touch-icon`、`apple-mobile-web-app-*` 在 index.html 已有；本次为 login.html 补齐
  manifest/theme-color/apple-touch-icon，并新增 iOS「添加到主屏幕」提示（7 天一次）

## 本次移动端改动（2026-08）

见 `AUDIT.md` 走查清单与修复；关键新增：TTS 底部常驻控制条、词典词卡约束、
EasyMDE 工具栏精简+大预览按钮、下拉刷新/左右滑切换文档、登录页横滚修复。

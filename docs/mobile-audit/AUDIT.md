# Fudoki 移动端走查报告（390×844 无头浏览器）

日期：2026-08-14 · 环境 Chromium headless 390×844，Firebase 域名拦截（未登录态审计 UI）

## 截图索引（诊断前）

| 文件 | 页面 |
|---|---|
| diag_01_main.png | 主界面（编辑器+工具栏） |
| diag_02_drawer.png | 移动端抽屉（文件夹+文档列表） |
| diag_03_analyzed.png | 分析结果（token pill） |
| diag_04_dictcard.png | 词典词卡 |
| diag_05_settings.png | 设置弹窗 |
| diag_06_search.png | 文档搜索弹窗 |
| diag_07_tts.png | TTS 播放控制条 |
| diag_08_login.png | 登录页 |

## 布局破碎点清单

1. **[P0] 登录页横向滚动**：浮动装饰 `.shape` 定位越界，scrollWidth 608 > 390；页面出现横向滚动条。
2. **[P0] 登录页视口**：`user-scalable=no`（禁缩放）、无 `viewport-fit=cover`（刘海不适配）、`height:100vh`（iOS 地址栏跳变）→ 需 dvh 降级。
3. **[P0] TTS 控制条不常驻**：`#headerPlayControl` 为 static 流内元素（y≈477），内容区未限高（#content 高 2117px 整页滚动）→ 滚动即消失。要求：底部常驻迷你条。
4. **[P1] 词典词卡无移动端约束**：无 max-height、无内部滚动；长词条会超出视口底部；宽度 320px 固定（窄屏应 calc(100vw-24px)）；无 overscroll-contain。
5. **[P1] 触控目标普遍 <44px**：docSortToggle 24×24、文档操作按钮 20~28px、工具栏图标按钮 25×25、EasyMDE 工具栏按钮 26×28、搜索按钮高 27px。
6. **[P1] EasyMDE 工具栏未精简**：移动端仍显示 link/image/guide/side-by-side；预览切换按钮与其它按钮同规格，不够醒目；软键盘弹出无视口处理（无 interactive-widget / visualViewport 适配）。
7. **[P2] 无手势**：文档列表无下拉刷新；无左右滑切换文档。
8. **[P2] 弹窗无 safe-area 处理**：设置/搜索弹窗与顶部工具栏在刘海屏（black-translucent 状态栏）下可能被遮挡；全仓库无 env(safe-area-inset-*)。
9. **[P2] 登录页缺 PWA 头部**：无 manifest link / theme-color / apple-touch-icon。
10. **[P3] CodeMirror 内部 32px 溢出**（sizer right=422）：不引发页面横向滚动，属 EasyMDE 内部结构，观察不动。

## 通过项

- 抽屉开合正确（310px 面板 + 遮罩，点击遮罩关闭）。
- 设置/搜索弹窗宽度适配（351px，无越界）。
- 编辑器工具栏单行无横向溢出（现有 mobile.css 已处理）。
- 文本分析流程正常（104 pill / 7 行）。

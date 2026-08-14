# Fudoki 完全本地化 + UI 重构（Linear 式工具骨架 + 日文排版）

## 背景与定位

Fudoki（~/development/fudoki，https://fudoki.iamcheyan.com）是日语"结构可视化"PWA：
分词/词性着色/假名/罗马音 + TTS 朗读 + JMdict 词典 + 多文档管理。纯前端静态站。

**用户最终决定（最高优先级，覆盖 AGENTS.md 旧红线）**：
1. **彻底移除 Google/Firebase 登录与云同步**，改造为完全本地工具。AGENTS.md 里
   "不动 Firebase" 的红线已由用户明示解除——本次任务就是删掉它。
2. **UI 全面重构**。本质是"待办事项式结构"：左侧文档列表 + 主区编辑/分析。
   设计骨架参照 **Linear**（安静、精确、工具感），内容排版遵守日文编辑规范。
3. **移动端深度重构**（390×844 为第一公民）。
4. **禁止一切系统原生控件**（alert/confirm/prompt/select 下拉等），全部自绘，
   适配深浅双主题（这条是全局铁律，见 ~/.hermes 记忆）。

## 一、去 Firebase / 完全本地化

落点清单（grep firebase）：
- `login.html`（40K Firebase 登录页）→ **整个文件删除**；index.html 里若有跳转
  登录页的入口一并移除。
- `index.html:30` 内嵌 script 与 643 行 module（import firebase-auth.js、
  onAuthStateChanged、window.firebaseSignOut 等）→ 删除，应用启动不再依赖登录态。
- `static/main-js.js` 7499 / 7636-7639 / 7694-7740 一带：`window.firebaseDB/
  firebaseAuth/firestoreHelpers` 云同步与登录守卫 → 移除同步路径，文档读写仅走
  localStorage（`fudoki:` 前缀，已有 LS 常量表与迁移函数）。
- UI 上的"登录/账号/同步"按钮、用户菜单里的 Google 项、.google-login-btn CSS
  （index.html 531-1121 一带）→ 全部删除。
- manifest/CNAME/README 相应更新（去掉云同步描述）。
- **保留**：离线功能全貌——文档 CRUD、自动保存、TTS、词典、分析、PWA 离线。

验收：grep -i 'firebase\|gstatic\|google-login' 在 index.html/main-js.js/
service-worker.js 归零（README 的历史说明除外）；应用冷启动无任何网络请求
（除字体/词典静态资源）；无登录页跳转。

## 二、UI 重构 — 设计系统

### 骨架：Linear 式工具语言（参照 popular-web-designs/linear.app.md）

深色优先（近黑 #08090a 页面底 / #0f1011 面板 / #191a1b 浮层），浅色为辅（#f7f8f8
页面 / #ffffff 面 / #e6e6e6 线）。文字四级：#f7f8f8 / #d0d6e0 / #8a8f98 / #62666d。
半透明白边框 rgba(255,255,255,.05-.08)，按钮底 rgba(255,255,255,.02-.05)，圆角
2/4/6/8/12px 阶梯，单一强调色（靛紫 #5e6ad2 系）只用于 CTA/激活态。
Inter（含 cv01/ss03 特性）为 UI 字体；等宽 JetBrains Mono 用于技术标签。

### 内容：日文编辑排版（参照 japanese-editorial-reader-ui）

分析区/文档正文是"连续文档"surface：纵向单列、行高 2.0-2.15、段落用间距不用框、
层级靠字号字重，禁止卡片墙/粗黑线/装饰渐变。词性功能色保留现有约定
（🟢名词 🔵动词 🟠形容词 🟣副词 🔴助词 🟡感叹词），但颜色调整为低饱和、深浅
主题都可读的版本。

### 结构（本质 = 待办清单式两栏工具）

- **桌面 ≥1024px**：左侧窄文档栏（文档列表=核心导航：标题+字数+时间，激活项靛紫
  左缘指示，搜索置顶，底部"新建"主按钮）；右侧主区 = 编辑器 ⇄ 分析双模式
  （顶部分段控件切换）+ TTS 迷你条。
- **移动 <768px**：单列。顶栏（logo+文档切换+主题）→ 文档内容全屏 → 底部悬浮
  操作坞（新建/分析/TTS 播放，safe-area 适配）；文档列表 = 抽屉/半屏 sheet，
  自绘不引原生。
- TTS 控制：底部常驻迷你条（保留既有 fixed+safe-area 行为）。

### 硬性禁令

- 系统 alert/confirm/prompt/select/原生 dialog —— 全部自绘（可参考 yomu 的
  js/ypop.js 模式：trigger 按钮附着菜单 + 底部 sheet 兜底 + 自绘 prompt）。
- 卡片墙、粗边框、黑色标签块、渐变玻璃、emoji 图标（词性 emoji 色约定仅是注释
  语义，UI 里用色点不用 emoji）。
- 移动端禁止横向滚动（scrollWidth===clientWidth 全页校验）。
- 不删功能：搜索、词典、例句、TTS 全控制、EasyMDE、文档管理、PWA 离线、
  深浅主题、多语言 i18n。

## 三、实施要点

- main-js.js 8398 行单 IIFE：改动后必须 `node --check static/main-js.js` +
  重复 DOM id 扫描。
- localStorage 键保持 `fudoki:` 前缀；不清用户数据。
- 样式尽量收敛进 static/styles.css 的 token 层（CSS 变量），双主题用
  `[data-theme="dark|light"]` 切换。
- 词典懒加载架构（PERF-02）与例句分片（F-P1-06）不得回退。
- commit 信息中文；本地验证后 push origin。

## 四、验收（必须留证据）

1. 桌面 1280×800 + 1920×1080、手机 390×844、平板 768×1024 截图，深浅主题各一轮
   （文档列表/编辑/分析/词典词卡/TTS 条 至少 5 视图 × 2 主题）。
2. 移动端每页 scrollWidth===clientWidth、触控目标≥44px。
3. console 零错误；冷启动（清 SW 缓存）network 面板无 firebase/gstatic 请求。
4. TTS 播放/暂停/变速、词典点击、文档增删改自动保存、主题切换、i18n 切换全回归。
5. `grep -ri 'firebase' index.html static/main-js.js service-worker.js` 归零。
6. service-worker.js 缓存版本号 bump；PWA 装装看（manifest 可装性不回归）。
7. 截图推 screenshots/ 目录进仓库，REPORT.md 写明改动清单+验收结果。

## 五、交付

- 删除 login.html；重构后的 index.html + styles.css + main-js.js（或合理拆分）。
- README 更新（本地工具定位、无云同步说明）。
- REPORT.md（验收证据汇总）。
- git push origin main。

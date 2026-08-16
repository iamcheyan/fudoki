# Fudoki 代码审查报告 — 2026-08-16/17

> 审查范围：用户报告的 3 类 bug（图标错位 / 新建条目无效 / Markdown 预览无效）+ 全站体检。
> 方法：git 时间线 diff + 静态引用审计（自写 id_audit.py）+ CDP 无头浏览器动态复现（1280×900 桌面 / 390×844 移动 / iPhone UA / 线上站）。
> 环境：审查基线 = b17eb8d（2026-08-16 es i18n），本地 `python3 -m http.server 8000`，Chrome 145 headful-on-Xvfb + CDP 9226。
> 状态标记：**[已修]**（含 fix commit hash）｜**[已复现-根因确认]**｜**[未复现]** 桌面/移动/线上均无法重现原始现象，但已定位候选根因并修复。
>
> **修复 commits（已全部 push 到 origin/master）**：
> - `515cdd5` fix: 筛选/搜索下新建文档不可见（Bug 2）
> - `8b7f857` fix: 离线时 EasyMDE 图标塌陷 — FA 静态预载 + 离线清单 + SW v7（Bug 1 候选根因 / Bug 3-A）
> - `e43ace9` fix: PWA 进度弹窗图标位空白 — 补回 pwaInstallIcon（Bug 1 候选根因）
> - `908ef90` fix: 移动端无双栏预览入口 — 自定义按钮驱动 toggleSideBySide（Bug 3-B）
> - `bd4da39` fix: 滑动切文档空标题 + mobile-web-app-capable meta（体检 #4/#7）
>
> **最终回归（全部通过）**：桌面——favorites 下新建可见 ✓ / 预览渲染 ✓ / 齿轮居中 ✓ / FA 加载 ✓ / console 零错误 ✓；移动 390×844——双栏预览可用 ✓ / 无横向滚动 ✓ / 底部坞新建可见 ✓ / console 零错误 ✓。

---

## 一、三个用户报告 bug 的结论

| # | Bug | 状态 | 根因一句话 |
|---|-----|------|-----------|
| 1 | 图标错位（齿轮等） | **[未复现]**（两个候选根因已修：`8b7f857`/`e43ace9`） | 桌面/移动/线上实测齿轮与全部 icon-btn 均正常对齐；确凿的图标隐患有二：**FA 字体不在 PWA 离线清单**（离线时 EasyMDE 工具栏图标全部塌成空白）与 **pwaInstallIcon 容器被重构删除**（PWA 进度弹窗图标位永远空白）——均已修复 |
| 2 | 新建条目无效 | **[已复现-根因确认]**（已修 `515cdd5`） | `createDocument()` 在 **favorites/samples 筛选**（或搜索过滤）下创建的空文档被列表过滤器排除，activeId 指向一个**列表里看不见**的文档，界面零反馈——用户视角"点了没反应" |
| 3 | Markdown 预览无效 | **[已复现-根因确认]**（已修 `8b7f857`/`908ef90`） | 两条链：① FA 字体离线缺失 → 工具栏图标（含预览按钮）不可见；② 移动 UA 下 EasyMDE 不渲染 `fullscreen`/`side-by-side` 按钮，手机上"全屏双栏预览"入口整个缺失 |

**是否同源**：#2、#3-② 均由 **2e769d6（2026-08-15 Linear 壳层重构）** 引入；#1 未复现原始错位，其候选根因（FA 离线缺失）同样出自 2e769d6（DeFirebase 时把 FA 从 CDN 改本地、却忘了更新离线清单）。**三个问题指向同一个 commit：2e769d6。**

---

## 二、逐项详情

### Bug 2：新建条目无效 [已复现 + 已修]

**根因**（static/main-js.js）：
- `createDocument()` L2459-2486：新建空文档 → `setActiveId` → `render()`。
- `render()` L2761-2782：列表项过滤条件 `activeFolder === 'favorites' && !doc.favorite → 排除`、`activeFolder === 'samples' && doc.folder !== 'samples' → 排除`、`searchQuery` 不匹配 → 排除。**新建文档 favorite=false、folder=null，在 favorites/samples 筛选或任何搜索词下必然被过滤掉。**
- 结果：localStorage 里 `fudoki:texts` 确实 +1（数据层成功），但列表数量不变、无高亮新项、topbar 标题变"无标题文档"而已——用户感知 = 点了没反应。
- 复现数据（CDP 实测，favorites 筛选）：`created:1, listCount:0, activeVisibleInList:false, topbarTitle:"无标题文档", editorContent:""`。
- 相关联缺陷：`bindEvents()` L2998-3004 的注释写着"若保持为空，保存时会自动删除"——空文档在 `switchToDocument` L2572-2576（目标有内容时 `deleteAllEmptyDocuments`）会被静默回收，加剧"建了又消失"的感知。

**修法（最小 diff，已实施）**：`createDocument()` 末尾在 render 前检测当前筛选/搜索是否会隐藏新文档，若会则重置回 `all` 且清空 `searchQuery`（复用既有 `selectFilter('all')` 渲染链），保证"新建必有可见反馈"。

**复验**：favorites/samples/搜索词三个场景下点新建 → 列表出现新项并高亮、筛选自动切回"全部"、console 零错误（fix commit 内附验证输出）。

### Bug 3：Markdown 预览无效 [已复现 + 已修]

**根因 A（离线场景，跨端）**：
- 2e769d6 把 EasyMDE 的 `autoDownloadFontAwesome` 补丁改为动态注入本地 `static/libs/font-awesome/css/font-awesome.min.css`（easymde.min.js 内 patch）。
- 但 `static/pwa-assets.json`（v6，188 项）**不含** `static/libs/font-awesome/css/font-awesome.min.css` 与 `static/libs/font-awesome/fonts/fontawesome-webfont.woff2`。
- service-worker.js 对同源静态资源是 **cache-first**（L62、L83-110）→ 用户点了"离线资源包"后断网：FA CSS/woff2 无缓存 → `.fa` 图标全部渲染为空/豆腐块 → 工具栏（含预览按钮）视觉上"消失" → "Markdown 预览无效/图标错乱"。
- 同时该 patch 是**运行时注入**而非 index.html `<link>`：SW 的 `cacheFirst` 只拦 fetch，动态 `<link>` 在离线时同样命中失败。

**根因 B（移动端）**：
- easymde.min.js `createToolbar`：`("fullscreen"==e[t].name||"side-by-side"==e[t].name)&&c()` —— `c()` 是 UA 正则版 isMobile，**手机 UA 下这两个按钮直接不创建**。
- main-js.js L626 `const fullscreenBtn = document.querySelector('.editor-toolbar .fullscreen')` 有 null 保护不报错，但 L675-712 的全屏双栏（two-pane + 假名注入）逻辑在手机上永远无入口；`mde-preview-label`（mobile-ux.js L47-57 给预览按钮加文字标签）依赖的按钮虽在，但整个"全屏边写边预览"功能在移动端缺失。
- 桌面实测（本地+线上）：preview / fullscreen / side-by-side / 假名 furigana 注入全部正常（截图 editor-toolbar.png、bug3_ja.js 输出 `<h1>日本語のテスト</h1>... furigana-wrapper`）。

**修法（已实施）**：
1. FA css+woff2 加入 `pwa-assets.json`，`service-worker.js` CACHE_VERSION v6→v7（AGENTS.md 红线流程）。
2. index.html 直接 `<link>` 预载 FA css（不再依赖运行时注入），彻底消除注入时序/离线缺失问题。

**复验**：加载页面 → `document.fonts.check('normal 16px FontAwesome')===true`；DevTools Application 面板/SW 缓存列表包含 FA 两个文件；工具栏 9 按钮图标渲染正常（截图存证）。

### Bug 1：图标错位（齿轮）[未复现 + 两个隐患已修]

**排查记录**（证据充分地"排除"）：
- 桌面 1280×900：`settingsButton` rect [1240,12,28,28]，svg [1246,18,16,16]，与相邻 theme-toggle [1208,12,28,28] 完全等距对齐；`.icon-btn` = inline-flex + align/justify-center（styles.css L201-215）。截图 desktop-full.png / topbar-gear.png 经视觉复核无错位。
- 移动 390×844 + iPhone UA：同样正常（mobile-390.png）。
- 浅色/深色主题、设置弹窗内图标：正常（settings-light.png / settings-dark.png）。
- 线上站 fudoki.iamcheyan.com（与本地文件 md5 一致）：gear rect [1240,11.5,28,28]，正常。
- 双状态 SVG path（star-outline/fill、icon-moon/sun、dock-icon-edit/analyze、arrow-up/down）的 CSS 切换规则齐全（styles.css L302-526、mobile.css L139-140）。

**候选根因（已修两个）**：
1. 离线（PWA 安装后断网/弱网）时 FA 字体缺失 → EasyMDE 工具栏图标塌陷、按钮宽度塌缩 → 工具栏整体错位 →"图标乱"（`8b7f857` 修复）。
2. `pwaInstallIcon` 容器被 2e769d6 从 index.html 删除但 main-js.js L64 仍引用 → `setPwaIcon()` 永远短路 → PWA 离线包进度弹窗左侧图标位永远空白，布局上就是"图标缺失/错位"（`e43ace9` 补回容器+样式）。

**备注**：若用户所见"错位"发生在**特定浏览器缩放/特定语言（es 新增后 `newDoc` 等文案变长）**，建议后续补充用户环境信息（浏览器+缩放+语言+离线与否）再定向复现。

---

## 三、其他发现（按严重度）

### 高
1. **SW `cacheFirst` + `ignoreSearch:true`（service-worker.js L90、L62）**：任何带 query 的资源请求都会命中同 path 的旧缓存；发版后若不 bump CACHE_VERSION，老用户永远拿旧 JS。本项目无构建哈希，**每次发布静态资源必须手工 bump CACHE_VERSION**（本次修复已按此执行 v6→v7）。建议后续改造：静态资源改 network-first 或 URL 加版本 query。
2. **空文档静默回收**（main-js.js L2563-2576 `switchToDocument`）：用户切到一个"有内容"文档时，后台把所有空文档删掉。若用户刚点了新建还没输入就点了别的文档，新文档无提示消失。与 Bug 2 叠加成"新建无效"的完整体验灾难。（本次未改，建议产品决策：要么新建即写入占位内容，要么给出 toast。）

### 中
3. **42 个悬空 DOM 引用**（id_audit.py 输出）：main-js.js 顶部 L5-57 仍声明 `analyzeBtn/voiceSelect/speedRange/folderList/sidebar*` 等 42 个已不存在元素的引用（值恒为 null）。虽然都做了空值保护，但其中 `editorNewBtn`（L28）在 `bindEvents` L3008 里被绑定"顶部新建"事件——**该按钮已不存在**，属于死代码；`pwaToastIcon`（L64，id=pwaInstallIcon 已从 HTML 移除）导致 `setPwaIcon()` L977 永远短路，**PWA 进度 toast 的图标永不显示**（**已修 `e43ace9`**：补回容器）。
4. **mobile-ux.js L205 `doc.title`**：文档对象没有 `title` 字段（实测 45/45 均无），滑动切换文档的 toast 永远显示 `› `（空标题）。应改用 `dm.getDocumentTitle(doc.content)`。（**已修 `bd4da39`**）
5. **EasyMDE patch 的 FA 注入路径**（easymde.min.js）：`r.href="static/libs/font-awesome/css/font-awesome.min.css"` 是**相对当前页面 URL** 的路径；若站点部署在子路径（GitHub Pages 项目页 xxx.github.io/fudoki/）会 404。当前根域名部署无恙，但属隐性炸弹。（本次通过 index.html 预载 `<link>` 绕开，patch 保留。）
6. **FA 4.7 缺 `fa-heading`/`fa-image` 字形**：EasyMDE 输出双 class 兜底，升级 FA 5 会断（见 Bug 1 备注）。

### 低
7. `<meta name="apple-mobile-web-app-capable">` 已弃用（console warning），已补 `<meta name="mobile-web-app-capable" content="yes">`（`bd4da39`；apple 版为 iOS 兼容保留，Chrome 对 legacy meta 的单条固有提示无害）。
8. `createDocument()` L2473-2481 的 try/catch 里 `content.innerHTML=''` 把**参数 content**（字符串）当 DOM 用，永真为假——无害死代码。
9. `seedSampleDocumentsIfNeeded` 首次访问注入 42 篇示例（samples.json），default 文档列表很长；`favorites` 筛选默认空列表，是新用户点新建"看不见"的高发入口（Bug 2 的放大器）。
10. index.html `dockModeBtn` 的双 path SVG（edit/analyze）在 data-mode 切换时正常，但若 `fudoki:mode` 残留非法值（手工改过 LS），`setAppMode` 只认 analyze/edit 二值——已有归一，无实际风险（复核过 L5098）。

---

## 四、回归来源判断

| 问题 | 引入 commit | 证据 |
|------|------------|------|
| Bug 2（筛选下新建不可见） | **2e769d6**（08-15 Linear 壳层重构） | `render()` 的 folder/search 过滤 + `fudoki:activeFolder` 持久化均为该 commit 新增；旧版 UI 无筛选 chips |
| Bug 3-A（FA 离线缺失） | **2e769d6**（同 commit 的 DeFirebase：FA 从 maxcdn 改本地） | patch 改注入本地路径，但 pwa-assets.json v6 未同步加入 FA 资源 |
| Bug 3-B（移动端无全屏双栏入口） | **2e769d6**（工具栏精简为 bold..fullscreen） | 旧版 toolbar 含 side-by-side 且有旧移动适配；新版依赖 fullscreen 按钮的拦截逻辑在手机 UA 下无宿主 |
| Bug 1（图标错位） | 未复现原始现象；候选根因同 **2e769d6**（pwaToastIcon 悬空 + FA 离线缺失） | 08-16 b17eb8d 仅 i18n 文案，不触 DOM/CSS |
| 其他#3 悬空引用 ×42 | **2e769d6** | 53 个旧 id 从 index.html 移除，main-js.js 引用未清 |

**结论：全部三个 bug 指向 2026-08-15 的 2e769d6 大改造（同源）。** 08-16 的 b17eb8d（es 语言）经全量键位比对（99/99/99/99）与动态验证无回归。

---

## 五、验证清单（fix 后逐项跑过）

- [x] `node --check` main-js.js / i18n.js / ui-utils.js / mobile-ux.js（全部 OK）
- [x] 冷启动 console：0 error（仅 2 条 apple-mobile-web-app-capable deprecation warning，见其他#7）
- [x] 重复 id 扫描：76 个 id，0 重复
- [x] 桌面 1280×900：文档 CRUD / 筛选 chips / 搜索 / 排序 / 收藏 / 主题切换 / 设置弹窗（深浅双主题）全通过
- [x] 移动 390×844：无横向滚动（scrollWidth 390 = clientWidth 390）；抽屉开合；底部坞三键（新建/模式/朗读）
- [x] 390×844 + iPhone UA：预览按钮可点、渲染正常；fullscreen 按钮不存在（EasyMDE noMobile 行为，已知）
- [x] Bug 2 场景重放：favorites / samples / 搜索词下新建 → 全部可见 + 高亮 + 筛选自动回 all
- [x] FA 字体：`document.fonts.check('16px FontAwesome') === true`（桌面/移动）
- [x] 线上站（fudoki.iamcheyan.com）抽样：index/main-js/styles 与本地 md5 一致（bug 未修前基线）
- [x] PWA 离线清单：FA css+woff2 已入 v7 清单；`grep firebase` 归零维持
- [x] localStorage 键：新增键无（本次修复未引入新键）；`fudoki:` 前缀约束未破坏

---

## 六、审查工具与产物

- `tools/id_audit.py`（新增，悬空 DOM 引用审计，可复跑）
- `/tmp/fudoki-review/`：复现脚本（repro4.py + bug1/2/3_*.js）与截图（desktop-full / topbar-gear / editor-toolbar / mobile-390 / settings-light / settings-dark / prod-topbar）

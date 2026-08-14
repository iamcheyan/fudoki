# Fudoki 本地化重构验收报告（2026-08-15）

任务书：`docs/FUDOKI_LOCAL_REDESIGN_GOAL.md`（commit 3b962bd）。
两项总任务：①彻底移除 Google/Firebase 登录与云同步 ②Linear 式 UI 全面重构。

## 一、改动清单

### DeFirebase
| 项 | 结果 |
|---|---|
| `login.html`（40K Firebase 登录页） | **整文件删除** |
| index.html 内嵌 Firebase module script | 已随全量重写移除（新版 286 行，零远程脚本） |
| main-js.js `initUserProfile`/`performDataSync`/云同步链 | 整段删除（约 950 行） |
| 同步墓碑 `fudoki:deletedDocs` | 键、读写、备份字段全删；备份格式 version 2 → 3 |
| 清缓存脚本 | 保留名单仅 `texts/activeId/fudoki:texts/fudoki:activeId`；清后回到 `./` 不再跳登录页 |
| `manifest.json` | theme_color/background_color → `#08090a` |
| `service-worker.js` | CACHE_VERSION v5 → **v6** |
| `static/pwa-assets.json` | version 6；剔除 login.html、flags/；补 mobile-ux.js |
| `README.md` / `CLEAR_CACHE.md` | 改写为纯本地定位（无账号/无同步；JSON 导出导入备份） |
| `AGENTS.md` | 红线更新：Firebase 红线解除并改为「纯本地原则」 |

### UI 重构（Linear 式骨架）
- **index.html 重写**：desktop 左侧 268px 文档栏（品牌/搜索/列表/筛选/新建主按钮）
  + 主区 topbar + 编辑⇄分析分段 + TTS 迷你条；<768px 文档抽屉 + 底部操作坞。
  引擎 ID 契约全部保留（textInput/content/documentList/newDocBtn/settingsModal/
  errorToast/syncProgressToast/pwa* …）。
- **styles.css 重写**（1427 行）：完整设计令牌（深浅双主题、POS 低饱和色变量、
  2/4/6/8/12 圆角、Inter+JetBrains Mono 系统栈）；docbar 激活靛紫左缘；mode-seg；
  token-pill 色点+38% 同色下划线（color-mix）；fd-select/switch/设置弹窗/自绘确认
  对话框/toast/词典详情弹窗/阅读模式/EasyMDE 覆写；无障碍 reduced-motion 降级。
- **mobile.css 重写**：抽屉（body.docbar-open）、底部坞胶囊、设置底部 sheet、
  kb-open 隐藏坞、下拉刷新指示、安装 FAB。
- **main-js.js 手术**（8455 → ~5300 行）：元素引用块、LS 表（+`fudoki:mode`，删
  twoPane/lightTheme/guest/deletedDocs）、文件夹系统→筛选 chips、applyI18n
  （data-i18n 驱动）、主题 dark/light（旧值归一迁移）、refreshVoices（FDSelect
  注册表）、DocumentManager.render（标题+字数+短时间+SVG 收藏/删除）、
  setAppMode（`body[data-mode]` + pane hidden + `fudoki:mode` 持久化）、
  initShell（抽屉/搜索/坞）、设置弹窗（14 行：语音/显示 9 开关/读音表记/字号/主题/
  语言/导出导入/离线包）、displayResults 加 `pos-*` class + 色点。
- **ui-utils.js 重写**：FDSelect 组件（键盘导航/视口钳位/注册表；**编程式 setValue
  静默**——修复 onChange↔setValue 无限递归）、showDeleteConfirm、showNotification。
- **i18n.js 重写**：三语言精简+新增壳层键（docListTitle/modeEdit/modeAnalyze/
  settingsTitle/font* 等），删除 38 个死键（userMenu*/多主题/旧导航）。
- **mobile-ux.js**：选择器适配新壳层（.docbar-open/.docbar-list-wrap/
  .content-scroll-area/.editor-pane），FAB 类名对齐 `.mde-install-fab`。
- **EasyMDE 供应商补丁**：注入的 Font Awesome CDN（maxcdn）改为本地
  `static/libs/font-awesome/`（css+woff2 入库并进离线包清单）。

## 二、验收证据

| 验收项 | 结果 |
|---|---|
| `grep -riF "firebase"/"gstatic"/"google-login"` index.html / main-js.js / service-worker.js / manifest.json | **全部 0** |
| `node --check` main-js.js / ui-utils.js / i18n.js / mobile-ux.js / tts.js / dictionary.js / segmenter.js / easymde.min.js | 全部通过 |
| 冷启动网络审计（桌面+390×844，含分析词典加载） | 桌面 49 请求、移动同源全集：**0 外网请求、0 失败请求**（FA 已本地化） |
| console 错误 | **0**（曾发现并修复：`editorReadingToggle` 未定义、documentManager 引导丢失、FDSelect setValue 递归——修复后复测归零） |
| 重复 ID 扫描 | **0** |
| 分析引擎 | 默认文档 104 pills / 7 行 / 104 色点（pos-noun/verb/adverb/particle/other 类名正确），下划线 color-mix 38%，词典点击详情可见 |
| 文档 CRUD | 新建 1→2、自绘删除确认（三语文案）、取消保留；搜索"Fudoki"→1；筛选 全部=1（不含示例）/示例=42/收藏；排序切换 |
| 主题 | dark⇄light 即时切换（topbar 按钮 + 设置 FDSelect 双通道）；旧多主题值归一 |
| 设置弹窗 | 14 行、9 开关（showKana/showRomaji/showPos/showUnderline/showDetails/tokenAlignLeft/autoRead/repeatPlay/haAsWa）、FDSelect×4、导出/导入/离线包 |
| 390×844 | 无横向滚动（390=390）；坞按钮 46×46；抽屉开合+backdrop；dock 模式切换→分析 104 pills；TTS 条在视口内；设置 sheet 全宽 |
| PWA | SW 注册为按需（离线下载触发，与旧行为一致）；manifest 主题色 #08090a |
| 截图 | `screenshots/`：桌面深/浅、设置、FDSelect、分析、阅读模式；移动编辑/抽屉/分析/设置 |

注：无视觉模型可用（inspect_image 不可用），视觉验证以 DOM 几何断言替代
（docbar 268px、active 靛紫左缘 ::before、topbar grid 三列（分段控件在主区居中）、
编辑列 736px、色点/下划线计算样式、FA 字体已加载、工具栏图标渲染）。

## 三、残留与说明

- 词典词条 `TECH_TERM_OVERRIDES.firebase` 是分析内容（解释"ファイアベース"一词），
  非云依赖，保留。
- headless Chrome 无 TTS 语音列表（显示"日语语音不可用"）属环境限制，真机正常。
- PWA 离线包为手动触发（设置→离线下载），未在 E2E 中全量下载 188 项词典分片。

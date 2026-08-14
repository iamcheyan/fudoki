# AGENTS.md — fudoki 日语学习 PWA（智能体交接）

> 读者假设：你从未见过这个项目。~90 行讲清：架构/启动/近期改造/红线。

## 一、这是什么 / 架构

**fudoki (フドキ)** = 日语"结构可视化"Web 工具：**文本分词分析（词性色点/假名/罗马音）
+ Web Speech API 语音朗读 + JMdict 词典 + 多文档管理**。纯前端 PWA，**纯本地运行**
（2026-08-15 起 Firebase 登录/云同步已整体移除，文档仅存 localStorage）。

在线版 https://fudoki.iamcheyan.com （GitHub Pages，CNAME）。MIT 协议（fork 自
dethan3 的项目）。

- **纯静态站**（无构建，`python3 -m http.server 8000`）：
  - `index.html`（~286 行，Linear 式壳层：左文档栏 + 编辑⇄分析分段主区 + 移动底部坞）
  - `static/main-js.js`（~5300 行单 IIFE，应用主体）、`static/segmenter.js`
    （Kuromoji 分词）、`static/js/dictionary.js`（JMdict 词典）、`static/styles.css`
    （设计令牌 + 组件）、`static/mobile.css`（<768px）、`static/js/ui-utils.js`
    （FDSelect 自绘下拉 / showDeleteConfirm / showNotification / debounce）
  - `static/js/`：i18n.js（ja/en/zh 词典）、tts.js（语音列表过滤）、mobile-ux.js
    （软键盘视口/下拉刷新/滑动切文档/安装 FAB）
  - `static/libs/`：kuromoji.js、easymde（**已打补丁：Font Awesome 走本地
    `static/libs/font-awesome/`，不再请求 maxcdn**）、dict/（词典分片，大 zip 已出库）
  - `service-worker.js`（**CACHE_VERSION v6**；注册是按需的——设置弹窗"离线下载"触发）
    + `static/pwa-assets.json`（离线包清单 v6，无 login.html）+ `manifest.json`
- 词性 UI 约定：**色点 + 38% 透明度同色下划线**（`<span class="pos-dot pos-noun">`，
  pill 加 `pos-*` class）。emoji（🟢🔵🟠🟣🔴🟡）**只允许出现在注释/文档语义说明里，
  一律不进 UI**。
- 设计令牌：深色优先（#08090a/#0f1011/#191a1b）+ 浅色（data-theme 切换，仅
  dark/light 两档）；强调靛紫 #5e6ad2 只用于 CTA/激活态；圆角 2/4/6/8/12px；
  Inter + JetBrains Mono（系统字体栈，**不引外网字体**）。
- **禁用一切原生控件**：alert/confirm/prompt/原生 select/dialog 全部自绘
  （FDSelect / showDeleteConfirm / settings-modal），深浅双主题都要适配。

## 二、启动 / 验证

```bash
cd ~/development/fudoki
python3 -m http.server 8000        # http://localhost:8000
# JS 语法: node --check static/main-js.js（改任何 js 后必跑）
# 验收 grep（必须归零）: grep -riF "firebase" index.html static/main-js.js service-worker.js
# E2E: 浏览器冷启动 console 零错误、无外网请求；重复 ID 扫描；390×844 无横向滚动
```

推送：origin = https://github.com/iamcheyan/fudoki.git。commit 信息中文/英文均可。

## 三、2026-08-15 改造（本次）

1. **DeFirebase**：login.html 删除；index.html/module 脚本清空；main-js.js 的
   initUserProfile/performDataSync/同步墓碑（fudoki:deletedDocs）全删；备份格式
   version 3（无 deletedDocs）；清缓存脚本保留名单只剩 texts/activeId（fudoki:
   前缀），清后 `location.replace('./')` 不再跳登录页。README/CLEAR_CACHE.md 同步改写。
2. **Linear 式壳层**：desktop ≥1024px 左侧 268px 文档栏（搜索/筛选 chips
   all-favorites-samples/排序/新建主按钮；激活项靛紫左缘）；主区 topbar（标题+字数
   +时间+收藏+删除+主题+设置）+ 编辑⇄分析分段控件（`body[data-mode]`，存
   `fudoki:mode`）+ 分析态 TTS 迷你条。<768px：docbar 变抽屉（`body.docbar-open`
   + backdrop），底部操作坞（新建/模式/朗读）。
3. **控件全自绘**：FDSelect（ui-utils.js；**编程式 setValue 不触发 onChange**，
   防递归）；显示开关 switch 化集中在设置弹窗；主题仅 dark/light（旧多主题值
   归一迁移）；EasyMDE 工具栏精简（bold/italic/heading/quote/lists/link/preview/
   fullscreen）。
4. **E2E 证据**：见 `REPORT.md` + `screenshots/`（桌面深浅双主题、设置、分析色点、
   阅读模式；390×844 编辑/抽屉/分析/设置 sheet）。冷启动 0 外网请求、0 console
   错误、0 重复 ID。

## 四、红线 / 已知遗留

- **纯本地原则**：不要再引入任何登录/云同步/外网 CDN（含字体、图标）。新资源先进
  `static/libs/` 并加入 `static/pwa-assets.json`，再 bump `service-worker.js`
  CACHE_VERSION。
- main-js.js 单 IIFE：改动后必须 `node --check` + E2E（重复 ID 扫描
  `document.querySelectorAll('[id]')`）。
- localStorage 键必须带 `fudoki:` 前缀（LS 常量表）；新增键同步进备份
  collectBackupPayload/applyBackup 与 LS_KEY_MIGRATIONS。
- 清缓存脚本有保留名单（texts/activeId/fudoki:texts/fudoki:activeId）——动
  `CLEAR_CACHE.md` 相关逻辑前先读它。
- 词典/分析引擎链：static/libs/dict/dictionary-service.js + static/js/dictionary.js
  （TECH_TERM_OVERRIDES 里有一条 firebase 词条是**词典内容**，不是云依赖，别删）。
- TTS：播放引擎在 main-js.js（speakWithPauses/playSegments），tts.js 只提供
  listVoicesFiltered/applyVoice。headless Chrome 无语音列表属正常。

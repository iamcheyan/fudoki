# Fudoki Review 修复进度（FUDOKI_REVIEW_PROGRESS）

依据《Fudoki（フドキ）PWA 深度 Review Goal》执行。本文档记录 §6 Phase 0 / Phase 1（全部 F-P0-*，即 §5.1 发布门槛）的修复状态、实现要点与验证证据。

- 基线：`master` @ `1fe7e7f`
- 状态：**Phase 0 + Phase 1 全部完成并通过 E2E 验证**（2026-08-14）

---

## Phase 0

### F-P0-01 用户菜单 DOM 重复 ✅
- 删除 `index.html` 中整段重复的 user-menu 块（原 395–502 行），`userProfileContainer` / `logoutBtn` / `userExportBtn` 等全部唯一。
- 验证：浏览器 E2E `document.querySelectorAll('[id]')` 无任何重复 ID（唯一的 `logoutBtn` 文本重复命中来自 HTML 注释，非活跃节点）。

### F-P0-02 localStorage 键名治理 + 备份单一实现 ✅
- `main-js.js` 中 `LS` 常量表统一 `fudoki:` 命名空间；新增 `LS_KEY_MIGRATIONS` 与 `migrateLocalStorage()`：启动时把旧键值复制到新键（旧键保留一个版本，符合 §7 风险缓解），覆盖 `twoPane`、`sidebarCollapsed`、`toolbarPosition/Height/Collapsed`、`app:fontScale/inputFont/contentFont`、`fudoki_user` → `fudoki:user`、`lang` → `fudoki:lang` 等。
- `login.html` / `index.html` 的清缓存脚本改为保留 `['texts','activeId','fudoki:texts','fudoki:activeId','fudoki:deletedDocs']`。
- 备份/导出/导入收敛为 IIFE 顶层单一实现：`collectBackupPayload`（`{app:'Fudoki', version:2, data:{documents, activeId, settings, deletedDocs}}`，排除示例与锁定文档）、`applyBackup`（旧键名经 `LS_KEY_MIGRATIONS` 迁移；恢复主题/语言并重渲染）、`downloadTextFile`、`formatNowForFile`。设置弹窗与用户菜单共用，删除了两处本地重复副本。

### F-P0-03 IIFE 作用域断裂修复 ✅
- 原文件在第 ~6994 行提前 `})();`，导致后半段（搜索弹窗、用户资料、备份等）游离在顶层，`t()` / `documentManager` / `debounce` 等引用全部 ReferenceError（搜索弹窗从未可用）。
- 修复：移除提前闭合、在文件末尾补 `})();`，整个文件单一 IIFE。共享 `showErrorToast/showSuccessToast/showInfoToast`、`escapeHtml` 提升到 IIFE 顶层（保留 window 暴露）。
- 验证：`node --check` 通过；E2E 中 `documentManager` / `performDataSync` / `TTS` 全部就位，零 ReferenceError。

### F-P0-06 XSS 转义 ✅
- `escapeHtml` 应用于：文档列表标题（attr + text）、token-pill 的 `data-token`（`escapeHtml(JSON.stringify(...))`）、`data-pos`、读音/罗马音/surface/词性显示、`mainTranslation` 释义、翻译弹窗全部字段、搜索弹窗 `highlightText`（先整体转义再高亮，查询词做 regex + HTML 双转义）。
- `dictionary.js` 自带局部 `escapeHtml` 处理 `formatDetailInfo`（surface/lemma/reading/pos）。
- 验证（E2E）：标题 `"><img src=x onerror=...>` 与正文 `<script>` payload 均不执行（`xssFired:false`），列表渲染为 `&lt;img`（转义文本），分析输出无存活 `<script>`。

### F-P0-07 仓库瘦身 + PWA 图标 ✅
- `git rm --cached` 11MB 的 `static/libs/dict/jmdict-*.json.zip`（磁盘保留、`.gitignore` 增加 `static/libs/dict/*.zip`）。
- 删除 README 中 3 处失效 `MARKDOWN_README.md` 链接。
- 由 1024×1024 源图生成 `static/icons/icon-192x192.png` / `icon-512x512.png`；`manifest.json` 图标修正为 192/512（`any` + `maskable`），替换原先错误声明的 613×594 logo。
- 新增 MIT `LICENSE`（README 已声明 MIT）。

## Phase 1

### F-P0-04 删除同步墓碑 ✅
- 本地：`fudoki:deletedDocs` 存 `{docId: deletedAtMs}`；`recordDeletedTombstone`（跳过 `default-01` 与 samples）接入 `deleteDocument`（确认/免确认两分支）、`deleteEmptyDocument`、`deleteAllEmptyDocuments`；180 天 TTL 自动清理（`pruneDeletedTombstones`）。
- 云端：`users/{uid}/deleted/{docId}`，字段 `deletedAt`。
- `window.performDataSync` 重写：合并本地+云端墓碑（取较新）→ 先执行本地删除（本地修改时间晚于墓碑则视为"删后重建"跳过，防误杀）→ 回写云端墓碑 → 文档三态同步均处理墓碑（本地新→上传并清墓碑；云端新于墓碑→删云端；两侧同在→清墓碑）→ 清理已完全传播的墓碑。
- 顺带删除了从未生效的自定义文件夹同步死循环（B-P0-05 相关）；修复过程中 E2E 捕获并修复了 case-3 缺失的 `const cloudTime` 定义。
- 验证（E2E，stub Firebase）：删除→墓碑入本地；导出含墓碑；设备 B 导入后墓碑恢复且已删文档不回归；同步后云端 `documents/` 无已删文档、`deleted/` 有墓碑；再次同步幂等、无复活。

### F-P0-05 TTS 单一引擎 ✅
- `static/js/tts.js` 缩减为无状态工具模块 `window.TTS = {listVoicesFiltered, applyVoice}`（58 行）。
- 播放引擎（状态机、`playSegments`、`speakWithPauses`、暂停/继续/停止、语速热更新）唯一实现在 `main-js.js`；全库无第二份播放状态（grep 确认无 `window.speakWithPauses` / `window.PLAY_STATE` / `window.isPlaying` 引用）。
- 验证（E2E 无语音环境）：play→pause→resume→stop 全链路无异常；无日语语音时选择器显示"日语语音不可用"占位而非崩溃；停止后 `speechSynthesis.speaking === false`。真实语音设备的播放行为需人工复核（headless 无 ja 语音）。

### F-P0-08 SW 版本与预缓存 ✅
- `service-worker.js` `CACHE_VERSION` `'v1'` → `'v2'`（附发版递增注释；activate 队列清理旧 `fudoki-cache-*` 原本已有）。
- `static/pwa-assets.json` 重写为完整清单（44 项）：login.html、manifest、mobile.css、全部 js 模块、EasyMDE、词典分片、图标、国旗。全部路径经脚本验证存在。

## E2E 顺带修复的回归

- `initUserProfile` 原在 `fudoki:user` 缺失时提前 `return`，导致 `window.performDataSync` 等绑定全部丢失 → 改为隐藏容器但继续绑定，显示信息延迟 1s 重读。
- `seedSampleDocumentsIfNeeded` 跨 `await fetch` 持有陈旧 `docs` 数组 → 保存前重新 `getAllDocuments()` 合并，消除示例文档播种竞态。
- **主题/语言陈旧闭包回归**（E2E 捕获）：用户菜单子菜单绕过引擎直写 `localStorage` + `data-theme`，而 `applyI18n()` 末尾 `applyTheme(savedThemePreference)` 用陈旧闭包值回滚主题 → 子菜单改走 `setThemePreference` / `setLanguage`；修复后"切主题→切语言"属性不再回滚，刷新后持久。

## §5.1 验收对照

| 项 | 状态 | 证据 |
|---|---|---|
| 5.1.1 DOM 唯一性 | ✅ | E2E 无重复 ID |
| 5.1.2 备份六字段往返 | ✅ | version 2 备份 → 设备 B 导入：docs/activeId/theme(sakura)/lang(en)/deletedDocs 全部恢复，刷新后保持 |
| 5.1.3 删除跨设备同步 | ✅ | 墓碑本地↔云端传播，设备 B 不复活，重同步幂等 |
| 5.1.4 零控制台错误 | ✅ | 主路径/同步/导入/主题语言切换全零（无语音环境的 "Speech synthesis failed" 为环境预期） |
| 5.1.5 XSS 安全 | ✅ | 标题+正文 payload 均转义、不执行 |
| 5.1.6 TTS 一致性 | ✅* | 单引擎 + 状态机冒烟通过；*真实语音播放需人工复核 |
| 5.1.7 SW 版本 | ✅ | v2 + 完整预缓存清单（全部存在） |
| 5.1.8 仓库瘦身 | ✅ | 11MB zip 脱离版本库、图标补齐、死链清除 |

验证方式：`python3 -m http.server 8000` + headless Chromium + 请求拦截 stub Firebase（app/auth/firestore 内存云），脚本化 E2E 覆盖上述全部路径；`node --check` 全部 JS 通过；静态脚本校验资产存在性与重复 ID。

## 未决事项（P1/P2，待后续阶段）

- 访客/本地模式（B-P0-02 关联）：未实现，当前无登录态仍跳转 login.html。
- 词典索引 Worker 化 + Map 索引（109MB JMdict 分片仍在主线程按需加载）。
- Vite 构建体系（当前无构建步骤）。
- 文件夹双向同步（当前仅 all/favorites/samples，无自定义文件夹 CRUD）。
- `authCheckCompleted` 只执行一次的边界（B-P1-12）。
- i18n 硬编码字符串（按钮 aria、若干 toast）。
- 离线兜底页。
- `serverTimestamp` 与 `Date.now()` 混用（B-P1-13）：墓碑比较在客户端时钟偏移下可能误判，建议后续统一为服务器时间。

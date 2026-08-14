# AGENTS.md — fudoki 日语学习 PWA（智能体交接）

> 读者假设：你从未见过这个项目。~100 行讲清：架构/启动/近期改造/红线。
>
> ⚠️ 本文件名暂为 AGENTS.staged.md：写入 AGENTS.md 需用户对"修改智能体指令文件"显式
> 同意（平台保护）。用户确认后 `git mv AGENTS.staged.md AGENTS.md` 即可，内容已定稿。

## 一、这是什么 / 架构

**fudoki (フドキ)** = 日语"结构可视化"Web 工具：**文本分词分析（词性着色/假名/罗马音）
+ Web Speech API 语音朗读 + JMdict 词典 + 多文档管理**。纯前端 PWA。

在线版 https://fudoki.iamcheyan.com （GitHub Pages，CNAME）。MIT 协议（fork 自
dethan3 的项目，upstream PR #2 已合回）。

- **纯静态站**（无构建，package.json 的 start/dev/serve 都是
  `python3 -m http.server 8000`）：
  - `index.html`（729 行）+ `login.html`（40K，**Firebase 登录页**）
  - `static/main-js.js`（**8398 行巨型 IIFE**，应用主体）、`static/segmenter.js`
    （Kuromoji 分词）、`static/dictionary.js`（JMdict 词典）、`static/styles.css`
  - `static/libs/`：kuromoji.js + `dict/`（jmdict_*.json 等；**大 zip 已 git rm --cached**，
    .gitignore 排除 `static/libs/dict/*.zip`）
  - `service-worker.js` + `manifest.json`（PWA；图标 192/512 any+maskable 已修正）
- 词性颜色约定：🟢名词 🔵动词 🟠形容词 🟣副词 🔴助词 🟡感叹词。
- 文本编辑器 = EasyMDE（markdown），日语分析对 markdown 内容照常工作。

## 二、启动 / 验证

```bash
cd ~/development/fudoki
python3 -m http.server 8000        # 本地; 82 服务器常驻端口 8831(未验证当前是否在跑,起前先 ss -tlnp | grep 8831)
# JS 语法验证: node --check static/main-js.js
```

推送：origin = https://github.com/iamcheyan/fudoki.git。commit 信息中文/英文均可
（历史两种都有）。

## 三、2026-08-14 改造清单

1. **深度 Review Phase 0+1**（FUDOKI_REVIEW_PROGRESS.md，全部 ✅ 并过 E2E）：
   - F-P0-01 删 index.html 重复 user-menu DOM 块；F-P0-02 localStorage 键名统一
     `fudoki:` 命名空间+迁移函数；F-P0-03 **修复 IIFE 提前闭合**（原 ~6994 行处 `})();`
     导致后半段全游离顶层 ReferenceError）；F-P0-06 XSS 全面转义（escapeHtml 接入
     列表/token-pill/翻译弹窗/搜索高亮）；F-P0-07 仓库瘦身（11MB jmdict zip 出库）+
     PWA 图标修正 + MIT LICENSE。
   - F-P0-04 删除同步墓碑（`fudoki:deletedDocs`，180 天 TTL）。
2. **移动端深度优化**（79c66bb，诊断先行 docs/mobile-audit/AUDIT.md + 8 张 390×844
   走查截图）：
   - 登录页：横向滚动修复（浮动装饰越界）、viewport-fit=cover、100dvh、登录按钮 ≥44px。
   - TTS：底部常驻迷你控制条（fixed+safe-area），滚动不消失。
   - 词典词卡 max-height 55dvh+内部滚动；EasyMDE 工具栏精简+软键盘 visualViewport 适配。

## 四、红线 / 已知遗留

- **Firebase 后端别乱动**：login.html:1188-1205 硬编码 firebaseConfig（apiKey/projectId
  `fudoki-f370e`）；`static/main-js.js` 7499/7636-7639 依赖 `window.firebaseDB/
  firebaseAuth/firestoreHelpers` 做云同步与登录态。这是用户配的真实 Firebase 项目——
  **不改配置、不动数据模型、不删登录链路**；本地离线功能（无登录可用）与云同步共存
  是有意设计。改动涉及登录/同步时先问用户。
- main-js.js 8398 行单 IIFE：改动后必须 `node --check` + E2E（重复 ID 扫描
  `document.querySelectorAll('[id]')`）。
- localStorage 键必须带 `fudoki:` 前缀（LS 常量表 + `migrateLocalStorage()` 已就位，
  别再裸写键名）。
- 清缓存脚本有保留名单（`texts/activeId/fudoki:texts/…`）——动 `CLEAR_CACHE.md`
  相关逻辑前先读它。

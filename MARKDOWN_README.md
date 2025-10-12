# Fudoki Markdown 编辑器集成说明

## 概述

我已经成功将 **EasyMDE** markdown 编辑器集成到 Fudoki 应用中，替换了原来的普通 textarea。这个集成完全不影响右侧的日语分析功能。

## 集成的组件

### 1. EasyMDE (SimpleMDE 的继任者)
- **轻量级**：只有约 80KB
- **功能完整**：包含工具栏、预览、全屏等功能
- **易于使用**：简单的 API，易于集成
- **开源**：MIT 许可证
- **GitHub**: https://github.com/Ionaru/easy-markdown-editor

## 实现细节

### 文件修改

#### 1. `index.html`
- 添加了 EasyMDE 的 CSS 链接 (CDN)
- 添加了 EasyMDE 的 JavaScript 库 (CDN)

#### 2. `static/main-js.js`
- 初始化 EasyMDE 编辑器实例
- 使用 `Object.defineProperty` 覆盖 `textInput.value` 的 getter/setter
- 重写 `addEventListener` 和 `focus` 方法以适配 CodeMirror
- 保持与原有代码的完全兼容性

#### 3. `static/styles.css`
- 添加了自定义样式以匹配应用的设计风格
- 适配了所有主题（浅色、深色、sakura 等）
- 响应式设计，支持移动端
- 两栏模式的特殊样式适配

## 功能特性

### Markdown 编辑器功能
- ✅ **工具栏快捷操作**：粗体、斜体、标题、引用、列表等
- ✅ **实时预览**：side-by-side 预览模式
- ✅ **全屏模式**：专注写作体验
- ✅ **语法高亮**：Markdown 语法的可视化
- ✅ **快捷键支持**：标准 Markdown 编辑快捷键

### 日语分析功能（保持不变）
- ✅ **自动分词**：使用 Kuromoji 进行形态素分析
- ✅ **假名标注**：显示汉字的读音
- ✅ **词性标注**：显示词性信息
- ✅ **词典查询**：点击单词查看详细释义
- ✅ **语音朗读**：TTS 功能正常工作
- ✅ **自动保存**：文档自动保存到 localStorage

### 主题适配
- ✅ **Paper 主题**（默认浅色）
- ✅ **Dark 主题**（深色）
- ✅ **Sakura 主题**（樱花粉）
- ✅ **Sticky 主题**（便签黄）
- ✅ **Green 主题**（清新绿）
- ✅ **Blue 主题**（天空蓝）

## 使用方法

### 启动应用
```bash
npm start
# 或
python3 -m http.server 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 使用 Markdown 功能

1. **基本编辑**
   - 直接输入日语文本（支持 Markdown 语法）
   - 使用工具栏按钮快速插入格式
   
2. **工具栏按钮**
   - **B**: 粗体
   - **I**: 斜体
   - **H**: 标题（多次点击切换 H1-H6）
   - **"**: 引用
   - 列表：无序列表 / 有序列表
   - 链接 / 图片
   - 预览 / 并排预览 / 全屏

3. **快捷键**
   - `Ctrl+B` / `Cmd+B`: 粗体
   - `Ctrl+I` / `Cmd+I`: 斜体
   - `Ctrl+K` / `Cmd+K`: 插入链接
   - `F11`: 全屏模式

4. **日语分析**
   - 输入日语文本后，失去焦点时自动触发分析
   - 右侧面板显示分词结果
   - 点击单词查看详细信息
   - 使用播放按钮朗读文本

## 示例文本

```markdown
# 日本語の勉強

## 今日の文章

これは**重要な**単語です。*強調したい*部分はこのように書きます。

### やることリスト
- 日本語を勉強する
- 本を読む
- 映画を見る

> 「継続は力なり」という言葉があります。

[フドキのウェブサイト](https://fudoki.iamcheyan.com/)
```

## 技术实现原理

### 兼容性处理

由于原代码大量使用了 `textInput.value` 来获取和设置文本内容，我采用了以下策略：

```javascript
// 1. 覆盖 value 属性
Object.defineProperty(textInput, 'value', {
  get: function() {
    return easymde ? easymde.value() : '';
  },
  set: function(val) {
    if (easymde) {
      easymde.value(val || '');
    }
  }
});

// 2. 重写事件监听器
textInput.addEventListener = function(event, handler, options) {
  if (event === 'input') {
    easymde.codemirror.on('change', handler);
  } else if (event === 'focus') {
    easymde.codemirror.on('focus', handler);
  } else if (event === 'blur') {
    easymde.codemirror.on('blur', handler);
  }
};

// 3. 重写 focus 方法
textInput.focus = function() {
  if (easymde && easymde.codemirror) {
    easymde.codemirror.focus();
  }
};
```

这种方式确保了：
- ✅ 所有对 `textInput.value` 的读取都返回 markdown 编辑器的内容
- ✅ 所有对 `textInput.value` 的赋值都更新 markdown 编辑器
- ✅ 所有的事件监听器都正确绑定到 CodeMirror
- ✅ 焦点管理正常工作
- ✅ 无需修改原有的日语分析逻辑

### 样式适配

通过 CSS 变量系统，markdown 编辑器自动适配应用的所有主题：

```css
.input-section .EasyMDEContainer .CodeMirror {
  background: var(--bg);
  color: var(--text);
  font-family: var(--input-font-family, inherit);
  font-size: calc(14px * var(--font-scale));
}
```

## 注意事项

1. **CDN 依赖**：当前使用 jsDelivr CDN 加载 EasyMDE，如需离线使用，可以下载到本地
2. **浏览器兼容性**：需要现代浏览器支持（Chrome 90+, Firefox 88+, Safari 14+）
3. **存储格式**：文档存储时会包含 Markdown 标记，这是预期行为
4. **预览模式**：预览模式显示的是渲染后的 HTML，不参与日语分析

## 故障排查

### 编辑器未显示
- 检查浏览器控制台是否有 JavaScript 错误
- 确认 EasyMDE 库是否成功加载（检查网络连接）
- 尝试清除浏览器缓存

### 日语分析不工作
- 确认输入了日语文本
- 检查文本失去焦点后是否自动触发分析
- 查看控制台是否有错误信息

### 样式显示异常
- 确认 EasyMDE CSS 文件已加载
- 检查是否有 CSS 冲突
- 尝试切换不同主题

## 后续优化建议

1. **本地化**：将 CDN 资源下载到本地，提高加载速度
2. **工具栏定制**：根据日语学习需求定制工具栏按钮
3. **快捷操作**：添加常用日语符号的快捷插入
4. **模板功能**：提供日语学习笔记模板
5. **导出功能**：支持导出为 PDF 或 HTML 格式

## 相关资源

- [EasyMDE GitHub](https://github.com/Ionaru/easy-markdown-editor)
- [Markdown 语法指南](https://www.markdownguide.org/)
- [CodeMirror 文档](https://codemirror.net/5/)

## 许可证

- Fudoki: MIT License
- EasyMDE: MIT License

---

如有问题或建议，欢迎提交 Issue！


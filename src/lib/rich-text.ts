/**
 * 内容字段里的轻量行内格式。
 *
 * 项目规约要求站内出现的物种拉丁学名用斜体（如 *Phytophthora sojae*），而
 * `content/` 里的 research 摘要等字段是纯文本、并不经过 Markdown 渲染，
 * 因此在这里把成对的单星号转成 `<em>`。
 *
 * 先整体做 HTML 转义、只放行强调标记本身，这样内容里出现的 `<`、`&`、`"`
 * 不会被当作标签或属性解析（调用方用 `set:html` 输出）。
 */
export function emphasis(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return escaped.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

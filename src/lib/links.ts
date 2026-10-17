/**
 * 外链判定：只有 http(s) 绝对地址算外链。
 *
 * 站内链接一律经 `base.ts` 的 `href()` 产出相对路径（`/academic-site/...`），
 * `mailto:` 打开的是邮件客户端——这两类都不该新开标签页，所以这里只认协议。
 *
 * 用法：`target={isExternal(url) ? '_blank' : undefined}`；外链同时配
 * `rel="noopener"`，避免新标签页通过 `window.opener` 反向操作当前页。
 */
export function isExternal(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

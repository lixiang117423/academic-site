/**
 * 部署前缀（Astro `base`）。
 *
 * GitHub Pages 的项目站点落在 `https://<user>.github.io/<repo>/` 下，此时 Astro
 * 会在产物里加前缀，站内**所有绝对链接**也必须跟着加，否则点进内页会 404。
 * 这里收口成两个函数：`href()` 负责加前缀，`stripBase()` 负责还原成站内逻辑路径。
 *
 * `import.meta.env.BASE_URL` 由构建注入：项目站点下形如 `/academic-site/`，
 * 未设 base（自定义域/本地/vitest）时为 `/`，此时两个函数都退化为恒等映射。
 */
export const BASE = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');

/** 站内绝对路径 → 带部署前缀的链接。 */
export function href(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${suffix}`;
}

/** 带部署前缀的路径 → 站内逻辑路径（`/`、`/zh/cv/` …）。 */
export function stripBase(pathname: string): string {
  if (BASE === '' || !pathname.startsWith(BASE)) {
    return pathname;
  }
  const rest = pathname.slice(BASE.length).replace(/^\//, '');
  return rest === '' ? '/' : `/${rest}`;
}

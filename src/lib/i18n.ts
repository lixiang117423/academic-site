import type { Locale, Localized } from './types';
import { stripBase } from './base';

export const LOCALES: Locale[] = ['en', 'zh'];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * 双语字段取值的唯一入口。
 * 中文缺失或为空串时回退英文——禁止在组件里另写回退逻辑。
 */
export function pick(locale: Locale, value: Localized): string {
  if (locale === 'zh' && value.zh && value.zh.trim() !== '') {
    return value.zh;
  }
  return value.en;
}

/** 由 Astro 的当前路径推导语言。 */
export function localeFromPath(pathname: string): Locale {
  return stripBase(pathname).startsWith('/zh') ? 'zh' : DEFAULT_LOCALE;
}

/**
 * 只有英文版的页面（spec §4.1：Publications 仅英文；404 页同样没有中文版）。
 * 这些页面上点「中文」若仍按常规拼 /zh/... 会指向不存在的页面，因此改送中文站首页。
 */
const EN_ONLY_PATHS = ['/publications', '/404'];

/** 同一页面在另一语言下的路径（返回站内逻辑路径，展示层再用 href() 补部署前缀）。 */
export function altPath(pathname: string): string {
  const path = stripBase(pathname);
  if (path.startsWith('/zh')) {
    const stripped = path.slice(3);
    return stripped === '' ? '/' : stripped;
  }
  const normalized = path.replace(/\/+$/, '') || '/';
  if (EN_ONLY_PATHS.includes(normalized)) {
    return '/zh/';
  }
  return path === '/' ? '/zh/' : `/zh${path}`;
}

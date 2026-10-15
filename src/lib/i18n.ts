import type { Locale, Localized } from './types';

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
  return pathname.startsWith('/zh') ? 'zh' : DEFAULT_LOCALE;
}

/** 同一页面在另一语言下的路径。 */
export function altPath(pathname: string): string {
  if (pathname.startsWith('/zh')) {
    const stripped = pathname.slice(3);
    return stripped === '' ? '/' : stripped;
  }
  return pathname === '/' ? '/zh/' : `/zh${pathname}`;
}

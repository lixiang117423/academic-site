// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // TODO: 域名确定后替换（spec 第 12 节待定项）
  site: 'https://example.invalid',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

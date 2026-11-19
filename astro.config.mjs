// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const defaultSite = 'https://lixiang117423.github.io';
const site = (process.env.SITE_URL ?? defaultSite).replace(/\/+$/, '');
const rawBase = process.env.SITE_BASE ?? '/academic-site';
const base = rawBase === '/'
  ? undefined
  : `/${rawBase.replace(/^\/+|\/+$/g, '')}`;

export default defineConfig({
  output: 'static',
  // 默认构建用于 GitHub Pages 项目站点；腾讯云部署在 /web/ 子路径时设置
  // SITE_URL=http://134.175.142.146 SITE_BASE=/web。
  site,
  ...(base ? { base } : {}),
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

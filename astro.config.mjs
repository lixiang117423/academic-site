// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  // GitHub Pages 项目站点：https://lixiang117423.github.io/academic-site/
  // 账号根域名 lixiang117423.github.io 已被 Hexo 博客占用，学术主页只能做项目站点，
  // 因此必须设 base；站内绝对链接一律经 src/lib/base.ts 的 href() 补前缀。
  // 将来若绑定自定义域（站点落在域名根路径），把 site 换成域名并删掉 base 这一行即可。
  site: 'https://lixiang117423.github.io',
  base: '/academic-site',
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

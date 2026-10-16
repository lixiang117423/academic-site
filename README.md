# my_academic_web

李详（lixiang117423）的个人学术主页。

## 这是什么

一个独立的学术主页，承载 publications、research、software、CV 与 about 这几件既有博客不承载的事。与既有博客「小蓝哥的知识荒原」（Hexo）是两个独立站点，只互相加链接，不迁移文章。

技术形态：Astro 静态站。全部输出为静态文件，没有常驻服务、没有数据库。

## 当前状态

**站点已可构建、可浏览（2026-10-16）**。`pnpm build` 产出 12 个页面：`/`、`/zh/`、`/publications`、`/research`、`/zh/research`、`/software`、`/zh/software`、`/cv`、`/zh/cv`、`/about`、`/zh/about`、`404`，外加 `robots.txt` 与 `sitemap-index.xml`。

**内容仍是占位**：`content/site.yaml` 里姓名 / 机构 / 职位 / 邮箱 / `intro` 等为 `TODO: 待用户提供`，`links`、`featuredPosts`、`selfAuthors` 为空，`content/publications.bib` 只有注释行。填入真实资料后重跑 `python3 scripts/sync_publications.py` 即可。

**待定**：域名与托管平台（spec §12）。域名确定后需同时替换 `astro.config.mjs` 的 `site` 与 `public/robots.txt` 的 Sitemap 行。

- 设计方案（唯一权威）：`docs/superpowers/specs/2026-10-15-academic-site-design.md`
- 项目规则：`AGENTS.md`
- 文件登记：`项目文件记录.md`
- 进度记录：`CHANGELOG.md`

## 计划中的结构

```
content/   数据层：site.yaml、publications.bib、research/、software/、cv.yaml
src/       展示层：Astro 页面与组件
scripts/   Python 数据管道：publications.bib → publications.json
public/    静态资产：CV PDF、头像、favicon
docs/      设计方案与实现计划
```

## 本地开发

```bash
pnpm install
pnpm dev        # 本地预览
pnpm build      # 产出 dist/
pnpm test       # vitest（schema / i18n / 数据选择）
```

Python 数据管道（需 `/Users/lixiang/miniforge3/envs/python/bin/python3`）：

```bash
/Users/lixiang/miniforge3/envs/python/bin/python3 scripts/sync_publications.py
/Users/lixiang/miniforge3/envs/python/bin/python3 -m pytest tests/test_sync_publications.py -v
```

## 两条硬约束

- 全站数据访问经 `src/lib/data-source.ts`，展示层不直接读数据源——这是为将来接后端 API 预留的唯一替换点。
- 不引入外部 CDN 依赖，字体、JS、CSS 全部自托管。

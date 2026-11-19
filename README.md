# my_academic_web

李详（lixiang117423）的个人学术主页。

## 这是什么

一个独立的学术主页，承载 publications、research、software、CV 与 about 这几件既有博客不承载的事。与既有博客「小蓝哥的知识荒原」（Hexo）是两个独立站点，只互相加链接，不迁移文章。

技术形态：Astro 静态站。全部输出为静态文件，没有常驻服务、没有数据库。

## 当前状态

**站点已可构建、可浏览（2026-10-16）**。`pnpm build` 产出 12 个页面：`/`、`/zh/`、`/publications`、`/research`、`/zh/research`、`/software`、`/zh/software`、`/cv`、`/zh/cv`、`/about`、`/zh/about`、`404`，外加 `robots.txt` 与 `sitemap-index.xml`。

**内容已换成真实资料（2026-10-16 15:47）**，站点内已无占位串：

- `content/site.yaml`：姓名 / 职位 / 机构 / 地点 / 邮箱 / 简介（`bio`）/ GitHub 与 Google Scholar 链接 / 5 篇博客外链；`selfAuthors` 用于论文作者行加粗。
- `content/publications.bib`：9 条（8 篇已发表 + 1 篇 bioRxiv 预印本），**DOI 逐条经 Crossref 核验**；由 `scripts/sync_publications.py` 生成 `publications.json`。
- `content/research/` 5 个研究方向、`content/software/` 5 个工具（bioRtools、biopytools、DeepBSA-rs、qPCRtools、ggmotif）。
- `content/cv.yaml`：教育 3 条、工作 2 条、获奖 2 条；报告段（`talks`）为空，页面不渲染该标题。
- `public/cv/cv-en.pdf` 与 `cv-zh.pdf`：由 `scripts/build_cv_pdf.py` 从上述数据生成（A4、中文字体已内嵌）；`public/avatar.jpg`、`public/favicon.svg`、`public/favicon.png` 已放。

**GitHub Pages（2026-10-16）**：<https://lixiang117423.github.io/academic-site/> · 仓库 <https://github.com/lixiang117423/academic-site>。账号根域名已被既有 Hexo 博客占用，因此本站落到 `/academic-site/` 子路径。

**腾讯云（2026-11-19）**：<http://134.175.142.146/>，服务器目录 `/home/ubuntu/my_web`，Nginx 直接提供静态文件。推送到 `main` 后，`.github/workflows/deploy.yml` 会分别构建 GitHub Pages 子路径版和腾讯云根路径版，并同时发布两端。

**待定**：域名（托管平台已定 GitHub Pages，境外托管不需要备案）。将来绑定自定义域、站点落到域名根路径时，把 `astro.config.mjs` 的 `site` 换成域名并删掉 `base` 一行即可——站内链接会随 `base` 自动跟随（见 `src/lib/base.ts`）。

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
pnpm preview    # 预览 dist/ 构建产物（部署前的真实产物）
pnpm build      # 产出 dist/
pnpm build:tencent  # 产出腾讯云根路径版 dist/
pnpm deploy:tencent # 测试、构建并 rsync 到腾讯云（需 ssh tsy 可用）
pnpm test       # vitest（schema / i18n / 数据选择）
```

Python 数据管道（需 `/Users/lixiang/miniforge3/envs/python/bin/python3`）：

```bash
/Users/lixiang/miniforge3/envs/python/bin/python3 scripts/sync_publications.py
/Users/lixiang/miniforge3/envs/python/bin/python3 scripts/build_cv_pdf.py --force   # 改完 cv.yaml / site.yaml 后重生成两份 CV PDF
/Users/lixiang/miniforge3/envs/python/bin/python3 -m pytest tests/test_sync_publications.py -v
```

改内容后建议实跑一遍：`pnpm test && pnpm build`（schema 校验 + 双语回退 + 构建）。

### 双端发布

- 正常更新：提交并推送到 `main`，GitHub Actions 同时发布 GitHub Pages 与腾讯云。
- 临时手动发布腾讯云：`pnpm deploy:tencent`。
- 两种部署的差别只在 `site` / `base`：GitHub 用 `/academic-site/`，腾讯云用站点根路径 `/`；页面代码中的站内链接统一经 `src/lib/base.ts` 处理。
- 腾讯云发布依赖仓库 Secrets：`TENCENT_HOST`、`TENCENT_USER`、`TENCENT_SSH_KEY`、`TENCENT_KNOWN_HOSTS`。

## 两条硬约束

- 全站数据访问经 `src/lib/data-source.ts`，展示层不直接读数据源——这是为将来接后端 API 预留的唯一替换点。
- 不引入外部 CDN 依赖，字体、JS、CSS 全部自托管。

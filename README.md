# my_academic_web

李详（lixiang117423）的个人学术主页。

## 这是什么

一个独立的学术主页，承载 publications、research、software、CV 与 about 这几件既有博客不承载的事。与既有博客「小蓝哥的知识荒原」（Hexo）是两个独立站点，只互相加链接，不迁移文章。

技术形态：Astro 静态站。全部输出为静态文件，没有常驻服务、没有数据库。

## 当前状态

**设计阶段**。设计方案已完成待复审，尚未开始写站点代码。

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

## 本地开发（待实现后生效）

```bash
pnpm install
pnpm dev        # 本地预览
pnpm build      # 产出 dist/
```

## 两条硬约束

- 全站数据访问经 `src/lib/data-source.ts`，展示层不直接读数据源——这是为将来接后端 API 预留的唯一替换点。
- 不引入外部 CDN 依赖，字体、JS、CSS 全部自托管。

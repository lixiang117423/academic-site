# my_academic_web 项目 AGENTS.md（项目级规则）

> 本文件由全局模板（`/Users/lixiang/.codex/templates/project_AGENTS.md.template`，2026-09-16 版）改造生成。
> 本项目是 **Web 前端项目**，不是生物信息学分析项目，因此模板中的 `data/` `code/` `result/` `manuscript/` 目录规范、超算端作业规范等章节**不适用**，已由下文「本项目约定」替换。
> 全局规则见 `/Users/lixiang/.codex/AGENTS.md`；本项目规则与全局冲突时，以本项目规则及用户即时确认为准。

## 项目根路径

- 本地根目录（脚本一律用绝对路径、禁止相对路径与 `~`）：
  `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web`
- 超算端根目录：**无**（纯静态网站，不涉及超算）
- 超算访问方式：**无**

## 项目目标

- 目标：搭建个人学术主页（Home / About / Research / Publications / Software / CV），与既有博客分离并互相链接。
- 技术形态：Astro 静态站。"前后端分离"在本项目中的落点是**内容层与展示层分离**，不引入常驻后端服务；全部数据访问经适配层 `src/lib/data-source.ts`，为将来接 API 预留替换点。

## 与既有站点的关系（已确认）

- 既有博客「小蓝哥的知识荒原」（Hexo，本地 `/Users/lixiang/NutstoreFiles/03.编程相关/hexo`）**原样保留、不迁移、不改动**；本项目只在导航中提供指向它的外链。
- 早期 R bookdown 站点（本地 `/Users/lixiang/NutstoreFiles/03.编程相关/lixiang117423.github.io`）同样**不改动**。
- 本项目与上述两个目录相互独立，不得跨目录写文件。

## 设计文档

- 设计方案（唯一权威）：`/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/docs/superpowers/specs/2026-10-15-academic-site-design.md`
- 后续实现计划放同目录，按日期前缀编号。

## 本项目约定（覆盖模板中的生信目录规范）

- 目录结构：`content/`（数据层）/ `src/`（展示层）/ `scripts/`（数据管道）/ `public/`（静态资产）/ `docs/`（设计与计划）。**不使用** `data/ code/ result/ manuscript/` 四类目录。
- 包管理与构建：`pnpm`（本机 11.21.0），Node v26.11.1。
- `node_modules/`、`dist/`、`.astro/` 必须同时保持在 git 与坚果云同步之外——本项目位于坚果云同步盘内。
- 展示层不得直接读 `content/` 之外的外部数据源；跨层数据获取一律经 `src/lib/data-source.ts`。
- 站内出现的物种拉丁学名仍按全局规则用斜体（首现全称、同文后续可缩写），如 *Phytophthora sojae*、*Glycine max*。
- 中文/英文内容并存时，中文为可选覆盖、缺失回退英文，不阻塞构建。

## 硬性红线（与全局一致）

- **AI 一律不得删除任何文件**（含临时与中间产物）；需要清理时给出「清单（路径 + 大小 + 是否可再生成）+ 可直接复制运行的删除命令」，由用户本人执行。
- 不得覆盖写入已有文件；批量移动/重命名前先 dry-run 输出影响清单并取得用户同意。
- 所有时间戳必须读真实时钟（`date '+%Y-%m-%d %H:%M'`），禁止估算。
- 文件一律 UTF-8（无 BOM）+ LF 换行。

## 关键文件登记与进度追踪

- 文件级登记表：`项目文件记录.md`（新增/移动文件后同步更新）
- 进度与决策记录：`CHANGELOG.md`（按时间倒序）
- 本文件规则变更：追加记录，并在 `CHANGELOG.md` 同步一条

## 待确认事项

- **域名**：待定（用户 2026-10-15 明确「后面再说」）。既有站点配置中登记的域名为 `www.web4xiang.com`，其当前归属与注册商需用户确认。
- **托管平台**：待定（候选：Cloudflare Pages / GitHub Pages）。本阶段只保证 `pnpm build` 产出可托管于任意静态空间的 `dist/`。
- **站点展示信息**：姓名写法、机构、职位、邮箱、ORCID iD、Google Scholar / ResearchGate 链接待用户提供；在此之前使用占位内容，**不得臆造**。
- **坚果云排除项**：`node_modules/`、`dist/`、`.astro/` 的具体排除入口以客户端为准。

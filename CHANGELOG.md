# CHANGELOG

> 时间取本机真实时钟（Asia/Shanghai），格式 `YYYY-MM-DD HH:MM`，倒序记录。

## 2026-10-15 15:42 — Task 1 脚手架与构建基线完成

- 按 `task-1-brief.md` 创建 Astro 5 静态站最小脚手架：`package.json`、`astro.config.mjs`、`tsconfig.json`、`.editorconfig`、`src/pages/index.astro`，内容与 brief 逐字一致（`site: 'https://example.invalid'` 按 brief 保留为待定项占位）。
- `pnpm install` 生成 `pnpm-lock.yaml` 与 `node_modules/`；实际解析版本为 astro 5.18.2、yaml 2.9.1、typescript 5.9.3、vitest 3.2.7。
- **环境处置（重要）**：pnpm 11 默认拦截依赖构建脚本，`pnpm install` 因此以 `ERR_PNPM_IGNORED_BUILDS`（esbuild / sharp）退出码 1，并连带使 `astro build` 的依赖预检失败。已用 `pnpm approve-builds --all` 批准 esbuild + sharp，该操作**未改动 `package.json`**（diff 为空），另生成 43 字节的 `pnpm-workspace.yaml`（`allowBuilds: esbuild/sharp`）并纳入提交；这是让 `pnpm build` 可用的最小改动。
- 构建验证通过：`pnpm build` 成功产出 `dist/index.html`（`src/pages/index.astro → /index.html`），`test -f .../dist/index.html && echo BUILD_OK` 打印 `BUILD_OK`。
- `git status --short` 中未出现 `node_modules/`、`dist/`、`.astro/`，`.superpowers/` 亦未出现（该目录用自身 `.gitignore` 自忽略）——符合 Step 8 预期。
- 已知状态：`pnpm test`（`vitest run`）当前因**尚无测试文件**而以退出码 1 结束（`No test files found`），属预期；测试用例在后续任务引入。
- 提交：`chore(scaffold): 初始化 Astro 静态站与构建基线`。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。
- 遗留提醒：`pnpm install` 会向坚果云同步盘写入大量小文件，执行期间建议暂停坚果云同步（本轮未能由 AI 代为暂停）。

## 2026-10-15 15:34 — 设计方案复审通过、实现计划落档

- 用户复审确认设计方案（spec），并决定：**本项目只记 Obsidian、不进语雀**（语雀那套是生信分析记录规范，本项目无对应分析模块）；该记录已写入 `/Users/lixiang/NutstoreFiles/98.软件数据/Obsidian/obsidian/分析记录/my_academic_web.md`，并在库索引 `00_分析记录总览.md` 补登一行。
- 用 `writing-plans` 产出实现计划：`/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/docs/superpowers/plans/2026-10-15-academic-site-implementation.md`（12 个任务、85 个步骤、2427 行）。
- **spec 修订（1 处）**：`§5.4 content/research` 由「中英各一个文件、各自带 frontmatter」改为「一个方向一个文件、`title`/`summary` 各带 `{ en, zh }` 双语字段只写一份」。原因：原设计同一份元数据要在两个文件重复维护，必然漂移；且原方案的「正文」字段在本期没有消费方，按 YAGNI 不引入。
- 计划自检：围栏配对正常；任务标题 12 个；含删除类危险命令 0 处；`researchZh` / `mergeResearch` 等已废弃命名残留 0 处。
- **待用户决策**：`bibtexparser` 与 `pytest` 本机均未安装（2026-10-15 实测返回 `False`），Task 3 Step 1 需要用户同意后才能 pip 安装；备选是改用 Node 侧 BibTeX 解析器。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

## 2026-10-15 15:13 — 项目初始化与设计方案落档

- 在 `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web` 建立项目目录并初始化 git 仓库。
- 按全局模板生成项目级 `AGENTS.md`（按 Web 项目改造：不套用 `data/ code/ result/ manuscript/` 生信目录规范，明确无超算端），并建立 `项目文件记录.md`、`CHANGELOG.md`。
- 完成个人学术网站设计方案，落档 `docs/superpowers/specs/2026-10-15-academic-site-design.md`（状态：待用户复审）。
- 本轮确认的关键决策：新站独立、既有 Hexo 博客原样保留并双向互链；轻量双语（页面骨架双语 / Publications 仅英文 / CV 中英两份 PDF / 博客仅留中文入口）；Astro 静态构建 + `data-source` 适配层；域名与托管平台待定。
- **未改动任何既有站点文件**：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

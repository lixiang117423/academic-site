# CHANGELOG

> 时间取本机真实时钟（Asia/Shanghai），格式 `YYYY-MM-DD HH:MM`，倒序记录。

## 2026-10-15 15:54 — Task 2 内容模型与 schema 校验完成

- 按 `task-2-brief.md` 创建内容模型：`src/lib/types.ts`（`Localized` / `Locale` / `Publication` / `ResearchItem` / `SoftwareItem` / `SiteLink` / `FeaturedPost` / `SiteProfile` / `CvEntry` / `CvData`）、`src/content.config.ts`（Astro 5 Content Layer：`research`、`software`、`publicationsGenerated`、`site`、`cv` 五个集合）。
- 创建内容文件：`content/site.yaml`、`content/cv.yaml`、`content/research/effector-genomics.md`、`content/software/biortools.md`；用户待提供的个人信息一律写占位串 `TODO: 待用户提供`，未臆造姓名、机构、邮箱与社交链接。
- **控制器裁决落地（1 处）**：brief Step 8 要求 `pnpm build` 通过，但 `publicationsGenerated` 读取的 `content/publications.json` 属于 Task 3 产物，故按裁决新建该文件（内容为 `{"generated_at":"","source":"content/publications.bib","count":0,"items":[]}`，空 `items`）以打通构建；Task 3 将用真实数据重新生成并覆盖。该文件纳入本次提交。
- 测试（TDD）：先写 `tests/content-schema.test.ts` 并运行 `pnpm test`，得到 RED——3 个用例全部 `ENOENT`（`content/site.yaml`、`content/research/effector-genomics.md`、`content/software/biortools.md` 尚未创建），属预期失败；补全内容文件后重跑 `pnpm test`，3/3 PASS（vitest 3.2.7，耗时 1 ms）。
- 构建与运行时校验：`pnpm build`（astro 5.18.2）成功，1 page built，产出 `dist/index.html`；构建日志有一条预期告警 `[WARN] [file-loader] No items found in ./content/publications.json`（`items` 为空，Task 3 写入后会消失）。
- 反向核验加载与校验结果（解码 `node_modules/.astro/data-store.json`）：条目 id 与 Task 4 约定一致——`site` 集合 id=`site`、`cv` 集合 id=`cv`、`research` id=`effector-genomics`、`software` id=`biortools`、`publicationsGenerated` 0 条（空数组不落库，符合预期）；四类条目均已通过 zod schema 校验（`cv` 保留 `education`/`positions`/`awards`/`talks` 四个键，`software.order` 默认值生效）。
- 已知状态：`pnpm exec tsc --noEmit` 仅对新测试文件报 2 条 `node:fs` / `node:path` 类型缺失——`@types/node` 本机未安装（属依赖变更，超出本任务 brief 范围，未擅自添加）；`pnpm test` 与 `pnpm build` 两道验收门均通过。
- 提交：`feat(content): 定义内容模型与 schema 校验`。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；`package.json`、`pnpm-workspace.yaml` 未改动。

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

# CHANGELOG

> 时间取本机真实时钟（Asia/Shanghai），格式 `YYYY-MM-DD HH:MM`，倒序记录。

## 2026-10-15 16:38 — 学术主页实现：Task 1–3 完成（阶段性检查点）

以 `subagent-driven-development` 执行实现计划（分支 `feat/academic-site`，基于 `main` @ 1156944）：每任务由独立 implementer 实现、独立 reviewer 审、必要时修复轮，控制端不代写代码。累计 6 个提交，最新 `055a48b`。

- **Task 1 脚手架与构建基线**（`24a0403`）：Astro 5.18.2 + TypeScript strict + vitest；`pnpm build` 产出 `dist/index.html`。新增 `pnpm-workspace.yaml`（pnpm 11 构建白名单 `allowBuilds: esbuild/sharp`）——不加则 `pnpm install` 以 `ERR_PNPM_IGNORED_BUILDS` 失败，连带 `pnpm build` 起不来。
- **Task 2 内容模型与 schema 校验**（`f44eb7c` + 修复 `89c2a27`）：新增 `src/lib/types.ts`、`src/lib/schemas.ts`（7 个 zod schema，不依赖 `astro:content`，因此可单测）、`src/content.config.ts`（收敛为 loader/接线）；`content/` 下 site.yaml、cv.yaml、research/、software/ 样例。修复轮解决 2 条重要问题：补 `@types/node`（此前 `tsc` 报 TS2307×2）、把只做 `toContain` 字符串检查的测试改为对真实内容执行 schema 解析并加 10 条负例。
- **Task 3 论文数据管道**（`07e7867` + 修复 `3f04135`）：`scripts/sync_publications.py`（适配已装的 `bibtexparser` 2.1.0 API，输出 13 字段与 schema 逐字段对齐，写盘后回读自检）、`tests/test_sync_publications.py`、`pyproject.toml`。修复轮解决 1 条重要问题：`type` 枚举由三值扩为八值（`journal|conference|preprint|book|book-chapter|thesis|report|other`），未登记的 ENTRYTYPE 回退 `other` 并向 stderr 打 `[WARN]`（此前会静默写成 `journal` 且 venue 为空）。
- **验收证据（控制端 2026-10-15 16:27 复跑）**：`pnpm test` 15/15 PASS；`pnpm build` Complete!；pytest 4 passed（实现者报告 + 控制端复跑交叉确认）。
- **设计与计划修订**：spec §5.4 research 模型简化为单文件（原中英双文件方案会让同一份元数据两处漂移）；spec §4.1/§5.3 与计划 Task 2 两处代码片段同步为八值 `type` 枚举，消除计划内部矛盾。
- **未决小事（已记入 ledger）**：计划 Task 1/2 的 Files 清单需补 `@types/node` 与 `pnpm-workspace.yaml`；`types.ts`/`schemas.ts` 的八值枚举已在两处 lockstep，但 `CHANGELOG`/`项目文件记录` 里「19 个 entry type」应为 18；`VENUE_FIELDS` 未含 `school`/`institution`（学位论文、报告的 venue 可能为空）；非数字 `year` 抛原始 `ValueError`；`content-schema.test.ts` 把占位串 `TODO: 待用户提供` 写成字面断言，用户填真实资料后会误报。
- **状态**：Task 4–12 未开工。恢复入口 `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/.superpowers/sdd/2026-10-15-academic-site-implementation/progress.md`（首行标注 plan 路径；`Task <N>: complete` 行即已完成集合；含全部 Ruling）。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

## 2026-10-15 16:33 — Task 3 复审修复：扩展论文类型枚举 + 未登记 entry type 显式告警

- **Finding（Important，计划/规格层缺陷）**：`TYPE_BY_ENTRYTYPE` 只覆盖 5 个 entry type 且 fallback 为 `journal`，Zotero 常见的 `@incollection` / `@inbook` / `@book` / `@phdthesis` / `@mastersthesis` / `@techreport` 会被静默标成 `journal`（zod 枚举也接受，构建不报错）→ 真实数据一导入就会显示错误元数据。按控制器 2026-10-15 裁决修复。
- **改动 1（类型模型扩到八值）**：`src/lib/schemas.ts` 的 `publicationItem.type` 与 `src/lib/types.ts` 的 `Publication['type']` 同步改为 `journal | conference | preprint | book | book-chapter | thesis | report | other`（顺序与修订后的 spec §5.3、Task 6 分区一致，两处 lockstep）。
- **改动 2（脚本映射 + 绝不静默失败）**：`scripts/sync_publications.py` 的 `TYPE_BY_ENTRYTYPE` 扩到 19 个 entry type（article；inproceedings/conference；misc/unpublished/online/software；incollection/inbook；book/booklet/manual/proceedings；phdthesis/mastersthesis/thesis；techreport/report），fallback 由 `journal` 改为 `other`，并新增 `FALLBACK_TYPE = "other"` 常量与 `_map_type()`：未登记类型回退 `other` 时往 **stderr** 打一条 `[WARN]`，点名 entry type 与条目 ID，**不是失败**（管道照常跑完）。
- **改动 3（venue 取值链）**：原先只读 `journal`/`booktitle`，现抽成 `_venue()` 按 `VENUE_FIELDS = (journal, booktitle, series, publisher)` 优先级取值，都没有则空串。**明确回答复审要求**：venue 现在依次查 `journal` → `booktitle` → `series` → `publisher`；`@phdthesis` 的 `school`、`@techreport` 的 `institution` **未纳入**（裁决只授权扩到 series/publisher，且本机暂无该类真实数据）；有真实 `.bib` 时若出现空 venue 再据实扩充。
- **改动 4（测试）**：`tests/test_sync_publications.py` 新增 2 例（共 4 例）——① `@incollection` → `book-chapter` 且 venue 取自 `booktitle`；② `@dataset`（未登记）→ `other`、管道仍产出条目、用 `capsys` 断言 **stderr** 含 `[WARN]` + 类型名 + 条目 ID 且 stdout 为空。TDD：新增测试先跑得 **RED**（`2 failed, 2 passed`，报 `AssertionError: assert 'journal' == 'other'`——正是本 finding 描述的静默误分类），改脚本后 **GREEN**（4 passed）。
- **改动 5（TS 反例的必然连带）**：`tests/content-schema.test.ts` 有 3 处断言**真的被这次枚举扩容打破**，只改这 3 处、未削弱任何反例——① 「拒绝非法 type」原用 `'thesis'`（现在合法）→ 换成本次管线会回退到 `other` 的 `'dataset'`；② 「接受全部枚举成员」的循环由 3 值补成完整 8 值；③ 「拒绝邻接错拼值」原用 `'book'`（现在合法）→ 换成错拼 `'bookchapter'`。两条 `toThrow` 反例仍然拒绝非法值（vitest 通过即证据）。
- **验收（提交前实跑）**：`python3 -m pytest tests/test_sync_publications.py -v` → **4 passed**；`pnpm test` → **15/15 PASS**（vitest 3.2.7）；`pnpm exec tsc --noEmit --incremental false` → 退出码 0；`pnpm build` → 成功，1 page built。另用一个**纯内存探针**（不落任何文件）跑全部新类型，实测映射：article→journal(venue=J)、incollection→book-chapter(venue=Handbook)、book→book(venue=PubCo)、phdthesis→thesis、techreport→report、online→preprint、dataset→other 且 stderr 出现 `[WARN] ... "dataset" ... 条目 d1`。
- **产物重生成**：按裁决重跑 `/Users/lixiang/miniforge3/envs/python/bin/python3 scripts/sync_publications.py`，`content/publications.json` 的 `generated_at` 刷新为 `2026-10-15T16:32:51+08:00`，`count: 0`、`items: []`（`.bib` 仍为占位；回读自检打印 `[INFO] 回读自检通过：字段齐全、count 一致（0）`）。
- 明确**未做**（裁决列为 out of scope）：未改 0 条 `publications.json` 的构建告警 `[WARN] [file-loader] No items found`、未改 `int(year)` 的 ValueError 行为。
- 提交：`fix(data): 扩展论文类型枚举并让未登记 entry type 显式告警`（同一提交带上控制器留在工作区的 spec/plan 修订，见提交说明）。

## 2026-10-15 16:19 — Task 3 论文数据管道（BibTeX → JSON）完成

- 按 `task-3-brief.md` 建 Python 数据管道：`content/publications.bib`（唯一权威源，**当前仅 2 行注释、0 条目**，真实论文待用户从 Zotero 导出后覆盖）→ `content/publications.json`（`{ generated_at, source, count, items }`，条目字段与 `src/lib/schemas.ts` 的 `publicationItem` 逐字段一致：13 个字段，`type` ∈ journal/preprint/conference、`authorRole` ∈ first/co-first/corresponding/co-author 与 zod 枚举对齐）。
- **TDD 证据（RED）**：先写 `tests/test_sync_publications.py`（brief Step 2 逐字）并运行 `python3 -m pytest tests/test_sync_publications.py -v`，得到 `ModuleNotFoundError: No module named 'scripts.sync_publications'`（收集期 1 error、0 items）——因尚无 `pyproject.toml`，pytest 只把 `tests/` 而非项目根加入 `sys.path`，属预期失败。
- **GREEN**：补 `pyproject.toml`（`pythonpath = ["."]` / `testpaths = ["tests"]`）+ `scripts/sync_publications.py` 后重跑，**2 passed**。
- **偏离 brief 一处（重要，已按实测修正）**：brief Step 5 的原始代码用 `bibtexparser.load(handle)`，但本机装的是 **bibtexparser 2.1.0**，1.x 的 `load()` 已被移除——首次 GREEN 尝试即报 `AttributeError: module 'bibtexparser' has no attribute 'load'`（2 failed）。改为 `bibtexparser.parse_file()` + 把 `entry.fields`（`Field` 对象列表）归一化为 1.x 风格的「字段名小写 → 字符串」平铺字典后，**输出契约与 brief 测试未改**，2 passed。未执行任何 `pip install`（Step 1 已由现状满足：bibtexparser 2.1.0 / pytest 9.1.1 均在 `/Users/lixiang/miniforge3/envs/python` 内，本任务未改动任何 Python 环境）。
- **回读自检（硬性要求）实跑**：`python3 scripts/sync_publications.py` 打印 `[INFO] 写入 .../content/publications.json（0 条）` 与 `[INFO] 回读自检通过：字段齐全、count 一致（0）`；回读核对 `count == len(items)`、落盘条数 == 生成条数、每条 13 字段齐全。因当前 0 条，字段齐全分支为空转，另在 `~/tmp/task3-probe` 做了两条独立验证：① 用 1 条真实记录的临时 `.bib` 跑 `main()` → 自检通过并打印完整 13 字段 JSON；② 注入缺字段条目 → `SystemExit` 打印 `[FATAL] 条目 bad 缺字段：[...]` 被拦下（证明该分支非空转）。以上探针均写在项目外，未污染仓库。
- **验收门**：`python3 -m pytest tests/test_sync_publications.py -v` 2 passed；`pnpm test`（vitest 3.2.7）**15/15 PASS**；`pnpm build`（astro 5.18.2）成功、1 page built；`pnpm exec tsc --noEmit --incremental false` 退出码 0。构建日志仍有 1 条**预期告警** `[WARN] [file-loader] No items found in ./content/publications.json`（`items` 为空所致，`count: 0`），用户提供真实 `.bib` 并重跑脚本后消失。
- 附带登记：`项目文件记录.md` 新增「站点源码（已创建：Task 3 论文数据管道）」小节（5 个新文件）、更新规划清单 3 行状态与「最后更新」时间；顺手把 `tests/content-schema.test.ts` 的过时描述「3 个用例」改为实测的「15 个用例」。另说明：pytest 会在项目内生成 `.pytest_cache/`，其自带 `.gitignore: *` 属于自忽略目录（`git check-ignore` 判定 NOT IGNORED 但目录内容全被忽略，故 `git status` 中不出现），未改动项目 `.gitignore`。
- **收尾记录（两端）**：按 Obsidian 页面上登记的 2026-10-15 决定，本项目**只记 Obsidian、不进语雀**（本项目无生信分析模块，语雀那套不适用）——已在 `/Users/lixiang/NutstoreFiles/98.软件数据/Obsidian/obsidian/分析记录/my_academic_web.md` 末尾追加 `## 2026-10-15 16:21 — Task 3 论文数据管道（BibTeX → JSON）` 小节（①–⑦ 字段齐全，末尾 `→ 语雀模块页：—`），并把该页「项目概览 → 当前阶段」由「设计阶段、尚未写站点代码」更新为「实现阶段，Task 1–3 已完成并提交」。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件。
- 提交：`feat(scripts): BibTeX 转 publications.json 数据管道`。

## 2026-10-15 16:05 — Task 2 复审修复（strict TS 与 schema 真实校验）

- **Finding 1 修复（重要，计划缺陷）**：`tests/content-schema.test.ts` 引用 `node:fs` / `node:path` 但缺 `@types/node`，`pnpm exec tsc --noEmit --incremental false` 报 2 条 TS2307。按用户裁决（本次明确解除「不动 `package.json`」的约束）执行 `pnpm add -D '@types/node@^26'`，落地 `@types/node 26.6.5`（与本机 Node v26.11.1 对齐）。`package.json` 仅新增一行 devDependency；`pnpm-lock.yaml` 的改动为 astro / vite / vitest 的 `@types/node` peer 上下文与新增传递依赖 `undici-types`。**现 `tsc --noEmit --incremental false` 零输出、退出码 0。**
- **Finding 2 修复（重要，计划缺陷）**：原测试只对文件原文做 `toContain`，不加载集合、不执行 zod schema。新增 `src/lib/schemas.ts`（7 个 schema 值，**不 import `astro:content`**），`src/content.config.ts` 改为只保留 loader 与 `defineCollection` 接线、schema 从该模块导入；行为与集合名未变（`research` / `software` / `publicationsGenerated` / `site` / `cv`，`site`、`cv` 固定 id）。
- **schema 迁移忠实性核验**：脚本比对 `git show HEAD:src/content.config.ts` 与新的 `src/lib/schemas.ts`，7 个 `z.object(...)` 表达式逐字一致（仅 research / software 两处因不再嵌套而缩进由 4 空格变 2 空格），结论「ALL 7 SCHEMAS MOVED VERBATIM」。
- 测试重写：`tests/content-schema.test.ts` 现为 **15 个用例**——真实内容校验（`site.yaml`→`siteProfileSchema`、`cv.yaml`→`cvSchema`、`publications.json` 每个 item→`publicationItem`、research 与 software 的 frontmatter→各自 schema）+ 10 个反例（非法 `type`/`authorRole` 枚举、缺 `title`、`year` 非整数、`venue` 被改名、缺 `language`、`order` 非整数、`blog.url` 非 URL、cv 条目缺 `org`），并含「合法条目必须通过」的对照组防止 `toThrow` 恒真。
- **变异测试（证明新测试不是空转）**：在 `~/tmp/task2-mutation` 的临时副本上（项目文件未改）分别注入 ① `publicationItem.venue`→`venueName`、② 从 `type` 枚举删除 `conference`。结果：**旧测试对 ① 仍 3/3 PASS（空转，正是复审指出的缺陷）；新测试对 ① 报 3 failed、对 ② 报 1 failed**——新测试确实能拦住字段改名与枚举缺失。
- **修复后三关门全部通过**：`pnpm test` 15/15 PASS（vitest 3.2.7）；`pnpm exec tsc --noEmit --incremental false` 退出码 0、无输出；`pnpm build`（astro 5.18.2）成功，1 page built。另解码 `node_modules/.astro/data-store.json` 复核重构后运行时行为未变：`site`→id `site`、`cv`→id `cv`、`research`→`effector-genomics`、`software`→`biortools`，校验后数据与重构前逐字段相同。
- 顺手修复（复审 Minor 项）：`src/lib/types.ts` 的 `ResearchItem` 补 `image?: string`（与 research schema 的 `image` 可选字段对齐）；`项目文件记录.md` 中过时标题「站点源码（规划中，尚未创建）」改为「站点源码（规划清单与当前状态）」，并登记 `src/lib/schemas.ts`。
- 提交：`fix(content): 补 @types/node 并让 schema 测试真实校验内容`。

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

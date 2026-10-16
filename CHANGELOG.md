# CHANGELOG

> 时间取本机真实时钟（Asia/Shanghai），格式 `YYYY-MM-DD HH:MM`，倒序记录。

## 2026-10-16 15:17 — Task 7 Publications 页完成

- 新增 `src/pages/publications.astro`（仅英文，符合 spec §4.1：论文题录本来就是英文）。复用 Task 6 已建的 `PublicationList.astro`，未重复实现论文条目 markup。
- 分组覆盖 `Publication['type']` 的**全部八个取值**（journal / conference / preprint / book / book-chapter / thesis / report / other），空分组不渲染标题——避免出现"有标题没内容"的空档。
- 零条目时只渲染一条说明（指向 `content/publications.bib` 与 `scripts/sync_publications.py`），不渲染空列表容器。
- 本页落地后，Task 6 首页的「All publications →」链接（指向 `/publications`）不再是死链。
- 验收：`pnpm build` 3 页（`/`、`/zh/`、`/publications`）· `pnpm test` 25/25 · `pnpm exec tsc --noEmit --incremental false` 干净 · `dist/zh/publications` 不存在（确认未生成中文版）。
- 执行方式说明：本轮由控制端直接实现（前序 Task 7 子代理因会话中断被清理）。按 `subagent-driven-development` 的流程，本任务仍应经独立评审——评审安排在下一步单独派发，不因此改变验收标准。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

## 2026-10-16 13:58 — 学术主页实现：Task 6 完成（Home 页，第三个检查点）

- **Task 6 Home 页**（`7b7822b` + 修复 `77c98cf`）：新增 `src/components/PublicationList.astro`、`src/components/HomeContent.astro`，改写 `src/pages/index.astro` 并新增 `src/pages/zh/index.astro`。构建产出 `/` 与 `/zh/` 两个页面；测试 25/25；`tsc` 干净。
- **评审抓出 3 条真实的设计保真缺口并全部修复**：① 首页缺 spec §9.4 与可视稿都要求的「一句话研究方向」——新增本地化 `intro` 字段（`content/site.yaml` / `schemas.ts` / `types.ts`）并以 `pick()` 渲染；② 缺「All publications →」链接——已按可视稿补上，指向 `/publications`；③ 作者行缺「自己姓名加粗」——**不做模糊匹配**（`Xiang Li` 与 BibTeX 的 `Li X` 不可靠），改为在 `site.yaml` 增加显式 `selfAuthors: []`（填 BibTeX `author` 字段里的原样拼写），`PublicationList` 对 trim + 大小写不敏感的全串匹配套 `.me`，空列表则不强调任何名字。连带修掉 3 条 Minor（分隔符悬挂、空 `<ul>` 与空态文案并存、DOI/PDF/Code 缺 `aria-label`）。
- **设计规则新增**：`selfAuthors` 与 `intro` 已写入 spec §5.1；自姓名强调由显式清单驱动、不做模糊匹配的理由写入 §9.4。
- **验收证据**：`pnpm build` 2 页、`pnpm test` 25/25、`pnpm exec tsc --noEmit --incremental false` exit 0；产物中确认存在 `<p class="intro">` 与 `All publications →`。
- **待用户提供（阻塞真实内容）**：`site.yaml` 的 `name` / `title` / `affiliation` / `location` / `email` / `intro` 全部为 `TODO: 待用户提供`，`links` / `featuredPosts` / `selfAuthors` 为空；`content/publications.bib` 只有注释行。导入真实资料后需重跑 `scripts/sync_publications.py`。
- **状态**：Task 7–12 未开工（Publications / Research / Software / CV+About / 404+sitemap / 验收核验）。恢复入口 `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/.superpowers/sdd/2026-10-15-academic-site-implementation/progress.md`（首行标注 plan 路径；`Task <N>: complete` 行即已完成集合）。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

## 2026-10-16 13:55 — Task 6 复审修复（研究方向句 / All publications / 本人姓名强调 + 3 条 Minor）

- **Important 1（研究方向句缺失，控制端裁定真实）**：可视化方案 A 与 spec §9.4 的首页组成都是「名字开场 → 一句话研究方向 → 精选论文 → 最新笔记」。改动：`content/site.yaml` 新增本地化 `intro`（en/zh 均为 `TODO: 待用户提供`）、`src/lib/schemas.ts` 的 `siteProfileSchema` 加 `intro: localized`、`src/lib/types.ts` 的 `SiteProfile` 加 `intro: Localized`、`HomeContent.astro` 在 `.lead` 与联系方式之间以 `pick(locale, site.intro)` 渲染 `<p class="intro">`；spec §5.1 补 `intro` 字段行。
- **Important 2（缺「All publications →」链接，控制端裁定真实）**：可视化方案 A 在论文列表后即输出该链接，`/publications` 是 spec §4.1 定义、Task 7 将实现的正式路由。改动：`HomeContent.astro` 在论文块后加 `<p class="meta"><a href="/publications">All publications →</a></p>`（按 spec §4.1 Publications 仅英文，无中文变体）。
- **Important 3（本人姓名未强调，控制端裁定真实）**：新增显式自助标识而非猜测——`content/site.yaml` 加 `selfAuthors: []` 并附注释（逐字照抄 BibTeX `author` 字段写法，一种拼写一行；空数组表示不强调）；`siteProfileSchema` 加 `selfAuthors: z.array(z.string()).default([])`；`SiteProfile` 加 `selfAuthors: string[]`；`PublicationList.astro` 加 `selfAuthors?: string[]` 入参，作者行按「trim + 大小写无关的完全匹配」输出 `.me`（`font-weight: 600`，与可视稿一致），不做模糊匹配（`Xiang Li` ↔ `Li X` 无法可靠对应）；spec §5.1 登记 `selfAuthors`，§9.4 补一条说明该强调由显式列表驱动、不按姓名相似度猜测。
- **Minor 1（分隔符前置 bug，控制端裁定真实）**：联系方式行原先把 `' · '` 写在 `site.links` 每一项之前，邮箱被抑制而链接存在时会以悬空分隔符开头。改为先把「邮箱（真值时才加入）+ 链接」合成同一个条目数组，仅在 `index > 0` 时输出分隔符。
- **Minor 2（空列表容器，控制端裁定真实）**：`PublicationList.astro` 原先在 0 条时同时输出 `No publications yet.` 与空 `<ul class="pubs">`；改为三元分支，`items.length === 0` 时只输出提示、不渲染列表。
- **Minor 3（链接可访问性，控制端裁定真实）**：DOI / PDF / Code 三个裸链接各自加 `aria-label`，含论文题名（`DOI for <title>` 等），屏幕阅读器链接列表可区分。
- **未改动（控制端裁定非缺陷）**：`PublicationList` 的 `locale` 入参保持不参与运行期分支——brief 冻结了该接口、spec §4.1 规定 Publications 仅英文。`SiteFooter.astro` 的 `mailto:` 占位渲染与 0 条 `publications.json` 构建告警均为已登记的 deferred 项，本轮未触碰。
- **覆盖检查（提交前实跑）**：`pnpm exec tsc --noEmit --incremental false` → 退出码 0；`pnpm test` → **25/25 PASS**；`pnpm build` → **Complete!**、2 pages built（`dist/index.html`、`dist/zh/index.html`）；`PAGES_OK`；`grep -c "TODO" dist/zh/index.html` → 1；两语言产物均含 `<p class="intro">` 与 `/publications` 的「All publications →」链接；`grep -rn "content/" src/pages src/components` → `NO_DIRECT_ACCESS`；CDN 检索 → `NO_CDN`。
- **组件级探针（临时探针在 `.superpowers/.../tmp-probe/`，属 gitignore 的忽略目录、非交付物）**：用真实 `PublicationList` 与样例数据实测——`selfAuthors: ['li x', 'WANG Q']` 时 `Li X` 与 `Wang Q` 输出 `<span class="me">`、`zhang s` 不加粗；0 条时只输出 `No publications yet.`，无 `ul.pubs`；三个链接分别带 `aria-label="DOI/PDF/Code for Sample publication title"`。联系方式分隔符用同一条表达式对四种组合实测——links-only 与 email-only 均无前导分隔符、both 的两个分隔符只在条目之间、neither 整段不渲染。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件；未写项目根以外路径。
- 提交：`fix(home): 补研究方向句与本人姓名强调`（`77c98cf`）。

## 2026-10-16 13:44 — Task 6 Home 页（方案 A：姓名开场 + 精选论文）

- 按 `task-6-brief.md` 建首页：`src/components/PublicationList.astro`（论文列表组件，Task 7 复用）、`src/components/HomeContent.astro`（首页内容组件，接收 `locale`）、`src/pages/index.astro`（英文首页，替换 Task 5 的最小占位页）、`src/pages/zh/index.astro`（中文首页）。展示层只调用 `getSiteProfile()` 与 `listPublications({ featured: true, limit: 5 })` 两个冻结访问器，双语字段一律经 `pick()`。
- **版式取可视稿方案 A（brief 与可视稿冲突处按可视稿）**：`docs/design-mockups/01_页面设计_初稿.html` 的 `id="home-a"` 用左侧年份栏 + 标题 / 作者 / 出处的论文条目（`.pubs` grid `3.25rem 1fr`）、带边框的 `authorRole` 徽章、姓名下方的联系方式行；brief 片段里的简单列表与 `--step3` h1 覆盖值未采用。方案 B 的编号索引版式未出现在本页（保留给 `/research`）。
- **空数据兜底**：`content/site.yaml` 的姓名/职位/机构/邮箱仍为 `TODO: 待用户提供`、`links: []`、`featuredPosts: []`，`content/publications.json` 为 0 条。首页因此只渲染姓名、导语、分隔线、「Selected publications」标题与「No publications yet.」；联系方式行与「Recent notes」区块**整段不渲染**（不生成 `mailto:TODO` 死链、不留空标题），构建与两个语言页均正常产出。
- **验收（提交前实跑）**：`pnpm build` → **Complete!**、2 pages built（`dist/index.html`、`dist/zh/index.html`）；`pnpm test` → **25/25 PASS**（3 个文件，与 Task 5 持平）；`pnpm exec tsc --noEmit --incremental false` → 退出码 0、无输出；`PAGES_OK`（两页产物存在）；`grep -c "TODO" dist/zh/index.html` → 1（大于 0，中文分支生效）；`grep -rn "content/" src/pages src/components` → **NO_DIRECT_ACCESS**；新文件内 **NO_REMOTE_ASSET**（无远程字体 / 样式 / 脚本 / 图片）。
- **构建产物核查**：两页仅引用本地 `/_astro/*.css`，`<script>` / `<img>` / 远程字体与样式 0 个；外链只有页脚/导航的既有博客外链与 canonical 占位 `https://example.invalid/`（域名待定，来自 `astro.config.mjs`），无新增外部资源引用。
- **已知现象（非本任务缺陷）**：构建仍打印 `[WARN] [file-loader] No items found in ./content/publications.json` 与两行 collection empty 提示（0 条论文所致，Task 4 已登记，导入真实 `.bib` 后消失）；`SiteFooter.astro` 生成的 `mailto:TODO: 待用户提供` 占位链接是 Task 5 既有行为，不在本任务文件范围，未改动。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件；未写项目根以外路径。
- 提交：`feat(home): 首页与精选论文列表`（`7b7822b`）。

## 2026-10-15 17:18 — 学术主页实现：Task 4–5 完成（第二个检查点）

- **Task 4 适配层与语言回退**（`c1ec16a` + 修复 `f186a28`）：新增 `src/lib/i18n.ts`（`pick()` 唯一回退入口、`altPath()`）、`src/lib/data-select.ts`（纯函数，不依赖 `astro:content`，故可单测）、`src/lib/data-source.ts`（**全站唯一数据入口**，导出 `getSiteProfile` / `listPublications` / `listResearch` / `listSoftware` / `getCV` 五个冻结访问器）。修复轮解决 1 条重要问题：`listResearch()` 漏映射 `image`，导致 schema 支持的字段经唯一入口永远取不到。测试 25/25。
- **Task 5 设计令牌与基础布局**（`118380a` + 修复 `c6dba83`）：`src/styles/tokens.css`（与定稿可视稿逐值一致，含 `prefers-color-scheme` 暗色覆写）、`global.css`、`BaseLayout.astro`、`SiteNav.astro`、`LangSwitch.astro`、`SiteFooter.astro`。修复轮解决 1 条重要问题：**导航缺回首页入口**——已把站点名做成指向本语言首页的链接（`/` 与 `/zh/`），未新增第七个导航项。构建通过、无外域 CDN 引用、375px 无横向滚动。
- **视觉方向定稿**：可视稿 `docs/design-mockups/01_页面设计_初稿.html` 为用户确认的视觉参照；首页采用**方案 A**（名字开场 + 精选论文），方案 B 的编号索引改用于 `/research` 页首，已写入 spec §9.4。
- **控制端裁定的评审分歧（详见 ledger）**：① 评审称"页脚链接颜色偏离可视稿"——经直接核对可视稿，它只有**元素级** `a { color: var(--accent) }` 与**容器级** `footer.site { color: var(--muted) }`，元素级显式声明优先于继承，可视稿页脚链接实为强调色，实现正确，**不修改**；② 评审称 `LangSwitch` 该用 `pick()`——该标签命名的是目标语言、没有双语回退对象，**不修改**。
- **过程修正**：Task 3 的实施者曾按项目收尾规则自行往 Obsidian 追加过一条按任务的记录（16:21，仓库外写入）；此后所有派发已明令禁止写项目根以外，会话级记录改由控制端统一写（本人不删除已存在的那条，是否合并由用户决定）。
- **待用户确认**：新版全局规则要求"会话收尾 Obsidian 与语雀都要写"，本项目此前被指定为只写 Obsidian，本轮仍按此执行；如改为两端都写，需指定语雀归属模块页。
- **状态**：Task 6–12 未开工（页面层：Home / Publications / Research / Software / CV+About / 404+sitemap / 验收）。恢复入口 `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/.superpowers/sdd/2026-10-15-academic-site-implementation/progress.md`（首行标注 plan 路径；`Task <N>: complete` 行即已完成集合）。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

## 2026-10-15 17:15 — Task 5 复审修复（导航补首页入口 / 记录表去临时探针）

- **Finding 1（Important，控制端裁定为真实缺陷）**：`SiteNav.astro` 没有回首页的入口，Task 6–9 换掉 `index.astro` 后每个内页都成死胡同。修复：把**站点名**做成指向首页的链接放在导航最左（`/` for `en`、`/zh/` for `zh`），文案取 `getSiteProfile()` 的 `name` 经 `pick()` 渲染；**没有**新增第七个「Home」导航项。样式按「身份」而非「导航项」处理：`font-size: var(--step1)`（19px）+ `font-weight: 600`，默认无下划线、颜色沿用 `--text`，hover 走既有的 `a:hover`（强调色 + 下划线），focus 走全局 `a:focus-visible`（2px 强调色外描边）。结构上把语言切换器并入新的 `.nav-links` 包裹层，使桌面端保持「名称在左、链接与语言切换在右」。
- **Minor 2（控制端裁定为真实缺陷）**：`项目文件记录.md` 的 Task 5 小节里登记了被 `.superpowers/sdd/.gitignore` 忽略的临时探针 `tmp-probe/task5-measure.html`——该行已删除（文件本身保留备查，未删除）。其余结构未动。
- **未改动的三条（控制端裁定非缺陷/延后）**：① 页脚链接保持强调色 `#1e4e8c`（可视稿里 `a { color: var(--accent) }` 是元素级显式声明，胜过 `footer.site` 的容器级继承，实测 `rgb(30,78,140)` 与可视稿一致）；② `LangSwitch.astro` 的三元表达式不改（它写的是**目标语言**的写法，不是双语内容字段）；③ skip-to-content / 额外 landmark 属可选打磨，未做。
- **验收（提交前实跑）**：`pnpm build`（astro 5.18.2）→ **Complete!**、1 page built；`pnpm test` → **25/25 PASS**；`pnpm exec tsc --noEmit --incremental false` → 退出码 0、无输出；CDN grep → **NO_CDN**。
- **浏览器实测（headless Chrome + 临时探针，含 /cv 与 /zh/cv 两个注入路由，非目视）**：375px 下 `scrollWidth == clientWidth`（index / cv / zh-cv 三页均 375：无横向滚动）；站点名链接 `href` 分别为 `/`（en）与 `/zh/`（zh）、左内边距 20px（= `1.25rem`，确在最左）、19px/600、`#24292f`、默认无下划线；hover 规则 `a[data-astro-cid-…]:hover{color:var(--accent);text-decoration:underline}` 的选择器命中该链接、focus 后紧接外描边实测 `2px rgb(30, 78, 140)`；`nav aria-label="Primary"` 保持；`aria-current` 仍正确落在 `/cv` 与 `/zh/cv`；语言切换 `altPath` 双向正确。1200px 下导航内容框 640px 居中，名称 300..461、链接 509..858、语言切换 874..900（右内边距 20px），即「名称在左、链接与语言切换在右」的单行排布。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件。
- 提交：`fix(ui): 导航补首页入口并清理临时探针登记`。

## 2026-10-15 17:03 — Task 5 设计令牌与基础布局

- 按 `task-5-brief.md` 建基础层：`src/styles/tokens.css`（设计令牌，明暗两套变量）、`src/styles/global.css`（全局基础样式，全站唯一 CSS 入口，`@import` tokens）、`src/layouts/BaseLayout.astro`（HTML 骨架 + meta + 导航 + 页脚，接收 `locale / title / description`）、`src/components/SiteNav.astro`、`src/components/LangSwitch.astro`、`src/components/SiteFooter.astro`；`src/pages/index.astro` 由占位页改为使用 `BaseLayout` 的最小页（Task 6 会写正式首页内容）。
- **取值来源：可视稿优先**（spec §9.4 / `docs/design-mockups/01_页面设计_初稿.html`）。与 brief 片段不一致处一律取可视稿：`--measure: 40rem`（brief 为 72ch）、步骤字号 `0.8125 / 1 / 1.1875 / 1.4375 / 1.9375rem`、`line-height: 1.7`、正文衬线栈 `Georgia, "Times New Roman", "Songti SC", "Noto Serif SC"`、无衬线栈含 `"Helvetica Neue"`、`hr` 外边距 2.5rem、`pre` 无圆角、`text-underline-offset: 0.18em`。令牌名沿用计划接口约定 `--text-muted`（可视稿写 `--muted`，值相同），另保留 `--muted: var(--text-muted)` 别名，避免后续照抄可视稿片段时取不到颜色。
- **组件样式同样取自可视稿**：导航 `gap: 1rem` / `ul` 间距 1.15rem / `aria-current` 用强调色 + 2px 下边框；页脚用上边框充当分隔线（不再另插 `<hr>`，故 brief 片段里的 `footer a { color: var(--text-muted) }` 未采用——可视稿里页脚正文是弱化色、链接仍是 accent），无衬线 0.8125rem。
- **无障碍与兜底**：`a:focus-visible` / `button:focus-visible` 保留 2px 强调色外描边；`prefers-reduced-motion: reduce` 关闭动效；`img, svg { max-width: 100% }`。
- **验收（提交前实跑）**：`pnpm build`（astro 5.18.2）→ **Complete!**、1 page built；`pnpm test` → **25/25 PASS**（vitest 3.2.7，3 个文件）；`pnpm exec tsc --noEmit --incremental false` → 退出码 0、无输出；`grep -rn "fonts.googleapis\|cdn.jsdelivr\|cdnjs\|unpkg" src/ public/` → **NO_CDN**。
- **浏览器实测（headless Chrome + 临时探针，非目视）**：375px 视口下 `documentElement.scrollWidth = clientWidth = 375`（无横向滚动）；浅色模式实测 `body` 背景 `rgb(253,253,252)`、导航字号 13px、导航项 `rgb(36,41,47)`、语言切换 `rgb(107,114,128)`、页脚文字 `rgb(107,114,128)` 而页脚链接仍为强调色 `rgb(30,78,140)`；`--force-dark-mode` 下背景转为 `rgb(22,24,29)`、链接转 `rgb(138,180,248)`，深色变量生效。探针 `tmp-probe/task5-measure.html` 属忽略目录、非交付物（保留备查，未删除）。
- **构建产物外部引用核查**：`dist/index.html` 全站仅两处外链，均为普通 `<a href>`/canonical——`https://lixiang117423.github.io`（用户自己的博客）与 canonical 占位 `https://example.invalid/`（来自 `astro.config.mjs` 的待定 `site`）；`<script>` 标签 0 个、远程字体/样式/图片 0 个。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件。
- 提交：`feat(ui): 设计令牌与基础布局`。

## 2026-10-15 16:55 — Task 4 复审修复（image 字段 + pick 空白回退用例）

- **Finding（Important，计划层缺陷）**：`listResearch()` 原先只映射 `{ slug, title, summary, order, keywords }`，漏掉 `ResearchItem.image?: string`（定义在 `src/lib/types.ts`、research schema 接受、spec §「research 条目」也登记了该字段）——因页面只允许调用冻结的五个访问器，任何研究配图都取不到。brief Step 9 的代码片段本身即漏字段，属计划缺陷。按控制端 2026-10-15 裁决修复。
- **改动 1**：`src/lib/data-source.ts` 的 `listResearch()` 映射补一行 `image: entry.data.image`，返回完整 `ResearchItem`（其余字段与签名不变）。
- **改动 2（Minor）**：`tests/i18n.test.ts` 补 1 个用例——`pick('zh', { en: 'Hello', zh: '   ' })` 应回退 `'Hello'`；brief 明确要求「中文为空串或纯空白都回退英文」，实现（`value.zh.trim() !== ''`）本就正确，缺的是用例。用例数 4 → 5。
- **验收（提交前实跑）**：`pnpm test` → **25/25 PASS**（vitest 3.2.7；i18n 5 + data-select 5 + content-schema 15）；`pnpm exec tsc --noEmit --incremental false` → 退出码 0、无输出（`image` 为可选属性，`entry.data.image` 赋给 `image?: string` 在 strict 下通过）；`pnpm build`（astro 5.18.2）→ **Complete!**、1 page built。
- **运行期复核（真实 content layer 探针）**：更新 `.superpowers/.../tmp-probe/probe.astro`（忽略目录，非交付物）打印 `hasImageKey` 与 `image`，重建探针后实测 `listResearch()` 返回对象含 `image` 键：`{"slug":"effector-genomics",...,"hasImageKey":true,"image":null}`——`image` 是 `entry.data.image` 的直通映射，当前样例文件未配图故为 `null`。
- **未做（明确 out of scope）**：未动 `data-source.ts` 的结构性断言、`data-select.test.ts` 的 `as never`、未补 `year` 筛选用例、未处理空集合构建告警。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件。
- 提交：`fix(data): listResearch 返回 image 字段并补 pick 空白回退用例`。

## 2026-10-15 16:48 — Task 4 适配层与语言回退

- 按 `task-4-brief.md` 实现展示层的数据入口与双语回退：`src/lib/i18n.ts`（`pick()` / `localeFromPath()` / `altPath()` / `LOCALES` / `DEFAULT_LOCALE`，中文缺失或空串回退英文）、`src/lib/data-select.ts`（纯函数 `filterPublications()` / `sortResearch()` / `sortSoftware()`，不 import `astro:content`，因此可单测）、`src/lib/data-source.ts`（唯一 `astro:content` 数据入口，导出冻结的五个访问器 `getSiteProfile` / `listPublications` / `listResearch` / `listSoftware` / `getCV`）。
- **TDD 证据（RED → GREEN，两轮）**：① `tests/i18n.test.ts`（brief 逐字 4 例）先跑 `pnpm test` → `Error: Cannot find module '../src/lib/i18n'`（`Test Files 1 failed | 1 passed`，Collection 期失败，符合预期：模块尚未创建）；写 `src/lib/i18n.ts` 后 → `tests/i18n.test.ts (4 tests)` 通过。② `tests/data-select.test.ts`（brief Step 5 逐字 5 例）先跑 → `Cannot find module '../src/lib/data-select'`（`1 failed | 2 passed`）；写 `src/lib/data-select.ts` 后 → 5 例通过。最终 `pnpm test` **24/24 PASS**（vitest 3.2.7，3 个文件）。
- **验收门**：`pnpm test` 24/24 PASS；`pnpm exec tsc --noEmit --incremental false` 退出码 0、无输出；`pnpm build`（astro 5.18.2）成功、1 page built；`grep -rn "content/" src/pages src/components` → `NO_DIRECT_ACCESS`；`astro:content` 的 import 只出现在 `src/lib/data-source.ts`（取数）与 `src/content.config.ts`（集合定义），符合「单一取数入口」。
- **运行期探针（真实 content layer，实测非推断）**：因 `data-source.ts` 依赖 `astro:content`、vitest 无法加载，另用一个临时 Astro 配置注入 `/__probe` 路由（探针与产物都在 `.superpowers/sdd/2026-10-15-academic-site-implementation/tmp-probe/`，被 `.superpowers/sdd/.gitignore` 忽略，不进仓库），`astro build` 后读到实测值：`getSiteProfile()` 返回 site.yaml（占位串/`blog.label` 双语/`links: []`）、`listPublications()` → `0` 条、`listResearch()` → slug `effector-genomics`（order 1、双语标题、keywords 齐全）、`listSoftware()` → slug `biortools`（name `bioRtools`、language `R`）、`getCV()` → 四个分组齐全。可证 `glob`/`file` loader 的 entry id 与 `data-source.ts` 的取值方式一致。
- **已知现象（非本任务缺陷）**：`content/publications.json` 当前 `count: 0`，Astro `file` loader 不注册集合，构建时会打印 `[WARN] [file-loader] No items found in ./content/publications.json` 与两行 `The collection "publicationsGenerated" does not exist or is empty.`；`getCollection()` 此时返回 `[]`（不抛错），故 `listPublications()` 如实返回空数组，用户从 Zotero 导入真实 `.bib` 并重跑管道后该告警消失。
- **偏离 brief 一处（Files 清单自相矛盾，按正文执行）**：brief 顶部 Files 列了 `tests/data-source.test.ts`，但其 Step 5 正文明确要求写 `tests/data-select.test.ts`（并解释 `data-source.ts` 直接 `import 'astro:content'`、vitest 无法解析）。据此新建的是 `tests/data-select.test.ts`，未创建 `tests/data-source.test.ts`（该文件在 brief 正文里没有任何用例内容），`data-source.ts` 的运行期正确性改由上述真实 content layer 探针证明。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改；未删除任何文件。
- 提交：`feat(data): 适配层 data-source 与语言回退`。

## 2026-10-15 16:41 — 页面设计初稿（可视稿，供用户定方向）

- 按 `frontend-design` 产出单文件可视稿 `docs/design-mockups/01_页面设计_初稿.html`（自包含、无外部 CDN、含明暗两套 CSS 变量），同一页内并置 6 个画面：首页方案 A（名字开场 + 精选论文，最安静）、首页方案 B（编号索引式研究方向，个性更强）、Publications、Research、Software、CV。
- 设计取向（相对 spec §9 的落地）：一栏定宽约 40rem、结构靠字号/字重/间距而非卡片圆角阴影、单一深蓝强调色 `#1e4e8c`、正文衬线 + 导航与元数据无衬线、论文列表年份挂在左侧等宽栏、无渐变无毛玻璃无卡片堆 —— 刻意避开 AI 生成页面最集中的「米色底 + 赭石强调 + 同款圆角卡片」组合。
- 稿内论文/机构等均为**明确标注的占位内容**，未编造任何真实论文、DOI、作者或机构名（遵循全局「事实核验规范」）。
- 本稿仅用于定视觉方向，**不影响 Task 4–12 的计划**：正式实现仍按 spec §9 的令牌与计划 Task 5 落地，方向一经确认即把方案写回 spec §9。
- 本地预览：`/Users/lixiang/miniforge3/envs/python/bin/python3 -m http.server 8765 --directory docs/design-mockups`，浏览 `http://localhost:8765/`。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。

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

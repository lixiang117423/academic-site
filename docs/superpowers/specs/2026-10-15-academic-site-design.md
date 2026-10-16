# 个人学术网站设计方案（Spec）

| 项 | 内容 |
| --- | --- |
| 日期 | 2026-10-15 |
| 状态 | 待用户复审 |
| 项目根 | `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web` |
| 关联文档 | `AGENTS.md`、`项目文件记录.md`、`CHANGELOG.md` |
| 下一阶段 | 由本 spec 生成实现计划（implementation plan），再动代码 |

---

## 1. 背景

用户为博士后研究者（生物信息学，R 为主、Python 辅助），研究涉及 *Phytophthora sojae*、*Glycine max* / *G. soja*、十字花科作物与病原等。已维护两个线上资产：

- **博客「小蓝哥的知识荒原」**：Hexo 6.3 + Fluid 主题，384 篇文章，内容经 `yuque-hexo` 从语雀同步，部署目标是 `git@github.com:lixiang117423/lixiang117423.github.io.git` 的 `main` 分支，配置中登记的站点域名为 `www.web4xiang.com`。
- **早期 R bookdown 站点**（`bs4_book`）：本地 `/Users/lixiang/NutstoreFiles/03.编程相关/lixiang117423.github.io`，同时挂 gitee（`book4xiang`）与 github 两个远端。

两者都不承载「学术主页」这一职能——即 publications、research、CV、software 这类需要被同行、合作者与评审快速扫读的内容。本项目新建一个独立的学术主页。

## 2. 目标与非目标

### 2.1 目标

1. 建立独立的个人学术主页，让同行在 30 秒内看清「这个人做什么研究、发表过什么、能用哪些工具、怎么联系」。
2. 保持轻量：纯静态产物，零常驻服务、零数据库、零运维负担。
3. 在真正有意义的地方做前后端分离：内容层与展示层物理分离，所有数据访问收口到单一适配层，将来若引入后端 API，展示层无需改动。
4. 内容可低成本维护：论文从 BibTeX 单一来源生成，软件信息可自动同步，避免手工维护多处副本。
5. 中文读者与国际读者都能用：页面骨架双语，学术内容（论文题录）以英文为主。

### 2.2 非目标（明确不做）

- 不建站内博客，不迁移既有 384 篇文章。
- 不做评论、留言板、访问统计、站内搜索。
- 不做后台管理 / CMS，不建任何常驻后端服务或数据库。
- 不引入外部 CDN 依赖（字体、JS、CSS 全部自托管或内联）。
- 本阶段不绑定具体托管平台与域名。
- 不做用户账户、登录、任何形式的动态写入。

## 3. 与既有站点的关系

| 项 | 决定 |
| --- | --- |
| 新站定位 | 全新独立学术主页，与既有博客是**两个独立站点** |
| 既有 Hexo 博客 | **原样保留、不迁移、不改动**。本地目录 `/Users/lixiang/NutstoreFiles/03.编程相关/hexo` 不参与本项目构建 |
| 既有 bookdown 站点 | **保持不动** |
| 互链方式 | 新站导航含一项指向既有博客的外链（配置写在 `content/site.yaml`，不硬编码在组件里）；反向链接由用户在博客侧自行添加，本项目不代改 |
| 代码复用 | 不共用仓库、不共用构建流程；本项目不得跨目录写入既有站点 |

> 已知风险提示：既有 bookdown 仓库本地 `master` 分支领先 gitee 1 个提交，且存在未提交改动。本项目**不处理**该状态，仅在交付说明中提醒用户自行决定。

## 4. 信息架构

### 4.1 路由

英文为默认语言（无前缀），中文位于 `/zh/` 前缀下。

| 路由 | 页面 | 语言 | 内容要点 |
| --- | --- | --- | --- |
| `/` · `/zh/` | Home / 首页 | 双语 | 姓名、职位、机构；一句话研究方向；精选论文 3–5 条（由 `publications.bib` 的 `annotation` 标记 `featured`）；最新笔记外链（来自 `site.yaml` 的 `featuredPosts`）；联系方式区块 |
| `/about` · `/zh/about` | About / 关于 | 双语 | 履历摘要、研究兴趣、完整联系方式与社交链接 |
| `/research` · `/zh/research` | Research / 研究方向 | 双语 | 按 `order` 排序的研究方向条目，每个方向一段摘要（中英各一版，中文缺失回退英文） |
| `/publications` | Publications | **仅英文** | 论文题录全部内容，按年份倒序、按类型分区（期刊 / 会议 / 预印本 / 专著 / 书章 / 学位论文 / 报告 / 其他）；每条含 DOI / PDF / Code 链接 |
| `/software` · `/zh/software` | Software / 软件 | 双语 | 每个软件一张紧凑条目：名称、一句话说明、语言、安装命令、仓库链接 |
| `/cv` · `/zh/cv` | CV / 简历 | 双语 | 网页版简短时间线（教育、职位、代表性成果）；下载中英两份 PDF |
| `/404` | — | — | 静态 404 页 |
| `sitemap.xml` · `robots.txt` | — | — | 构建期生成 |

### 4.2 导航

顶部导航固定五项：About、Research、Publications、Software、CV，外加一项**外链** Blog。语言切换控件位于导航右侧，切到同一页面的另一语言版本（中文页面缺失时回退到对应英文页）。

### 4.3 已确认的架构判断

- **Contact 不单独建页**：邮箱与社交链接放在 Home 底部区块与 About 页内。单独的「联系我」页对个人站过薄。
- **无 RSS**：本站没有站内博客，RSS 无消费场景。

## 5. 内容模型（数据层）

数据层全部位于 `content/`，与展示代码物理分离。中文为**可选覆盖**：缺失时自动回退英文，不阻塞构建。

### 5.1 `content/site.yaml`

站点级单一配置源。字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | object | `{ en, zh }`，展示用姓名 |
| `title` | object | `{ en, zh }`，职位/头衔 |
| `affiliation` | object | `{ en, zh }`，所属机构 |
| `intro` | object | `{ en, zh }`，首页「一句话研究方向」，渲染在姓名导语与联系方式之间 |
| `location` | string | 城市/国家 |
| `email` | string | 公开邮箱 |
| `selfAuthors` | array | 本人作者名列表：逐字照抄 BibTeX `author` 字段里的写法（如 `Li X`），一种拼写一行；空数组表示论文作者行不做任何加粗强调 |
| `links` | array | `{ label, url, icon }`，如 GitHub、ORCID、Google Scholar、ResearchGate |
| `blog` | object | `{ label, url }`，指向既有博客的外链 |
| `featuredPosts` | array | `{ title, url, date }`，首页展示的最新笔记外链；**手工维护**（见 12 节待定项） |

> `name` / `title` / `affiliation` / `email` / `links` / `blog.url` 的真实值**待用户提供**，在此之前使用明确的占位内容并保持构建通过；**不得臆造**机构名、ORCID iD 或社交主页地址。

### 5.2 `content/publications.bib`

论文的**唯一权威源**，BibTeX 格式（用户可直接从 Zotero 导出）。每条 entry 使用以下字段：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `title` | 是 | 论文标题 |
| `author` | 是 | 作者列表，BibTeX `and` 分隔 |
| `year` | 是 | 年份，用于排序与分组 |
| `journal` / `booktitle` | 是 | 期刊或会议名 |
| `doi` | 建议 | 有 DOI 必填，用于链接与事实核验 |
| `url` | 可选 | 出版社页面或 PDF 链接 |
| `eprint` / `archivePrefix` | 可选 | 预印本（如 bioRxiv DOI） |
| `keywords` | 可选 | 逗号分隔标签，用于 Research 页交叉引用 |
| `annotation` | 可选 | 自定义字段，用于标记 `featured`、`co-first`、`corresponding` |

### 5.3 `content/publications.json`（生成物）

由 `scripts/sync_publications.py` 从 `.bib` 生成，**随仓库提交**（保证托管平台无 Python 环境也能构建）。Astro 侧通过 `file()` loader 读取并用 zod schema 校验。结构：

```json
{
  "generated_at": "2026-10-15T15:13:00+08:00",
  "source": "content/publications.bib",
  "count": 0,
  "items": [
    {
      "id": "string",
      "title": "string",
      "authors": ["string"],
      "year": 2026,
      "venue": "string",
      "type": "journal | conference | preprint | book | book-chapter | thesis | report | other",
      "doi": "string | null",
      "url": "string | null",
      "code": "string | null",
      "pdf": "string | null",
      "keywords": ["string"],
      "featured": false,
      "authorRole": "first | co-first | corresponding | co-author"
    }
  ]
}
```

### 5.4 `content/research/*.md`

一个研究方向一个文件。frontmatter：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `title` | 是 | `{ en, zh }` |
| `summary` | 是 | `{ en, zh }`，一段话摘要，用于 Research 列表页 |
| `order` | 是 | 整数，决定展示顺序 |
| `keywords` | 否 | 数组，与 `publications.json` 的 `keywords` 对应，用于自动关联相关论文 |
| `image` | 否 | 图片路径（相对 `public/`） |

**2026-10-15 修订**：原方案让中英各一个文件、各自携带一份 frontmatter，同一份 `title` / `summary` 要在两处重复维护，迟早漂移；改为**一个方向一个文件** `content/research/<slug>.md`，`title` 与 `summary` 各自带 `{ en, zh }` 双语字段、只写一份。正文不单独维护——`summary` 字段本身可容纳一段到两段描述，Research 页直接展示它。将来确实需要长正文时再加详情页，不提前引入。

### 5.5 `content/software/*.md`

一个软件一个文件（bioRtools、biopytools、DeepBSA-rs 等）。frontmatter：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `name` | 是 | 软件名 |
| `tagline` | 是 | `{ en, zh }`，一句话说明 |
| `repo` | 是 | 仓库 URL |
| `language` | 是 | 主要语言 |
| `install` | 否 | 安装命令（代码块内容） |
| `docs` | 否 | 文档链接 |
| `order` | 否 | 展示顺序 |

`scripts/sync_github.py`（可选）可从 GitHub API 拉取仓库描述、star 数、最近提交时间，写入生成的 `content/software-meta.json`；**不由脚本改写用户手写的 `.md`**。

### 5.6 `content/cv.yaml`

网页版履历结构化数据，字段：`education[]`、`positions[]`、`awards[]`、`talks[]`，每个条目含 `{ start, end, title, org, note }`，其中 `title` / `org` / `note` 支持 `{ en, zh }`。PDF 文件放 `public/cv/cv-en.pdf` 与 `public/cv/cv-zh.pdf`，**由用户提供，本方案不生成**。

## 6. 架构与数据流

```
content/                    数据层（等价于「后端」）
  site.yaml
  publications.bib  ──(scripts/sync_publications.py)──>  publications.json
  research/*.md
  software/*.md
  cv.yaml
        │
        │  构建期读取（只读）
        ▼
src/lib/data-source.ts      适配层 —— 全站唯一允许接触数据的地方
        │
        ▼
src/pages/**  src/components/**   展示层
        │
        │  astro build
        ▼
dist/                       纯静态产物（HTML + CSS + 少量 JS + 静态资产）
```

### 6.1 适配层接口（先冻结，便于将来 API 化）

`src/lib/data-source.ts` 导出以下异步函数，展示层**只允许**通过这些函数取数：

| 函数 | 返回 |
| --- | --- |
| `getSiteProfile()` | `site.yaml` 的解析结果（含语言回退后的结果） |
| `listPublications(options?)` | `options` 支持 `{ featured?, year?, keyword?, limit? }`；返回 `Publication[]` |
| `listResearch()` | 按 `order` 排序的 `ResearchItem[]` |
| `listSoftware()` | 按 `order` 排序的 `SoftwareItem[]` |
| `getCV()` | 履历结构 + 两份 PDF 的路径与存在性 |

**将来接 API 的替换方式**：新增 `src/lib/data-source.api.ts`，实现同名同签名的函数，由环境变量在构建期选择实现（`DATA_SOURCE=local|api`）。展示层与组件**一行不改**。若届时需要服务端渲染，再把 `astro.config.mjs` 的 `output` 从 `static` 改为 `hybrid`，只对需要动态数据的具体路由启用 SSR——不必整体重写。

### 6.2 语言回退规则

单一实现点：`src/lib/i18n.ts` 中的 `pick(locale, { en, zh })`，当 `locale === 'zh'` 且 `zh` 为空/未定义时返回 `en`。所有双语字段必须经此函数取值，禁止在各组件里另写回退逻辑。

## 7. 目录结构

```
/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/
├── AGENTS.md                     项目级规则
├── README.md                     人读的项目说明
├── 项目文件记录.md                 文件级登记表
├── CHANGELOG.md                  进度与决策记录
├── .gitignore
├── .editorconfig                 统一 UTF-8 / LF
├── package.json
├── pnpm-lock.yaml
├── astro.config.mjs
├── tsconfig.json
├── content/                      数据层
│   ├── site.yaml
│   ├── publications.bib
│   ├── publications.json         由脚本生成，随仓库提交
│   ├── cv.yaml
│   ├── software-meta.json        由 sync_github.py 生成，随仓库提交
│   ├── research/*.md
│   └── software/*.md
├── scripts/                      数据管道（Python 3.13）
│   ├── sync_publications.py
│   └── sync_github.py
├── src/                          展示层
│   ├── lib/data-source.ts        适配层（唯一数据入口）
│   ├── lib/i18n.ts               语言回退
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   ├── pages/
│   └── styles/tokens.css + global.css
├── public/                       静态资产
│   ├── cv/cv-en.pdf  cv-zh.pdf
│   ├── avatar.*
│   └── favicon.*
└── docs/superpowers/specs/       设计与实现计划
```

**明确不套用**全局规则中的 `data/ code/ result/ manuscript/` 生信分析目录规范——那套面向数据分析项目，用于网站只会增加噪音。此约定已写入项目 `AGENTS.md`。

## 8. 技术选型与理由

| 项 | 选择 | 理由 |
| --- | --- | --- |
| 框架 | Astro 5（`output: 'static'`） | 内容优先、默认零 JS、构建产物即静态文件；相比 Next.js 体量与复杂度低一个数量级；需要交互时可局部注水 |
| 语言 | TypeScript（strict） | 内容 schema 校验与重构安全 |
| 样式 | 手写 CSS（`tokens.css` + `global.css` + 组件内 scoped style） | 站点样式量小；design tokens 直接可控；避免 utility 框架把设计推向模板感 |
| 字体 | 自托管（woff2 放 `public/fonts/`） | 避免 Google Fonts / jsDelivr 在国内访问不稳；现有 bookdown 站首页就引了 cdnjs 与 jsdelivr |
| 图标 | 内联 SVG | 不引运行时图标库 |
| i18n | Astro 内置 `i18n` | 无需第三方方案 |
| 内容解析 | Python 3.13 + `bibtexparser` 生成 JSON，Astro 侧用 `file()` loader + zod | 不在 JS 生态里重复实现 BibTeX 解析，符合「复用既有工具、不另起一套实现」的原则 |
| 包管理 | `pnpm`（本机 11.21.0） | 已安装；硬链接省磁盘、依赖目录更小（本项目位于坚果云同步盘内） |
| 部署 | 本阶段不绑定平台 | 只保证 `pnpm build` 产出可托管于任意静态空间的 `dist/`；域名与平台待定 |

**未采用方案与否决理由**：

- **真 SPA + 常驻后端 API**：学术站内容 95% 是静态的，引入服务器、数据库、备份、证书只带来持续运维义务，换回的动态能力在本场景用不上。真需要时由 6.1 的适配层平滑接入，切换成本已被前置消化。
- **继续用 Hexo 换主题**：Hexo 6.3 偏旧、主题定制受模板语法限制，且会把学术内容与 384 篇笔记混在同一站点。
- **Quarto 网站**：R 生态顺手、BibTeX 原生支持，但版式可控性与内容/展示分离度不足，最终页面会带明显 Quarto 印记。

## 9. 视觉方向

只在此定基调与设计令牌；**具体版式留到实现阶段用浏览器 mockup 与用户确认后定稿**。

### 9.1 原则

1. **安静、可扫读、可引用**——面向同行的检索式阅读，不是营销页。
2. **结构靠排版建立**，不靠卡片、圆角、阴影、渐变；避免「每段一个 box」的堆叠。
3. **Publications 是主角**：视觉权重最高，条目紧凑、年份分组清晰、外链齐整。
4. **单一强调色 + 中性底**：符合全局「单一强调色」约定，也避开 AI 生成页面最集中的米色底加赭石强调组合。
5. **动效克制**：只保留回应式交互（hover、展开），不做入场动画。

### 9.2 设计令牌（初稿，实现阶段微调）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--bg` | `#FDFDFC` | 页面底色（不用纯白） |
| `--surface` | `#F6F6F4` | 代码块、次级区块 |
| `--text` | `#24292F` | 正文（不用纯黑） |
| `--text-muted` | `#6B7280` | 元数据、年份、图注 |
| `--accent` | `#1E4E8C` | 唯一强调色：链接、当前导航项、下划线 |
| `--border` | `#E3E3E0` | 分隔线、表格三线 |

深色模式通过 `prefers-color-scheme` 覆盖同一组变量，不引入第二套选择器体系。

### 9.3 字体

正文用衬线（学术阅读感），导航与元数据用无衬线。具体字体族在实现阶段确认授权与自托管可行性后再定，需同时覆盖拉丁字符与中文字形；中文字形缺失会导致方块字，必须在出图/发布前用字形覆盖自检（`systemfonts::glyph_info()` 或等效手段）验证。

### 9.4 视觉方向定稿（2026-10-15）

- **可视稿（实现阶段的视觉参照）**：`docs/design-mockups/01_页面设计_初稿.html` —— 单文件自包含，含首页两方案与 Publications / Research / Software / CV 四个内容页。
- **首页采用可视稿的方案 A**（名字开场 → 一句话研究方向 → 精选论文 → 最新笔记）。理由：首页的职责是让人在 30 秒内知道"你是谁、做什么、发过什么"，把研究方向铺满首屏会削弱 §9.1 第 3 条"Publications 是主角"。
- **方案 B 的编号索引式研究方向改用于 `/research` 页首**：Research 页本来就是承载研究内容的地方，索引式排版在那里密度合适。
- **本人作者名强调由 `site.yaml` 的 `selfAuthors` 显式列表驱动**，不做模糊匹配：`Xiang Li` 与 BibTeX 里的 `Li X` 之间无法可靠自动对应，按姓名相似度猜测会误标同名他人，因此要求用户逐条登记其在论文中实际使用的作者名写法。
- Publications / Research / Software / CV 按可视稿对应的单版式实现。
- §9.2 的令牌与 §9.3 的字体策略以可视稿中的实际取值为准（可视稿用的系统字体栈是"离线可用"的兜底方案，实现阶段若自托管字体更像样再替换，但必须保证中文字形覆盖）。
- 可视稿顶部的说明条与全部"示例占位"文本**不进正式站点**。

## 10. 验收标准

实现完成后逐条核验：

| # | 标准 | 核验方式 |
| --- | --- | --- |
| 1 | `pnpm build` 成功，`dist/` 全部为静态文件 | 本地实跑，检查 `dist/` 无服务端产物 |
| 2 | 首屏 JS 不超过 30 KB（gzip） | 检查构建产物中 `.js` 体积 |
| 3 | 无任何外部 CDN 请求 | 构建产物中检索 `http://` 与 `https://` 外链资源引用 |
| 4 | 展示层不直接读数据源 | 检索 `src/`，除 `data-source.ts` 外不得出现对 `content/` 的直接读取 |
| 5 | 双语回退正确 | 人为缺失一个 `zh` 字段，确认页面回退英文且构建不报错 |
| 6 | 移动端 375px 宽无横向滚动 | 浏览器实测 |
| 7 | 中文无方块与乱码 | 字体字形覆盖自检加渲染核对 |
| 8 | 键盘可达、焦点可见 | 逐页 Tab 走查 |
| 9 | `prefers-reduced-motion` 生效 | 系统开启减弱动效后核验 |
| 10 | `sitemap.xml`、`robots.txt`、`404` 存在且内容正确 | 直接打开对应产物 |

## 11. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 项目位于坚果云同步盘内，`node_modules/` 会造成同步风暴 | 大量小文件反复同步、拖慢机器 | 依赖目录进 `.gitignore` 并加入坚果云排除；实施前提示暂停同步 |
| 站点内展示的论文题录与真实记录不符 | 学术场景属硬伤 | 题录由 BibTeX 单一来源生成；DOI 一律经 Crossref 核验后再写入，未核验不得上线（遵循全局事实核验规范） |
| 中文字体缺字形，发布后出现方块 | 中文读者看到乱码 | 字体自托管加字形覆盖自检；中文内容优先用系统字体回退链 |
| 域名与托管待定 | 上线时间不确定 | 架构不依赖具体平台；`dist/` 可放任意静态空间，切换平台零改造成本 |
| 中英双语内容长期只写一半 | 中文页面留空 | 中文为可选覆盖，缺失自动回退英文，页面不会破损；仅骨架页强制双语 |

## 12. 待定项（需用户决策，非本方案疏漏）

| 待定项 | 影响范围 | 决策时点 |
| --- | --- | --- |
| 域名归属与注册商（`web4xiang.com` 是否在手） | 部署平台选择、canonical URL | 实施后期 |
| 托管平台（Cloudflare Pages / GitHub Pages / 其他） | CI 与发布流程 | 部署阶段 |
| 站点展示信息（姓名写法、机构、职位、邮箱、ORCID、社交链接） | 首屏与 About 页内容 | 填充内容前 |
| 中英 CV PDF 原件 | CV 页下载链接 | 填充内容前 |
| 正文字体最终选型 | 视觉定稿 | 视觉设计阶段 |
| 首页「最新笔记」列表的维护方式（当前方案为 `site.yaml` 手工维护；自动同步语雀属后续增强，本阶段不做） | 首页内容更新频率 | 内容填充阶段 |

> **2026-10-16 更新（决策落地）**：托管平台定为 **GitHub Pages 项目站点** <https://lixiang117423.github.io/academic-site/>，发布流水线为 `.github/workflows/deploy.yml`（push `main` → `pnpm test` → `pnpm build` → 发布 `dist/`）。因账号根域名已被既有 Hexo 博客占用，本站位于 `/academic-site/` 子路径，故 `astro.config.mjs` 设 `site` + `base`，站内绝对链接统一经 `src/lib/base.ts` 补前缀（实施方式见 `CHANGELOG.md` 2026-10-16 16:04 条）。**域名仍未定**；将来绑定自定义域使站点落在域名根路径时，只需删掉 `base` 一行，组件无需改动（GitHub Pages 为境外托管，无需 ICP 备案）。其余待定项（正文字体最终选型、最新笔记维护方式）状态不变。

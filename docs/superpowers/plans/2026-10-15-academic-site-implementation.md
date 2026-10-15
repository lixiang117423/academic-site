# 个人学术网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web` 构建纯静态的个人学术主页（Home / About / Research / Publications / Software / CV），内容层与展示层分离，无外部 CDN 依赖，可与既有 Hexo 博客互链。

**Architecture:** Astro 5 以 `output: 'static'` 构建。`content/` 存放全部数据（YAML / BibTeX / Markdown），Python 脚本把 `publications.bib` 转为 `publications.json`，`src/lib/data-source.ts` 是展示层唯一的数据入口，页面与组件只调用它导出的五个函数。中文内容为可选覆盖，经 `src/lib/i18n.ts` 的 `pick()` 回退英文。

**Tech Stack:** Astro 5 · TypeScript (strict) · zod（Astro 内置）· vitest · 手写 CSS 设计令牌 · Python 3.13 + `bibtexparser` + `pytest` · pnpm 11.21.0 · Node v26.11.1

**Spec:** `/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/docs/superpowers/specs/2026-10-15-academic-site-design.md`

## Global Constraints

以下约束对**每一个任务**生效，不在各任务中重复：

- 项目根（全部命令在此执行）：`/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web`
- 包管理器 `pnpm`（11.21.0）、Node v26.11.1、Python `/Users/lixiang/miniforge3/envs/python/bin/python3`
- Astro 5，`output: 'static'`；TypeScript `strict: true`
- **不引** Tailwind、UI 组件库、运行时图标库；样式一律手写 CSS + 设计令牌
- **不引**任何外部 CDN（字体、JS、CSS 全部自托管或内联）；构建产物不得出现指向外域的资源引用
- 展示层**只允许**经 `src/lib/data-source.ts` 取数，`src/pages/**` 与 `src/components/**` 不得直接读 `content/`
- 双语字段**只允许**经 `src/lib/i18n.ts` 的 `pick()` 取值，禁止在组件里另写回退逻辑
- 中文为可选覆盖：缺失时回退英文，且构建必须保持通过
- 语言路由：英文无前缀，中文在 `/zh/` 前缀下
- 文件一律 UTF-8（无 BOM）+ LF 换行
- 提交信息格式 `<类型>(<模块>): 描述`，类型取 `feat` / `fix` / `docs` / `refactor` / `test` / `chore`
- **不得删除或覆盖任何已有文件**；需要清理时报清单交用户
- 不得写入 `/Users/lixiang/NutstoreFiles/03.编程相关/hexo` 与 `/Users/lixiang/NutstoreFiles/03.编程相关/lixiang117423.github.io`
- 需用户提供的内容值（姓名、机构、邮箱、社交链接、CV PDF）统一写成字符串 `TODO: 待用户提供`，并保证构建通过；**不得臆造**

## 文件结构

| 路径 | 职责 |
| --- | --- |
| `package.json` | 依赖与脚本（`dev` / `build` / `preview` / `test`） |
| `astro.config.mjs` | Astro 配置：静态输出、i18n、站点 URL |
| `tsconfig.json` | TypeScript 严格模式 |
| `.editorconfig` | UTF-8 / LF / 缩进统一 |
| `content/site.yaml` | 站点档案：姓名、机构、邮箱、社交链接、博客外链、首页笔记外链 |
| `content/publications.bib` | 论文唯一权威源（BibTeX） |
| `content/publications.json` | 由脚本从 `.bib` 生成，随仓库提交 |
| `content/cv.yaml` | 网页版履历结构化数据 |
| `content/research/*.md` | 研究方向条目，命名 `<slug>.<locale>.md`，中文可缺 |
| `content/software/*.md` | 软件条目 |
| `scripts/sync_publications.py` | BibTeX → JSON 数据管道 |
| `src/content.config.ts` | Astro Content Layer 集合定义与 zod schema |
| `src/lib/types.ts` | 共享类型定义 |
| `src/lib/i18n.ts` | 语言回退 `pick()` 与 locale 工具 |
| `src/lib/data-source.ts` | 适配层，导出五个数据函数（展示层唯一入口） |
| `src/lib/data-select.ts` | 纯函数筛选/排序逻辑（不依赖 astro:content，便于单测） |
| `src/styles/tokens.css` `global.css` | 设计令牌与全局基础样式 |
| `src/layouts/BaseLayout.astro` | HTML 骨架、meta、导航、页脚 |
| `src/components/*.astro` | 导航、语言切换、页脚、论文条目、软件卡片等 |
| `src/pages/**` | 路由页面（含 `/zh/` 镜像） |
| `public/fonts/` `public/cv/` | 自托管字体、CV PDF（PDF 由用户提供） |
| `tests/` | vitest 单元测试 |

---

## Task 1: 脚手架与构建基线

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.editorconfig`
- Create: `src/pages/index.astro`

**Interfaces:**
- Consumes: 无（首个任务）
- Produces: 可运行的 `pnpm dev` / `pnpm build` / `pnpm test`；`dist/index.html` 构建产物

- [ ] **Step 1: 写 `package.json`**

```json
{
  "name": "my-academic-web",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "^5.14.1",
    "yaml": "^2.8.1"
  },
  "devDependencies": {
    "typescript": "^5.9.2",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: 安装依赖**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm install`

Expected: 生成 `pnpm-lock.yaml` 与 `node_modules/`，无报错。

> 装依赖会写入大量小文件，而本项目位于坚果云同步盘内——执行本步前先提醒用户暂停坚果云同步。

- [ ] **Step 3: 写 `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  // TODO: 域名确定后替换（spec 第 12 节待定项）
  site: 'https://example.invalid',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 4: 写 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: 写 `.editorconfig`**

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 6: 写最小首页 `src/pages/index.astro`（仅验证构建链路，Task 6 会替换它）**

```astro
---
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Scaffold</title>
  </head>
  <body>
    <p>Scaffold OK</p>
  </body>
</html>
```

- [ ] **Step 7: 构建验证**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功，输出 `dist/index.html`。

Run: `test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/index.html" && echo BUILD_OK`

Expected: 打印 `BUILD_OK`。

- [ ] **Step 8: 确认 `.gitignore` 覆盖新产物**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && git status --short`

Expected: **不出现** `node_modules/`、`dist/`、`.astro/`。

- [ ] **Step 9: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add .editorconfig astro.config.mjs package.json pnpm-lock.yaml src/pages/index.astro tsconfig.json
git commit -m "chore(scaffold): 初始化 Astro 静态站与构建基线"
```

---

## Task 2: 内容模型与 schema 校验

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/content.config.ts`
- Create: `content/site.yaml`
- Create: `content/cv.yaml`
- Create: `content/research/effector-genomics.md`
- Create: `content/software/biortools.md`
- Create: `tests/content-schema.test.ts`

**Interfaces:**
- Consumes: Task 1 的 Astro 工程
- Produces: Astro 集合 `research`、`software`、`publicationsGenerated`；类型 `Localized`、`Publication`、`ResearchItem`、`SoftwareItem`、`SiteProfile`、`CvEntry`、`CvData`、`Locale`（Task 4 的 `data-source.ts` 直接依赖这些名字，不得改名）

- [ ] **Step 1: 写 `src/lib/types.ts`**

```ts
/** 双语字段：中文缺失时由 pick() 回退英文 */
export interface Localized {
  en: string;
  zh?: string;
}

export type Locale = 'en' | 'zh';

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  type: 'journal' | 'preprint' | 'conference';
  doi: string | null;
  url: string | null;
  code: string | null;
  pdf: string | null;
  keywords: string[];
  featured: boolean;
  authorRole: 'first' | 'co-first' | 'corresponding' | 'co-author';
}

export interface ResearchItem {
  slug: string;
  title: Localized;
  summary: Localized;
  order: number;
  keywords: string[];
}

export interface SoftwareItem {
  slug: string;
  name: string;
  tagline: Localized;
  repo: string;
  language: string;
  install?: string;
  docs?: string;
  order: number;
}

export interface SiteLink {
  label: string;
  url: string;
  icon: string;
}

export interface FeaturedPost {
  title: string;
  url: string;
  date: string;
}

export interface SiteProfile {
  name: Localized;
  title: Localized;
  affiliation: Localized;
  location: string;
  email: string;
  links: SiteLink[];
  blog: { label: Localized; url: string };
  featuredPosts: FeaturedPost[];
}

export interface CvEntry {
  start: string;
  end: string;
  title: Localized;
  org: Localized;
  note?: Localized;
}

export interface CvData {
  education: CvEntry[];
  positions: CvEntry[];
  awards: CvEntry[];
  talks: CvEntry[];
}
```

- [ ] **Step 2: 写 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

const localized = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

// 一个研究方向一个文件：content/research/<slug>.md。
// title / summary 都带 { en, zh }，中英只写一份，不会两处漂移。
const research = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/research' }),
  schema: z.object({
    title: localized,
    summary: localized,
    order: z.number().int(),
    keywords: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/software' }),
  schema: z.object({
    name: z.string(),
    tagline: localized,
    repo: z.string().url(),
    language: z.string(),
    install: z.string().optional(),
    docs: z.string().url().optional(),
    order: z.number().int().default(999),
  }),
});

const publicationItem = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().int(),
  venue: z.string(),
  type: z.enum(['journal', 'preprint', 'conference']),
  doi: z.string().nullable(),
  url: z.string().nullable(),
  code: z.string().nullable(),
  pdf: z.string().nullable(),
  keywords: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  authorRole: z.enum(['first', 'co-first', 'corresponding', 'co-author']),
});

const publicationsGenerated = defineCollection({
  loader: file('./content/publications.json', {
    parser: (text: string) => JSON.parse(text).items,
  }),
  schema: publicationItem,
});

// site.yaml / cv.yaml 是单对象文件，不是数组；用 parser 包成 Astro 要求的
// 「带 id 的条目数组」，id 固定为文件名，便于 data-source.ts 用 getEntry 取回。
const siteProfileSchema = z.object({
  name: localized,
  title: localized,
  affiliation: localized,
  location: z.string(),
  email: z.string(),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
      icon: z.string(),
    })
  ),
  blog: z.object({ label: localized, url: z.string().url() }),
  featuredPosts: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      date: z.string(),
    })
  ),
});

const cvEntrySchema = z.object({
  start: z.string(),
  end: z.string(),
  title: localized,
  org: localized,
  note: localized.optional(),
});

const cvSchema = z.object({
  education: z.array(cvEntrySchema),
  positions: z.array(cvEntrySchema),
  awards: z.array(cvEntrySchema),
  talks: z.array(cvEntrySchema),
});

const site = defineCollection({
  loader: file('./content/site.yaml', {
    parser: (text: string) => [{ id: 'site', ...parseYaml(text) }],
  }),
  schema: siteProfileSchema,
});

const cv = defineCollection({
  loader: file('./content/cv.yaml', {
    parser: (text: string) => [{ id: 'cv', ...parseYaml(text) }],
  }),
  schema: cvSchema,
});

export const collections = {
  research,
  software,
  publicationsGenerated,
  site,
  cv,
};
```

> 注意：`site` 与 `cv` 集合的条目 id 固定为 `site` 与 `cv`，Task 4 的 `getSiteProfile()` / `getCV()` 靠这两个 id 取值。

- [ ] **Step 3: 写 `content/site.yaml`**

真实值待用户提供，这里按要求使用占位串，构建必须仍能通过：

```yaml
name:
  en: "TODO: 待用户提供"
  zh: "TODO: 待用户提供"
title:
  en: "TODO: 待用户提供"
  zh: "TODO: 待用户提供"
affiliation:
  en: "TODO: 待用户提供"
  zh: "TODO: 待用户提供"
location: "TODO: 待用户提供"
email: "TODO: 待用户提供"
links: []
blog:
  label:
    en: "Blog"
    zh: "博客"
  url: "https://lixiang117423.github.io"
featuredPosts: []
```

- [ ] **Step 4: 写 `content/cv.yaml`**

```yaml
education: []
positions: []
awards: []
talks: []
```

- [ ] **Step 5: 写研究方向文件**

`content/research/effector-genomics.md`：

```markdown
---
title:
  en: "Effector genomics in oomycete pathogens"
  zh: "卵菌效应子的基因组学解析"
summary:
  en: "Comparative and population genomics of effector repertoires in Phytophthora sojae."
  zh: "大豆疫霉菌效应子组的比较基因组学与群体基因组学解析。"
order: 1
keywords: ["effector", "Phytophthora sojae"]
---

Content pending.
```

> 元数据（含中英两语）只写在这一份文件里，正文不单独维护；中文缺失时经 `pick()` 回退英文。
>
> 物种学名在 frontmatter 这类纯文本字段里保持正体；在页面上引用时按全局规则改用斜体 `*Phytophthora sojae*`。

- [ ] **Step 6: 写 `content/software/biortools.md`**

```markdown
---
name: "bioRtools"
tagline:
  en: "An R toolkit for routine bioinformatics and plotting."
  zh: "面向常规生信分析与绘图的 R 工具包。"
repo: "https://github.com/lixiang117423/bioRtools"
language: "R"
install: "remotes::install_github(\"lixiang117423/bioRtools\")"
order: 1
---
```

- [ ] **Step 7: 写 schema 测试 `tests/content-schema.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = '/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web';

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

describe('content files', () => {
  it('site.yaml 含全部必需顶层键', () => {
    const text = read('content/site.yaml');
    const keys = [
      'name:', 'title:', 'affiliation:', 'location:',
      'email:', 'links:', 'blog:', 'featuredPosts:',
    ];
    for (const key of keys) {
      expect(text).toContain(key);
    }
  });

  it('research 条目含双语 title、summary 与 order', () => {
    const text = read('content/research/effector-genomics.md');
    expect(text).toContain('title:');
    expect(text).toContain('summary:');
    expect(text).toContain('order:');
  });

  it('software 条目含 repo 与 language', () => {
    const text = read('content/software/biortools.md');
    expect(text).toContain('repo:');
    expect(text).toContain('language:');
  });
});
```

- [ ] **Step 8: 运行测试与构建**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm test`

Expected: 3 个测试 PASS。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。若 `content/publications.json` 还不存在（Task 3 的产物），先执行 Task 3；或临时写入 `{"generated_at":"","source":"","count":0,"items":[]}` 打通构建。

- [ ] **Step 9: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add content src/content.config.ts src/lib/types.ts tests/content-schema.test.ts
git commit -m "feat(content): 定义内容模型与 schema 校验"
```

---

## Task 3: 论文数据管道（BibTeX → JSON）

**Files:**
- Create: `scripts/sync_publications.py`
- Create: `tests/test_sync_publications.py`
- Create: `content/publications.bib`
- Create: `content/publications.json`（脚本产出，随仓库提交）

**Interfaces:**
- Consumes: 无
- Produces: `content/publications.json`，结构 `{ generated_at, source, count, items: Publication[] }`，字段与 Task 2 的 `publicationItem` zod schema **逐字段一致**

- [ ] **Step 1: 装 Python 依赖（须先取得用户同意）**

Run: `/Users/lixiang/miniforge3/envs/python/bin/python3 -m pip install bibtexparser pytest`

Expected: 安装成功。

> 本机核查（2026-10-15）：`bibtexparser` 与 `pytest` **均未安装**。按用户规则，装包须先经同意；未获同意前不得执行本步。替代方案是改用 Node 侧 BibTeX 解析器（可省掉 Python 依赖），但换方案须先与用户确认。

- [ ] **Step 2: 写失败测试 `tests/test_sync_publications.py`**

```python
from pathlib import Path

from scripts.sync_publications import convert

FIXTURE = """
@article{demo2026,
  title = {A demo paper},
  author = {Li, Xiang and Zhang, San},
  journal = {Journal of Demos},
  year = {2026},
  doi = {10.1000/demo.2026},
  keywords = {effector, genomics},
  annotation = {featured, first}
}
"""


def test_convert_maps_fields(tmp_path: Path) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(FIXTURE, encoding="utf-8")
    result = convert(bib)

    assert result["count"] == 1
    item = result["items"][0]
    assert item["id"] == "demo2026"
    assert item["title"] == "A demo paper"
    assert item["authors"] == ["Li, Xiang", "Zhang, San"]
    assert item["year"] == 2026
    assert item["venue"] == "Journal of Demos"
    assert item["type"] == "journal"
    assert item["doi"] == "10.1000/demo.2026"
    assert item["keywords"] == ["effector", "genomics"]
    assert item["featured"] is True
    assert item["authorRole"] == "first"


def test_convert_sorts_by_year_desc(tmp_path: Path) -> None:
    bib = tmp_path / "in.bib"
    bib.write_text(
        FIXTURE
        + """
@article{older2024,
  title = {An older paper},
  author = {Li, Xiang},
  journal = {Old Journal},
  year = {2024}
}
""",
        encoding="utf-8",
    )
    result = convert(bib)
    assert [item["id"] for item in result["items"]] == ["demo2026", "older2024"]
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && /Users/lixiang/miniforge3/envs/python/bin/python3 -m pytest tests/test_sync_publications.py -v`

Expected: FAIL，报 `ModuleNotFoundError: No module named 'scripts.sync_publications'`。

- [ ] **Step 4: 写 `pyproject.toml`（让 pytest 能把项目根加进 import 路径）**

```toml
[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
```

- [ ] **Step 5: 写 `scripts/sync_publications.py`**

```python
"""把 content/publications.bib 转换为 content/publications.json。

用法：
    /Users/lixiang/miniforge3/envs/python/bin/python3 \
        /Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/scripts/sync_publications.py

输出字段必须与 src/content.config.ts 的 publicationItem schema 逐字段一致；
新增字段时两处同时改，否则 Astro 构建会因 zod 校验失败而报错。
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bibtexparser

PROJECT_ROOT = Path("/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web")
BIB_PATH = PROJECT_ROOT / "content" / "publications.bib"
OUT_PATH = PROJECT_ROOT / "content" / "publications.json"

TYPE_BY_ENTRYTYPE = {
    "article": "journal",
    "inproceedings": "conference",
    "conference": "conference",
    "misc": "preprint",
    "unpublished": "preprint",
}

REQUIRED_FIELDS = {
    "id", "title", "authors", "year", "venue", "type", "doi",
    "url", "code", "pdf", "keywords", "featured", "authorRole",
}


def _split(value: str | None, sep: str) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(sep) if part.strip()]


def _flags(annotation: str | None) -> set[str]:
    return {flag.strip().lower() for flag in _split(annotation, ",")}


def _author_role(annotation: str | None) -> str:
    flags = _flags(annotation)
    if "co-first" in flags:
        return "co-first"
    if "first" in flags:
        return "first"
    if "corresponding" in flags:
        return "corresponding"
    return "co-author"


def _entry_to_item(entry: dict[str, str]) -> dict[str, object]:
    return {
        "id": entry["ID"],
        "title": " ".join(entry.get("title", "").split()),
        "authors": _split(entry.get("author"), " and "),
        "year": int(entry.get("year", "0") or 0),
        "venue": entry.get("journal") or entry.get("booktitle") or "",
        "type": TYPE_BY_ENTRYTYPE.get(
            entry.get("ENTRYTYPE", "article").lower(), "journal"
        ),
        "doi": entry.get("doi") or None,
        "url": entry.get("url") or None,
        "code": entry.get("code") or None,
        "pdf": entry.get("pdf") or None,
        "keywords": _split(entry.get("keywords"), ","),
        "featured": "featured" in _flags(entry.get("annotation")),
        "authorRole": _author_role(entry.get("annotation")),
    }


def convert(bib_path: Path) -> dict[str, object]:
    """读取 BibTeX 文件，返回与 zod schema 对齐的字典。"""
    with bib_path.open(encoding="utf-8") as handle:
        database = bibtexparser.load(handle)

    items = [_entry_to_item(entry) for entry in database.entries]
    items.sort(key=lambda item: (-int(item["year"]), str(item["id"])))

    tz = timezone(timedelta(hours=8))
    return {
        "generated_at": datetime.now(tz).isoformat(timespec="seconds"),
        "source": "content/publications.bib",
        "count": len(items),
        "items": items,
    }


def main() -> None:
    if not BIB_PATH.exists():
        raise SystemExit(f"[FATAL] 找不到 {BIB_PATH}")

    payload = convert(BIB_PATH)
    OUT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # 回读自检：产物写完必须回读核对结构
    reloaded = json.loads(OUT_PATH.read_text(encoding="utf-8"))
    assert reloaded["count"] == len(reloaded["items"]), "count 与 items 长度不一致"
    assert reloaded["count"] == payload["count"], "落盘条数与生成条数不一致"
    for item in reloaded["items"]:
        missing = REQUIRED_FIELDS - set(item)
        if missing:
            raise SystemExit(
                f"[FATAL] 条目 {item.get('id')} 缺字段：{sorted(missing)}"
            )

    print(f"[INFO] 写入 {OUT_PATH}（{reloaded['count']} 条）")
    print(f"[INFO] 回读自检通过：字段齐全、count 一致（{reloaded['count']}）")


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: 运行测试确认通过**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && /Users/lixiang/miniforge3/envs/python/bin/python3 -m pytest tests/test_sync_publications.py -v`

Expected: PASS（2 passed）。

- [ ] **Step 7: 写 `content/publications.bib`**

真实论文列表**需用户提供**（从 Zotero 导出 BibTeX）。在拿到之前，先写入仅含注释的空文件把管道打通：

```bibtex
% 论文唯一权威源。从 Zotero 导出 BibTeX 后覆盖本文件内容（保留本注释行）。
% annotation 字段用于标记 featured / first / co-first / corresponding。
```

- [ ] **Step 8: 生成 JSON 并核验回读自检**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && /Users/lixiang/miniforge3/envs/python/bin/python3 scripts/sync_publications.py`

Expected: 打印 `[INFO] ... （0 条）` 与 `[INFO] 回读自检通过 ...`。

- [ ] **Step 9: 确认构建通过**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功，zod 校验通过。

- [ ] **Step 10: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add pyproject.toml scripts/sync_publications.py tests/test_sync_publications.py content/publications.bib content/publications.json
git commit -m "feat(scripts): BibTeX 转 publications.json 数据管道"
```

---

## Task 4: 适配层与语言回退

**Files:**
- Create: `src/lib/i18n.ts`
- Create: `src/lib/data-source.ts`
- Create: `tests/i18n.test.ts`
- Create: `tests/data-source.test.ts`

**Interfaces:**
- Consumes: Task 2 的 `src/lib/types.ts` 与 Astro 集合；Task 3 的 `content/publications.json`
- Produces: `pick(locale, value)`、`getSiteProfile()`、`listPublications(options?)`、`listResearch()`、`listSoftware()`、`getCV()`——**函数名与签名冻结**，Task 6–10 的页面只允许调用这些

- [ ] **Step 1: 写失败测试 `tests/i18n.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { pick } from '../src/lib/i18n';

describe('pick', () => {
  it('中文存在时返回中文', () => {
    expect(pick('zh', { en: 'Hello', zh: '你好' })).toBe('你好');
  });

  it('中文缺失时回退英文', () => {
    expect(pick('zh', { en: 'Hello' })).toBe('Hello');
  });

  it('中文为空串时回退英文', () => {
    expect(pick('zh', { en: 'Hello', zh: '' })).toBe('Hello');
  });

  it('英文请求始终返回英文', () => {
    expect(pick('en', { en: 'Hello', zh: '你好' })).toBe('Hello');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm test`

Expected: FAIL，报找不到模块 `../src/lib/i18n`。

- [ ] **Step 3: 写 `src/lib/i18n.ts`**

```ts
import type { Locale, Localized } from './types';

export const LOCALES: Locale[] = ['en', 'zh'];
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * 双语字段取值的唯一入口。
 * 中文缺失或为空串时回退英文——禁止在组件里另写回退逻辑。
 */
export function pick(locale: Locale, value: Localized): string {
  if (locale === 'zh' && value.zh && value.zh.trim() !== '') {
    return value.zh;
  }
  return value.en;
}

/** 由 Astro 的当前路径推导语言。 */
export function localeFromPath(pathname: string): Locale {
  return pathname.startsWith('/zh') ? 'zh' : DEFAULT_LOCALE;
}

/** 同一页面在另一语言下的路径。 */
export function altPath(pathname: string): string {
  if (pathname.startsWith('/zh')) {
    const stripped = pathname.slice(3);
    return stripped === '' ? '/' : stripped;
  }
  return pathname === '/' ? '/zh/' : `/zh${pathname}`;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm test`

Expected: `tests/i18n.test.ts` 4 个用例 PASS。

- [ ] **Step 5: 写失败测试 `tests/data-select.test.ts`**

`data-source.ts` 直接 `import 'astro:content'`，在 vitest 里无法解析；因此把可测的筛选与合并逻辑拆到 `src/lib/data-select.ts` 这个**不依赖 Astro 的纯函数模块**，`data-source.ts` 只做取数 + 调用纯函数。

```ts
import { describe, expect, it } from 'vitest';
import { filterPublications, sortResearch, sortSoftware } from '../src/lib/data-select';
import type { Publication } from '../src/lib/types';

const base: Publication = {
  id: 'a',
  title: 'A',
  authors: [],
  year: 2024,
  venue: 'V',
  type: 'journal',
  doi: null,
  url: null,
  code: null,
  pdf: null,
  keywords: [],
  featured: false,
  authorRole: 'co-author',
};

describe('filterPublications', () => {
  it('按年份倒序排序并支持 limit', () => {
    const items = [
      { ...base, id: 'old', year: 2020 },
      { ...base, id: 'new', year: 2025 },
    ];
    expect(filterPublications(items, { limit: 1 }).map((i) => i.id)).toEqual(['new']);
  });

  it('featured 筛选只留 featured 条目', () => {
    const items = [
      { ...base, id: 'x', featured: false },
      { ...base, id: 'y', featured: true },
    ];
    expect(filterPublications(items, { featured: true }).map((i) => i.id)).toEqual(['y']);
  });

  it('keyword 命中 keywords 数组', () => {
    const items = [
      { ...base, id: 'k', keywords: ['effector'] },
      { ...base, id: 'n', keywords: ['other'] },
    ];
    expect(filterPublications(items, { keyword: 'effector' }).map((i) => i.id)).toEqual(['k']);
  });
});

describe('sortResearch', () => {
  it('按 order 升序，order 相同再按 slug', () => {
    const items = [
      { slug: 'b', order: 2 },
      { slug: 'a', order: 1 },
      { slug: 'a2', order: 1 },
    ];
    expect(sortResearch(items as never).map((i) => i.slug)).toEqual(['a', 'a2', 'b']);
  });
});

describe('sortSoftware', () => {
  it('按 order 升序', () => {
    const items = [
      { slug: 'z', order: 9 },
      { slug: 'a', order: 1 },
    ];
    expect(sortSoftware(items as never).map((i) => i.slug)).toEqual(['a', 'z']);
  });
});
```

- [ ] **Step 6: 运行测试确认失败**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm test`

Expected: FAIL，报找不到模块 `../src/lib/data-select`。

- [ ] **Step 7: 写 `src/lib/data-select.ts`**

```ts
import type { Publication, ResearchItem, SoftwareItem } from './types';

export interface PublicationQuery {
  featured?: boolean;
  year?: number;
  keyword?: string;
  limit?: number;
}

export function filterPublications(
  items: Publication[],
  query: PublicationQuery = {}
): Publication[] {
  let result = [...items];

  if (query.featured !== undefined) {
    result = result.filter((item) => item.featured === query.featured);
  }
  if (query.year !== undefined) {
    result = result.filter((item) => item.year === query.year);
  }
  if (query.keyword !== undefined) {
    result = result.filter((item) => item.keywords.includes(query.keyword as string));
  }

  result.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
  return query.limit === undefined ? result : result.slice(0, query.limit);
}

export function sortResearch(items: ResearchItem[]): ResearchItem[] {
  return [...items].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function sortSoftware(items: SoftwareItem[]): SoftwareItem[] {
  return [...items].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}
```

- [ ] **Step 8: 运行测试确认通过**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm test`

Expected: i18n 4 个 + data-select 5 个用例全部 PASS。

- [ ] **Step 9: 写 `src/lib/data-source.ts`**

```ts
import { getCollection, getEntry } from 'astro:content';
import { filterPublications, sortResearch, sortSoftware } from './data-select';
import type { PublicationQuery } from './data-select';
import type {
  CvData,
  Publication,
  ResearchItem,
  SiteProfile,
  SoftwareItem,
} from './types';

export type { PublicationQuery };

export async function getSiteProfile(): Promise<SiteProfile> {
  const entry = await getEntry('site', 'site');
  if (!entry) {
    throw new Error("缺少 content/site.yaml（集合 site 的条目 id 必须是 'site'）");
  }
  return entry.data as SiteProfile;
}

export async function listPublications(
  query: PublicationQuery = {}
): Promise<Publication[]> {
  const entries = await getCollection('publicationsGenerated');
  return filterPublications(entries.map((entry) => entry.data as Publication), query);
}

export async function listResearch(): Promise<ResearchItem[]> {
  const entries = await getCollection('research');
  const items: ResearchItem[] = entries.map((entry) => ({
    slug: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    order: entry.data.order,
    keywords: entry.data.keywords,
  }));
  return sortResearch(items);
}

export async function listSoftware(): Promise<SoftwareItem[]> {
  const entries = await getCollection('software');
  const items: SoftwareItem[] = entries.map((entry) => ({
    slug: entry.id,
    name: entry.data.name,
    tagline: entry.data.tagline,
    repo: entry.data.repo,
    language: entry.data.language,
    install: entry.data.install,
    docs: entry.data.docs,
    order: entry.data.order,
  }));
  return sortSoftware(items);
}

export async function getCV(): Promise<CvData> {
  const entry = await getEntry('cv', 'cv');
  if (!entry) {
    throw new Error("缺少 content/cv.yaml（集合 cv 的条目 id 必须是 'cv'）");
  }
  return entry.data as CvData;
}
```

- [ ] **Step 10: 构建验证并确认取数入口唯一**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && grep -rn "content/" src/pages src/components 2>/dev/null || echo NO_DIRECT_ACCESS`

Expected: 打印 `NO_DIRECT_ACCESS`（此时页面尚未实现；Task 6 起每加一个页面都在本任务末尾重跑这条）。

- [ ] **Step 11: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/lib tests/i18n.test.ts tests/data-select.test.ts
git commit -m "feat(data): 适配层 data-source 与语言回退"
```

---

## Task 5: 设计令牌与基础布局

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteNav.astro`
- Create: `src/components/LangSwitch.astro`
- Create: `src/components/SiteFooter.astro`

**Interfaces:**
- Consumes: Task 4 的 `getSiteProfile()`、`pick()`、`altPath()`
- Produces: `<BaseLayout locale title description>` 布局组件；CSS 变量 `--bg / --surface / --text / --text-muted / --accent / --border / --font-serif / --font-sans / --measure`

- [ ] **Step 1: 写 `src/styles/tokens.css`**

```css
:root {
  --bg: #fdfdfc;
  --surface: #f6f6f4;
  --text: #24292f;
  --text-muted: #6b7280;
  --accent: #1e4e8c;
  --border: #e3e3e0;

  --font-serif: "Source Serif 4", "Songti SC", Georgia, serif;
  --font-sans: -apple-system, "PingFang SC", "Noto Sans SC", sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", ui-monospace, monospace;

  --measure: 72ch;
  --step-1: 0.875rem;
  --step0: 1rem;
  --step1: 1.25rem;
  --step2: 1.5rem;
  --step3: 2rem;
  --gap: 1.5rem;
  --gap-lg: 3rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16181d;
    --surface: #1e2027;
    --text: #e6e6e4;
    --text-muted: #9aa0a6;
    --accent: #8ab4f8;
    --border: #2c2f36;
  }
}
```

- [ ] **Step 2: 写 `src/styles/global.css`**

```css
@import "./tokens.css";

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  color-scheme: light dark;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-serif);
  font-size: var(--step0);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--accent);
  text-underline-offset: 0.2em;
}

a:focus-visible,
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.wrap {
  max-width: var(--measure);
  margin-inline: auto;
  padding-inline: 1.25rem;
}

.meta {
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: var(--step-1);
}

code,
pre {
  font-family: var(--font-mono);
  font-size: var(--step-1);
}

pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.75rem 1rem;
  overflow-x: auto;
}

hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: var(--gap-lg) 0;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 3: 写 `src/components/SiteNav.astro`**

```astro
---
import { getSiteProfile, type PublicationQuery } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';
import LangSwitch from './LangSwitch.astro';

interface Props {
  locale: Locale;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;
const site = await getSiteProfile();

const prefix = locale === 'zh' ? '/zh' : '';
const items = [
  { href: `${prefix}/about`, label: { en: 'About', zh: '关于' } },
  { href: `${prefix}/research`, label: { en: 'Research', zh: '研究方向' } },
  { href: '/publications', label: { en: 'Publications', zh: 'Publications' } },
  { href: `${prefix}/software`, label: { en: 'Software', zh: '软件' } },
  { href: `${prefix}/cv`, label: { en: 'CV', zh: '简历' } },
];
---

<nav class="site-nav wrap" aria-label="Primary">
  <ul>
    {items.map((item) => (
      <li>
        <a
          href={item.href}
          aria-current={currentPath.startsWith(item.href) ? 'page' : undefined}
        >{pick(locale, item.label)}</a>
      </li>
    ))}
    <li>
      <a href={site.blog.url} rel="me noopener">{pick(locale, site.blog.label)}</a>
    </li>
  </ul>
  <LangSwitch locale={locale} currentPath={currentPath} />
</nav>

<style>
  .site-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--gap);
    padding-block: 1.25rem;
    border-bottom: 1px solid var(--border);
    font-family: var(--font-sans);
    font-size: var(--step-1);
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  a {
    color: var(--text);
    text-decoration: none;
  }

  a:hover {
    color: var(--accent);
    text-decoration: underline;
  }

  a[aria-current='page'] {
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
  }
</style>
```

- [ ] **Step 4: 写 `src/components/LangSwitch.astro`**

```astro
---
import { altPath } from '../lib/i18n';
import type { Locale } from '../lib/types';

interface Props {
  locale: Locale;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;
const target = altPath(currentPath);
---

<a class="lang-switch" href={target} hreflang={locale === 'zh' ? 'en' : 'zh'}>
  {locale === 'zh' ? 'EN' : '中文'}
</a>

<style>
  .lang-switch {
    font-family: var(--font-sans);
    font-size: var(--step-1);
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 5: 写 `src/components/SiteFooter.astro`**

```astro
---
import { getSiteProfile } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const site = await getSiteProfile();
const year = new Date().getFullYear();
---

<footer class="wrap">
  <hr />
  <p class="meta">
    <a href={`mailto:${site.email}`}>{site.email}</a>
    {site.links.map((link) => (
      <>
        {' · '}
        <a href={link.url} rel="me noopener">{link.label}</a>
      </>
    ))}
  </p>
  <p class="meta">© {year} {pick(locale, site.name)}</p>
</footer>

<style>
  footer {
    padding-block: var(--gap-lg);
    font-family: var(--font-sans);
  }

  footer a {
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 6: 写 `src/layouts/BaseLayout.astro`**

```astro
---
import SiteNav from '../components/SiteNav.astro';
import SiteFooter from '../components/SiteFooter.astro';
import { getSiteProfile } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';
import '../styles/global.css';

interface Props {
  locale: Locale;
  title: string;
  description?: string;
}

const { locale, title, description } = Astro.props;
const site = await getSiteProfile();
const currentPath = Astro.url.pathname;
---

<!doctype html>
<html lang={locale === 'zh' ? 'zh-CN' : 'en'}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} · {pick(locale, site.name)}</title>
    {description && <meta name="description" content={description} />}
    <link rel="canonical" href={new URL(currentPath, Astro.site ?? 'https://example.invalid').href} />
  </head>
  <body>
    <SiteNav locale={locale} currentPath={currentPath} />
    <main class="wrap">
      <slot />
    </main>
    <SiteFooter locale={locale} />
  </body>
</html>
```

- [ ] **Step 7: 用首页验证布局可用**

临时把 `src/pages/index.astro` 换成使用 BaseLayout 的最小页面（Task 6 会写正式内容）：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout locale="en" title="Home">
  <h1>Home</h1>
</BaseLayout>
```

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

- [ ] **Step 8: 核验无外域资源引用**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && grep -rn "fonts.googleapis\|cdn.jsdelivr\|cdnjs\|unpkg" src/ public/ 2>/dev/null || echo NO_CDN`

Expected: 打印 `NO_CDN`。

- [ ] **Step 9: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/styles src/layouts src/components src/pages/index.astro
git commit -m "feat(ui): 设计令牌与基础布局"
```

---

## Task 6: Home 页

**Files:**
- Create: `src/components/PublicationList.astro`
- Create: `src/components/HomeContent.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/zh/index.astro`

**Interfaces:**
- Consumes: `getSiteProfile()`、`listPublications({ featured: true, limit: 5 })`、`pick()`、`<BaseLayout>`
- Produces: `<PublicationList items compact?>` 组件（Task 7 复用）、`<HomeContent locale>` 组件

- [ ] **Step 1: 写 `src/components/PublicationList.astro`**

```astro
---
import { pick } from '../lib/i18n';
import type { Locale, Publication } from '../lib/types';

interface Props {
  items: Publication[];
  locale: Locale;
  compact?: boolean;
}

const { items, locale, compact = false } = Astro.props;

const roleLabel: Record<Publication['authorRole'], string> = {
  first: 'first author',
  'co-first': 'co-first author',
  corresponding: 'corresponding author',
  'co-author': '',
};
---

{items.length === 0 && <p class="meta">No publications yet.</p>}

<ul class="pub-list" class:list={[{ compact }]}>
  {items.map((item) => (
    <li>
      <p class="pub-title">{item.title}</p>
      <p class="meta">
        {item.authors.join(', ')}
        {roleLabel[item.authorRole] && <> · {roleLabel[item.authorRole]}</>}
      </p>
      <p class="meta">
        <em>{item.venue}</em>, {item.year}
        {item.doi && <> · <a href={`https://doi.org/${item.doi}`}>DOI</a></>}
        {item.pdf && <> · <a href={item.pdf}>PDF</a></>}
        {item.code && <> · <a href={item.code}>Code</a></>}
      </p>
    </li>
  ))}
</ul>

<style>
  .pub-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    padding-block: 0.85rem;
    border-bottom: 1px solid var(--border);
  }

  li:last-child {
    border-bottom: 0;
  }

  .pub-title {
    margin: 0 0 0.15rem;
    font-weight: 600;
    line-height: 1.45;
  }

  .pub-list .meta {
    margin: 0;
  }

  .compact li {
    padding-block: 0.6rem;
  }
</style>
```

- [ ] **Step 2: 写 `src/components/HomeContent.astro`**

```astro
---
import { getSiteProfile, listPublications } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';
import PublicationList from './PublicationList.astro';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const site = await getSiteProfile();
const featured = await listPublications({ featured: true, limit: 5 });
---

<h1>{pick(locale, site.name)}</h1>
<p class="lead">
  {pick(locale, site.title)} · {pick(locale, site.affiliation)} · {site.location}
</p>

<p>
  <a href={`mailto:${site.email}`}>{site.email}</a>
  {site.links.map((link) => (
    <>
      {' · '}
      <a href={link.url} rel="me noopener">{link.label}</a>
    </>
  ))}
</p>

<hr />

<h2>Selected publications</h2>
<PublicationList items={featured} locale={locale} compact />

{site.featuredPosts.length > 0 && (
  <>
    <h2>Recent notes</h2>
    <ul>
      {site.featuredPosts.map((post) => (
        <li>
          <a href={post.url}>{post.title}</a>
          <span class="meta"> · {post.date}</span>
        </li>
      ))}
    </ul>
  </>
)}

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 0.5rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }

  .lead {
    font-family: var(--font-sans);
    color: var(--text-muted);
    margin-top: 0;
  }
</style>
```

- [ ] **Step 3: 写 `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HomeContent from '../components/HomeContent.astro';
---

<BaseLayout locale="en" title="Home">
  <HomeContent locale="en" />
</BaseLayout>
```

- [ ] **Step 4: 写 `src/pages/zh/index.astro`**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import HomeContent from '../../components/HomeContent.astro';
---

<BaseLayout locale="zh" title="首页">
  <HomeContent locale="zh" />
</BaseLayout>
```

- [ ] **Step 5: 构建并核对两种语言的产物**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/index.html" && test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/zh/index.html" && echo PAGES_OK`

Expected: 打印 `PAGES_OK`。

- [ ] **Step 6: 核验中文回退（当前 site.yaml 中文值为占位串，两者都应正常渲染）**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && grep -c "TODO" dist/zh/index.html`

Expected: 大于 0（占位串按原样渲染，说明中文分支生效且构建未报错）。

- [ ] **Step 7: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/components/PublicationList.astro src/components/HomeContent.astro src/pages/index.astro src/pages/zh/index.astro
git commit -m "feat(home): 首页与精选论文列表"
```

---

## Task 7: Publications 页

**Files:**
- Create: `src/pages/publications.astro`

**Interfaces:**
- Consumes: `listPublications()`、`<PublicationList>`
- Produces: `/publications`（仅英文，无 `/zh/` 版本，符合 spec 第 4.1 节）

- [ ] **Step 1: 写 `src/pages/publications.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import PublicationList from '../components/PublicationList.astro';
import { listPublications } from '../lib/data-source';
import type { Publication } from '../lib/types';

const all = await listPublications();

const sections: { key: Publication['type']; heading: string }[] = [
  { key: 'journal', heading: 'Journal articles' },
  { key: 'conference', heading: 'Conference papers' },
  { key: 'preprint', heading: 'Preprints' },
];

const grouped = sections
  .map((section) => ({
    ...section,
    items: all.filter((item) => item.type === section.key),
  }))
  .filter((section) => section.items.length > 0);
---

<BaseLayout locale="en" title="Publications">
  <h1>Publications</h1>

  {grouped.length === 0 && (
    <p class="meta">No publications yet. Add entries to content/publications.bib and run scripts/sync_publications.py.</p>
  )}

  {grouped.map((section) => (
    <>
      <h2>{section.heading}</h2>
      <PublicationList items={section.items} locale="en" />
    </>
  ))}
</BaseLayout>

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 1rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }
</style>
```

- [ ] **Step 2: 构建并确认页面产出**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build && test -f dist/publications/index.html && echo PUB_OK`

Expected: 打印 `PUB_OK`。

- [ ] **Step 3: 核验没有生成中文版 Publications 页**

Run: `test -d "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/zh/publications" && echo UNEXPECTED || echo NO_ZH_PUBLICATIONS`

Expected: 打印 `NO_ZH_PUBLICATIONS`。

- [ ] **Step 4: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/pages/publications.astro
git commit -m "feat(publications): 论文题录页"
```

---

## Task 8: Research 页

**Files:**
- Create: `src/components/ResearchContent.astro`
- Create: `src/pages/research.astro`
- Create: `src/pages/zh/research.astro`

**Interfaces:**
- Consumes: `listResearch()`、`pick()`、`<BaseLayout>`
- Produces: `/research` 与 `/zh/research`

- [ ] **Step 1: 写 `src/components/ResearchContent.astro`**

```astro
---
import { listResearch } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const items = await listResearch();
---

<h1>{locale === 'zh' ? '研究方向' : 'Research'}</h1>

{items.length === 0 && <p class="meta">No research directions yet.</p>}

{items.map((item) => (
  <section>
    <h2>{pick(locale, item.title)}</h2>
    <p>{pick(locale, item.summary)}</p>
    {item.keywords.length > 0 && (
      <p class="meta">{item.keywords.join(' · ')}</p>
    )}
  </section>
))}

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 1rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }

  section p {
    margin-block: 0 0.5rem;
  }
</style>
```

- [ ] **Step 2: 写两个语言路由**

`src/pages/research.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ResearchContent from '../components/ResearchContent.astro';
---

<BaseLayout locale="en" title="Research">
  <ResearchContent locale="en" />
</BaseLayout>
```

`src/pages/zh/research.astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ResearchContent from '../../components/ResearchContent.astro';
---

<BaseLayout locale="zh" title="研究方向">
  <ResearchContent locale="zh" />
</BaseLayout>
```

- [ ] **Step 3: 构建并核对产物**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/research/index.html" && test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/zh/research/index.html" && echo RESEARCH_OK`

Expected: 打印 `RESEARCH_OK`。

- [ ] **Step 4: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/components/ResearchContent.astro src/pages/research.astro src/pages/zh/research.astro
git commit -m "feat(research): 研究方向页"
```

---

## Task 9: Software 页

**Files:**
- Create: `src/components/SoftwareContent.astro`
- Create: `src/pages/software.astro`
- Create: `src/pages/zh/software.astro`

**Interfaces:**
- Consumes: `listSoftware()`、`pick()`、`<BaseLayout>`
- Produces: `/software` 与 `/zh/software`

- [ ] **Step 1: 写 `src/components/SoftwareContent.astro`**

```astro
---
import { listSoftware } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const items = await listSoftware();
---

<h1>{locale === 'zh' ? '软件' : 'Software'}</h1>

{items.length === 0 && <p class="meta">No software entries yet.</p>}

{items.map((item) => (
  <article>
    <h2>
      {item.name}
      <span class="meta"> · {item.language}</span>
    </h2>
    <p>{pick(locale, item.tagline)}</p>
    {item.install && <pre><code>{item.install}</code></pre>}
    <p class="meta">
      <a href={item.repo} rel="noopener">Repository</a>
      {item.docs && <> · <a href={item.docs} rel="noopener">Docs</a></>}
    </p>
  </article>
))}

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 1rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }

  article {
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  article:last-of-type {
    border-bottom: 0;
  }

  article p {
    margin-block: 0 0.5rem;
  }
</style>
```

- [ ] **Step 2: 写两个语言路由**

`src/pages/software.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SoftwareContent from '../components/SoftwareContent.astro';
---

<BaseLayout locale="en" title="Software">
  <SoftwareContent locale="en" />
</BaseLayout>
```

`src/pages/zh/software.astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import SoftwareContent from '../../components/SoftwareContent.astro';
---

<BaseLayout locale="zh" title="软件">
  <SoftwareContent locale="zh" />
</BaseLayout>
```

- [ ] **Step 3: 构建并核对产物**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/software/index.html" && test -f "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/zh/software/index.html" && echo SOFTWARE_OK`

Expected: 打印 `SOFTWARE_OK`。

- [ ] **Step 4: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/components/SoftwareContent.astro src/pages/software.astro src/pages/zh/software.astro
git commit -m "feat(software): 软件与工具页"
```

---

## Task 10: CV 页与 About 页

**Files:**
- Create: `src/components/CvContent.astro`
- Create: `src/components/AboutContent.astro`
- Create: `src/pages/cv.astro`
- Create: `src/pages/zh/cv.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/zh/about.astro`

**Interfaces:**
- Consumes: `getCV()`、`getSiteProfile()`、`pick()`、`<BaseLayout>`
- Produces: `/cv`、`/zh/cv`、`/about`、`/zh/about`

- [ ] **Step 1: 写 `src/components/CvContent.astro`**

```astro
---
import { getCV } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { CvEntry, Locale } from '../lib/types';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const cv = await getCV();

const sections: { key: keyof typeof cv; en: string; zh: string }[] = [
  { key: 'positions', en: 'Positions', zh: '工作经历' },
  { key: 'education', en: 'Education', zh: '教育经历' },
  { key: 'awards', en: 'Awards', zh: '获奖' },
  { key: 'talks', en: 'Talks', zh: '报告' },
];

const renderPeriod = (entry: CvEntry) => `${entry.start}–${entry.end}`;
---

<h1>{locale === 'zh' ? '简历' : 'CV'}</h1>

<p class="meta">
  <a href="/cv/cv-en.pdf">Download CV (English, PDF)</a>
  {' · '}
  <a href="/cv/cv-zh.pdf">下载简历（中文，PDF）</a>
</p>

{sections.map((section) => {
  const entries = cv[section.key] as CvEntry[];
  return entries.length > 0 ? (
    <>
      <h2>{locale === 'zh' ? section.zh : section.en}</h2>
      <ul>
        {entries.map((entry) => (
          <li>
            <span class="meta">{renderPeriod(entry)}</span>{' '}
            <strong>{pick(locale, entry.title)}</strong>, {pick(locale, entry.org)}
            {entry.note && <span class="meta"> — {pick(locale, entry.note)}</span>}
          </li>
        ))}
      </ul>
    </>
  ) : null;
})}

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 0.5rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.4rem;
  }
</style>
```

- [ ] **Step 2: 写 `src/components/AboutContent.astro`**

```astro
---
import { getSiteProfile } from '../lib/data-source';
import { pick } from '../lib/i18n';
import type { Locale } from '../lib/types';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const site = await getSiteProfile();
---

<h1>{locale === 'zh' ? '关于' : 'About'}</h1>

<p>
  {pick(locale, site.name)} · {pick(locale, site.title)} · {pick(locale, site.affiliation)}
</p>

<p>Biography pending.</p>

<h2>Contact</h2>
<ul>
  <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
  {site.links.map((link) => (
    <li><a href={link.url} rel="me noopener">{link.label}</a></li>
  ))}
  <li><a href={site.blog.url} rel="me noopener">{pick(locale, site.blog.label)}</a></li>
</ul>

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 1rem;
  }

  h2 {
    font-size: var(--step2);
    margin-block: 2.5rem 0.5rem;
  }

  ul {
    margin: 0;
    padding-left: 1.25rem;
  }
</style>
```

- [ ] **Step 3: 写四个语言路由**

`src/pages/cv.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import CvContent from '../components/CvContent.astro';
---

<BaseLayout locale="en" title="CV">
  <CvContent locale="en" />
</BaseLayout>
```

`src/pages/zh/cv.astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import CvContent from '../../components/CvContent.astro';
---

<BaseLayout locale="zh" title="简历">
  <CvContent locale="zh" />
</BaseLayout>
```

`src/pages/about.astro`：

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AboutContent from '../components/AboutContent.astro';
---

<BaseLayout locale="en" title="About">
  <AboutContent locale="en" />
</BaseLayout>
```

`src/pages/zh/about.astro`：

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import AboutContent from '../../components/AboutContent.astro';
---

<BaseLayout locale="zh" title="关于">
  <AboutContent locale="zh" />
</BaseLayout>
```

- [ ] **Step 4: 构建并核对四个页面**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist" && for p in cv zh/cv about zh/about; do test -f "$p/index.html" && echo "OK $p" || echo "MISSING $p"; done`

Expected: 四行全为 `OK`。

- [ ] **Step 5: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/components/CvContent.astro src/components/AboutContent.astro src/pages/cv.astro src/pages/zh/cv.astro src/pages/about.astro src/pages/zh/about.astro
git commit -m "feat(pages): CV 页与 About 页"
```

---

## Task 11: 404、robots 与 sitemap

**Files:**
- Create: `src/pages/404.astro`
- Create: `public/robots.txt`
- Modify: `package.json`（加 `@astrojs/sitemap`）
- Modify: `astro.config.mjs`（注册 sitemap 集成）

**Interfaces:**
- Consumes: Task 5 的 `<BaseLayout>`
- Produces: `dist/404.html`、`dist/robots.txt`、`dist/sitemap-index.xml`

- [ ] **Step 1: 写 `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout locale="en" title="Not found">
  <h1>Page not found</h1>
  <p class="meta">The page you requested does not exist.</p>
  <p><a href="/">Back to home</a></p>
</BaseLayout>

<style>
  h1 {
    font-size: var(--step3);
    margin-block: 3rem 0.5rem;
  }
</style>
```

- [ ] **Step 2: 写 `public/robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://example.invalid/sitemap-index.xml
```

> `Sitemap` 一行里的域名是占位；域名确定后与 `astro.config.mjs` 的 `site` **同时**替换。

- [ ] **Step 3: 加 sitemap 依赖**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm add @astrojs/sitemap`

Expected: `package.json` 与 `pnpm-lock.yaml` 更新。

- [ ] **Step 4: 在 `astro.config.mjs` 注册集成**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  // TODO: 域名确定后替换（spec 第 12 节待定项）
  site: 'https://example.invalid',
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
```

- [ ] **Step 5: 构建并核对三个产物**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build`

Expected: 构建成功。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist" && ls 404.html robots.txt sitemap-index.xml`

Expected: 三个文件都存在。

- [ ] **Step 6: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add src/pages/404.astro public/robots.txt package.json pnpm-lock.yaml astro.config.mjs
git commit -m "feat(site): 404、robots 与 sitemap"
```

---

## Task 12: 验收核验与记录收尾

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `项目文件记录.md`
- Modify: `README.md`（把「当前状态」从设计阶段改为实现完成）

**Interfaces:**
- Consumes: Task 1–11 的全部产物
- Produces: 逐条核验记录；更新后的项目文档

- [ ] **Step 1: 逐条核验 spec 第 10 节的 10 项验收标准**

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && pnpm build && echo "1.BUILD_OK"`

Expected: `1.BUILD_OK`；`dist/` 内无 `*.mjs` 服务端产物（`ls dist` 只应见 html、css、js 静态资源与 xml/txt）。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && find dist -name '*.js' -exec wc -c {} + | sort -n | tail -5`

Expected: 最大的单文件 JS 明显小于 30 KB（Astro 默认零客户端 JS，此条通常为 0 个文件）。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && grep -rEn "https?://(fonts\.|cdn\.|unpkg|cdnjs|jsdelivr)" dist/ || echo "3.NO_CDN_OK"`

Expected: `3.NO_CDN_OK`。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && grep -rn "content/" src/pages src/components || echo "4.NO_DIRECT_DATA_OK"`

Expected: `4.NO_DIRECT_DATA_OK`。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web" && cp content/site.yaml /tmp/site.yaml.bak && sed -i '' 's/^  zh: .*/  zh: ""/' content/site.yaml && pnpm build && echo "5.FALLBACK_BUILD_OK" && cp /tmp/site.yaml.bak content/site.yaml`

Expected: 构建成功（说明中文缺失不会中断构建）。

> macOS 的 `sed -i` 必须带 `''` 参数（BSD sed）；这是本地命令，不涉及超算。

Run: 用浏览器分别以 375px 与 1280px 宽度打开 `/`、`/publications`、`/zh/`，确认无横向滚动条。

Expected: 无横向滚动。

Run: 按 spec 第 9.3 节的字体决策，对所选字体做字形覆盖自检后再导出，确认无方块字。

Expected: 页面中文正常显示。

Run: 键盘 Tab 依次走查 `/`、`/about`、`/publications`，确认焦点可见、顺序合理。

Expected: 焦点始终可见。

Run: 在系统设置中开启「减弱动态效果」后打开站点。

Expected: 无动画、无过渡。

Run: `cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist" && head -3 sitemap-index.xml robots.txt 404.html`

Expected: 三个文件内容正确。

- [ ] **Step 2: 记录时间（必须读真实时钟）**

Run: `date '+%Y-%m-%d %H:%M'`

Expected: 记下输出，用于下一步的 `CHANGELOG.md` 条目。

- [ ] **Step 3: 更新 `CHANGELOG.md`**

在文件**顶部**（首条记录之前）追加一条，格式与既有条目一致：

```markdown
## <上一步读到的真实时间> — 学术主页实现完成

- 按 `docs/superpowers/plans/2026-10-15-academic-site-implementation.md` 完成 Task 1–11。
- 产物：`/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web/dist/`（纯静态）。
- 验收：spec 第 10 节 10 条逐条核验结果记录于此条下方。
- 待用户提供：`content/site.yaml` 展示信息、`content/publications.bib` 论文列表、`public/cv/` 两份 PDF。
- 未改动既有站点：`hexo/` 与 `lixiang117423.github.io/` 均未修改。
```

- [ ] **Step 4: 更新 `项目文件记录.md`**

把「站点源码（规划中，尚未创建）」表改为实际状态，并补登新增文件：`src/lib/data-select.ts`、`src/content.config.ts`、`src/styles/*`、`src/layouts/*`、`src/components/*`、`src/pages/**`、`public/robots.txt`。未能确认用途的文件按实际写入，不臆造。

- [ ] **Step 5: 更新 `README.md` 的「当前状态」**

把「**设计阶段**」改为「实现完成，等待内容与域名」，并在命令区补上 `pnpm test`。

- [ ] **Step 6: 记录到 Obsidian（按全局记录规范）**

在 `/Users/lixiang/NutstoreFiles/98.软件数据/Obsidian/obsidian/分析记录/my_academic_web.md` **末尾追加**一个新的 `## YYYY-MM-DD HH:MM — <分析名>` 小节（时间同样先 `date` 读取），按①–⑦字段写清数据、方法·软件、做了什么、结果、结果文件、复现·日志、状态与时间，末尾保留 `→ 语雀模块页：—`。**不修改已有小节**。本项目按用户决定**不写语雀**。

- [ ] **Step 7: Commit**

```bash
cd "/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web"
git add CHANGELOG.md 项目文件记录.md README.md
git commit -m "docs: 实现完成记录与验收结果"
```

---

## 附录：Self-Review（写完计划后对照 spec 自查）

**1. Spec 覆盖**

| Spec 章节 | 对应任务 |
| --- | --- |
| §4.1 路由表 | Task 6（Home）、7（Publications）、8（Research）、9（Software）、10（CV、About）、11（404） |
| §4.2 导航与外链 Blog | Task 5 Step 3 |
| §5.1 site.yaml | Task 2 Step 3 |
| §5.2/5.3 论文来源与 JSON | Task 3 |
| §5.4 research | Task 2 Step 5、Task 8 |
| §5.5 software | Task 2 Step 6、Task 9 |
| §5.6 cv.yaml 与 PDF | Task 2 Step 4、Task 10 |
| §6.1 适配层五个函数 | Task 4 Step 9 |
| §6.2 语言回退 | Task 4 Step 3 |
| §7 目录结构 | Task 1–11 合计 |
| §8 技术选型（Astro/手写 CSS/自托管/无 CDN） | Task 1、5 |
| §9 视觉方向与令牌 | Task 5 Steps 1–2 |
| §9.3 字体字形自检 | Task 12 Step 1 |
| §10 验收标准 10 条 | Task 12 Step 1 |
| §11 风险（坚果云、DOI 核验、字体、域名、双语） | 坚果云见 Task 1 Step 2 提示；DOI 核验属内容填充阶段，见下方遗留；字体见 Task 12；域名见 §12 |
| §12 待定项 | 已作为占位串与 TODO 落在 Task 1 Step 3、Task 2 Step 3、Task 3 Step 7、Task 11 Step 2 |

**2. 占位符扫描**

计划内唯一保留的占位是 **用户待提供的内容值**（`TODO: 待用户提供`、空 `publications.bib`、`Biography pending.`、`Content pending.`）。这是 spec 第 5.1 节明确要求的「先占位、保证构建通过、不得臆造」，属**内容待填**而非计划缺口。除此之外无 `TBD` / `TODO` / 「稍后补充」式步骤。

**3. 类型与命名一致性**

- `Publication` 字段在 Task 3 的 Python 输出、Task 2 的 zod schema、Task 2 的 TypeScript 接口三处逐一对应（`id/title/authors/year/venue/type/doi/url/code/pdf/keywords/featured/authorRole`）。
- 适配层函数名 `getSiteProfile` / `listPublications` / `listResearch` / `listSoftware` / `getCV` 在 Task 4 定义，Task 5–10 调用，未出现第二种写法。
- 集合名 `research` / `software` / `publicationsGenerated` / `site` / `cv` 在 `content.config.ts` 与 `data-source.ts` 中一致；`site` 与 `cv` 的条目 id 固定为 `site` / `cv`。

**已知遗留（不属计划缺口，交用户决策）**

- `content/publications.bib` 真实内容与 `content/site.yaml` 展示信息需用户提供（spec §12）。
- DOI 需经 Crossref 核验后再写入题录（全局事实核验规范）；本计划只搭管道，不代填论文。
- 域名与托管平台未定，`astro.config.mjs` 的 `site` 与 `public/robots.txt` 的 Sitemap 行为占位，定域名后同时替换。
- `bibtexparser` / `pytest` 需用户同意后才安装（Task 3 Step 1）。

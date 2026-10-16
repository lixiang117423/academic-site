import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  cvSchema,
  publicationItem,
  researchSchema,
  siteProfileSchema,
  softwareSchema,
} from '../src/lib/schemas';

// 由本文件位置解析仓库根：本地与 GitHub Actions 上都能跑（不再钉死本机绝对路径）
const ROOT = fileURLToPath(new URL('..', import.meta.url));

function read(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

/** 取出 Markdown 文件顶部 `---` 之间的 frontmatter 并解析为对象 */
function frontmatter(rel: string): unknown {
  const text = read(rel);
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (match === null) {
    throw new Error(`no frontmatter block found in ${rel}`);
  }
  return parseYaml(match[1]);
}

const validPublication = {
  id: 'doi:10.1000/example',
  title: 'An example paper',
  authors: ['Li X'],
  year: 2026,
  venue: 'Example Journal',
  type: 'journal',
  doi: '10.1000/example',
  url: 'https://example.invalid/paper',
  code: null,
  pdf: null,
  keywords: [],
  featured: false,
  authorRole: 'first',
};

describe('content 文件通过 schema 校验', () => {
  it('site.yaml 通过 siteProfileSchema', () => {
    const parsed = siteProfileSchema.parse(parseYaml(read('content/site.yaml')));
    expect(parsed.blog.label).toEqual({ en: 'Blog', zh: '博客' });
    // 站点资料由用户维护：断言结构与「非空」，不锁定具体取值，
    // 否则每次改姓名 / 换邮箱 / 增删链接都要跟着改测试。
    expect(parsed.name.en.trim()).not.toBe('');
    expect(parsed.name.zh?.trim()).not.toBe('');
    expect(parsed.title.en.trim()).not.toBe('');
    expect(parsed.affiliation.en.trim()).not.toBe('');
    expect(parsed.intro.en.trim()).not.toBe('');
    expect(parsed.bio.en.trim()).not.toBe('');
    expect(parsed.bio.zh?.trim()).not.toBe('');
    expect(parsed.location.trim()).not.toBe('');
    expect(parsed.email.trim()).not.toBe('');
    expect(parsed.email).toContain('@');
  });

  it('site.yaml 的 links 与 featuredPosts 每项字段非空', () => {
    const parsed = siteProfileSchema.parse(parseYaml(read('content/site.yaml')));
    expect(parsed.links.length).toBeGreaterThan(0);
    for (const link of parsed.links) {
      expect(link.label.trim()).not.toBe('');
      expect(link.url).toMatch(/^https?:\/\//);
      expect(link.icon.trim()).not.toBe('');
    }
    expect(parsed.featuredPosts.length).toBeGreaterThan(0);
    for (const post of parsed.featuredPosts) {
      expect(post.title.trim()).not.toBe('');
      expect(post.url).toMatch(/^https?:\/\//);
      expect(post.date.trim()).not.toBe('');
    }
  });

  it('cv.yaml 通过 cvSchema，四个分组都存在', () => {
    const parsed = cvSchema.parse(parseYaml(read('content/cv.yaml')));
    expect(Object.keys(parsed).sort()).toEqual([
      'awards',
      'education',
      'positions',
      'talks',
    ]);
  });

  it('publications.json 的每个 item 通过 publicationItem', () => {
    const json = JSON.parse(read('content/publications.json')) as {
      count: number;
      items: unknown[];
    };
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.items).toHaveLength(json.count);
    for (const item of json.items) {
      expect(() => publicationItem.parse(item)).not.toThrow();
    }
  });

  it('research frontmatter 通过 researchSchema（含双语字段与 order）', () => {
    const parsed = researchSchema.parse(
      frontmatter('content/research/effector-genomics.md')
    );
    expect(parsed.title.en.trim()).not.toBe('');
    expect(parsed.title.zh?.trim()).not.toBe('');
    expect(parsed.summary.en.trim()).not.toBe('');
    expect(parsed.summary.zh?.trim()).not.toBe('');
    expect(parsed.order).toBeGreaterThan(0);
    for (const keyword of parsed.keywords) {
      expect(keyword.trim()).not.toBe('');
    }
  });

  it('content/research 下每个方向都通过 researchSchema 且 order 唯一', () => {
    const files = readdirSync(resolve(ROOT, 'content/research'))
      .filter((name) => name.endsWith('.md'))
      .sort();
    expect(files.length).toBeGreaterThan(0);
    const orders = files.map((name) => {
      const rel = `content/research/${name}`;
      const parsed = researchSchema.parse(frontmatter(rel));
      expect(parsed.title.en.trim(), rel).not.toBe('');
      expect(parsed.summary.en.trim(), rel).not.toBe('');
      return parsed.order;
    });
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('software frontmatter 通过 softwareSchema（repo / language 为必需字段）', () => {
    const parsed = softwareSchema.parse(
      frontmatter('content/software/biortools.md')
    );
    expect(parsed.name.trim()).not.toBe('');
    expect(parsed.repo).toMatch(/^https:\/\/github\.com\//);
    expect(parsed.language.trim()).not.toBe('');
    expect(parsed.order).toBeGreaterThan(0);
  });

  it('content/software 下每个条目都通过 softwareSchema 且 order 唯一', () => {
    const files = readdirSync(resolve(ROOT, 'content/software'))
      .filter((name) => name.endsWith('.md'))
      .sort();
    expect(files.length).toBeGreaterThan(0);
    const orders = files.map((name) => {
      const rel = `content/software/${name}`;
      const parsed = softwareSchema.parse(frontmatter(rel));
      expect(parsed.name.trim(), rel).not.toBe('');
      expect(parsed.tagline.en.trim(), rel).not.toBe('');
      expect(parsed.repo, rel).toMatch(/^https?:\/\//);
      return parsed.order;
    });
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe('schema 真的会拒绝坏输入（反例）', () => {
  it('publicationItem 拒绝非法 type 枚举值', () => {
    expect(() =>
      publicationItem.parse({ ...validPublication, type: 'dataset' })
    ).toThrow();
  });

  it('publicationItem 拒绝缺少必需字段 title 的条目', () => {
    const { title: _title, ...withoutTitle } = validPublication;
    expect(() => publicationItem.parse(withoutTitle)).toThrow();
  });

  it('publicationItem 接受合法条目（反例的对照组，避免 toThrow 恒真）', () => {
    expect(() => publicationItem.parse(validPublication)).not.toThrow();
  });

  it('publicationItem 拒绝被改名的字段（venue -> venueName）', () => {
    const { venue, ...withoutVenue } = validPublication;
    expect(() => publicationItem.parse(withoutVenue)).toThrow();
    expect(() =>
      publicationItem.parse({ ...withoutVenue, venueName: venue })
    ).toThrow();
  });

  it('publicationItem 接受 type / authorRole 的全部枚举成员，且拒绝邻接的错拼值', () => {
    for (const type of [
      'journal',
      'conference',
      'preprint',
      'book',
      'book-chapter',
      'thesis',
      'report',
      'other',
    ] as const) {
      expect(() =>
        publicationItem.parse({ ...validPublication, type })
      ).not.toThrow();
    }
    for (const authorRole of [
      'first',
      'co-first',
      'corresponding',
      'co-author',
    ] as const) {
      expect(() =>
        publicationItem.parse({ ...validPublication, authorRole })
      ).not.toThrow();
    }
    expect(() =>
      publicationItem.parse({ ...validPublication, authorRole: 'coauthor' })
    ).toThrow();
    expect(() =>
      publicationItem.parse({ ...validPublication, type: 'bookchapter' })
    ).toThrow();
  });

  it('publicationItem 拒绝 year 非整数的条目', () => {
    expect(() =>
      publicationItem.parse({ ...validPublication, year: '2026' })
    ).toThrow();
  });

  it('siteProfileSchema 拒绝非 URL 的 blog.url', () => {
    const site = parseYaml(read('content/site.yaml')) as Record<string, unknown>;
    expect(() =>
      siteProfileSchema.parse({
        ...site,
        blog: { label: { en: 'Blog', zh: '博客' }, url: 'not-a-url' },
      })
    ).toThrow();
  });

  it('researchSchema 拒绝非整数 order', () => {
    const fm = frontmatter('content/research/effector-genomics.md');
    expect(() => researchSchema.parse({ ...(fm as object), order: 1.5 })).toThrow();
  });

  it('softwareSchema 拒绝缺少 language 的条目', () => {
    const { language: _language, ...withoutLanguage } = softwareSchema.parse(
      frontmatter('content/software/biortools.md')
    );
    expect(() => softwareSchema.parse(withoutLanguage)).toThrow();
  });

  it('cvSchema 拒绝缺少 org 的履历条目', () => {
    expect(() =>
      cvSchema.parse({
        education: [{ start: '2020', end: '2024', title: { en: 'PhD' } }],
        positions: [],
        awards: [],
        talks: [],
      })
    ).toThrow();
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  cvSchema,
  publicationItem,
  researchSchema,
  siteProfileSchema,
  softwareSchema,
} from '../src/lib/schemas';

const ROOT = '/Users/lixiang/NutstoreFiles/03.编程相关/my_academic_web';

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
    expect(parsed.name.en).toBe('TODO: 待用户提供');
    expect(parsed.links).toEqual([]);
    expect(parsed.featuredPosts).toEqual([]);
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
    expect(parsed.title.en).toBe('Effector genomics in oomycete pathogens');
    expect(parsed.title.zh).toBe('卵菌效应子的基因组学解析');
    expect(parsed.summary.en).toContain('Phytophthora sojae');
    expect(parsed.order).toBe(1);
    expect(parsed.keywords).toContain('effector');
  });

  it('software frontmatter 通过 softwareSchema（repo / language 为必需字段）', () => {
    const parsed = softwareSchema.parse(
      frontmatter('content/software/biortools.md')
    );
    expect(parsed.name).toBe('bioRtools');
    expect(parsed.repo).toBe('https://github.com/lixiang117423/bioRtools');
    expect(parsed.language).toBe('R');
    expect(parsed.order).toBe(1);
  });
});

describe('schema 真的会拒绝坏输入（反例）', () => {
  it('publicationItem 拒绝非法 type 枚举值', () => {
    expect(() =>
      publicationItem.parse({ ...validPublication, type: 'thesis' })
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
    for (const type of ['journal', 'preprint', 'conference'] as const) {
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
      publicationItem.parse({ ...validPublication, type: 'book' })
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

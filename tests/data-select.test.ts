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

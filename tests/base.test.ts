import { describe, expect, it } from 'vitest';
import { BASE, href, stripBase } from '../src/lib/base';

describe('base：部署前缀拼接', () => {
  it('vitest 下 BASE_URL 为 /，BASE 归一化成空串', () => {
    expect(BASE).toBe('');
  });

  it('未设 base 时 href() 是恒等映射（不会多出双斜杠）', () => {
    expect(href('/')).toBe('/');
    expect(href('/publications')).toBe('/publications');
    expect(href('cv/cv-en.pdf')).toBe('/cv/cv-en.pdf');
  });

  it('未设 base 时 stripBase() 原样返回', () => {
    expect(stripBase('/zh/cv/')).toBe('/zh/cv/');
    expect(stripBase('/')).toBe('/');
  });
});

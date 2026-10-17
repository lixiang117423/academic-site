import { describe, expect, it } from 'vitest';
import { isExternal } from '../src/lib/links';

describe('isExternal：哪些链接该新开标签页', () => {
  it('http / https 绝对地址算外链', () => {
    expect(isExternal('https://doi.org/10.3389/fpls.2023.1178069')).toBe(true);
    expect(isExternal('https://github.com/lixiang117423')).toBe(true);
    expect(isExternal('http://example.org')).toBe(true);
  });

  it('站内相对路径不算外链', () => {
    expect(isExternal('/academic-site/publications')).toBe(false);
    expect(isExternal('/')).toBe(false);
    expect(isExternal('#top')).toBe(false);
  });

  it('mailto 不算外链（打开的是邮件客户端，不该新开标签页）', () => {
    expect(isExternal('mailto:lixiang117423@gmail.com')).toBe(false);
  });
});

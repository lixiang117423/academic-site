import { describe, expect, it } from 'vitest';
import { emphasis } from '../src/lib/rich-text';

describe('emphasis：把内容里的 *斜体* 标记转成 <em>', () => {
  it('成对的单星号转为 <em>', () => {
    expect(emphasis('Effectors of *Phytophthora sojae* in soybean')).toBe(
      'Effectors of <em>Phytophthora sojae</em> in soybean'
    );
  });

  it('同一段里的多处强调都能转换', () => {
    expect(emphasis('*Glycine max* and *Glycine soja*')).toBe(
      '<em>Glycine max</em> and <em>Glycine soja</em>'
    );
  });

  it('没有星号时原样返回', () => {
    expect(emphasis('Effector genomics in oomycete pathogens')).toBe(
      'Effector genomics in oomycete pathogens'
    );
  });

  it('转义 HTML 特殊字符，避免内容被当作标签解析', () => {
    expect(emphasis('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
    expect(emphasis('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(emphasis('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('不跨行匹配星号', () => {
    expect(emphasis('*a\nb*')).toBe('*a\nb*');
  });

  it('不成对的单个星号保持原样', () => {
    expect(emphasis('2 * 3 = 6')).toBe('2 * 3 = 6');
  });
});

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

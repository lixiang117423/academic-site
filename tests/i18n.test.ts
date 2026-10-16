import { describe, expect, it } from 'vitest';
import { altPath, localeFromPath, pick } from '../src/lib/i18n';

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

  it('中文为纯空白时回退英文', () => {
    expect(pick('zh', { en: 'Hello', zh: '   ' })).toBe('Hello');
  });

  it('英文请求始终返回英文', () => {
    expect(pick('en', { en: 'Hello', zh: '你好' })).toBe('Hello');
  });
});

describe('altPath：语言切换目标', () => {
  it('有对应中文页时按页面切换', () => {
    expect(altPath('/')).toBe('/zh/');
    expect(altPath('/cv/')).toBe('/zh/cv/');
    expect(altPath('/zh/cv/')).toBe('/cv/');
    expect(altPath('/zh/')).toBe('/');
  });

  it('只有英文版的页面（Publications / 404）切到中文站首页，不指向不存在的 /zh/...', () => {
    expect(altPath('/publications')).toBe('/zh/');
    expect(altPath('/publications/')).toBe('/zh/');
    expect(altPath('/404.html')).toBe('/zh/404.html'); // 非路由路径按常规处理
    expect(altPath('/404')).toBe('/zh/');
  });
});

describe('localeFromPath', () => {
  it('识别中文前缀，其余归英文', () => {
    expect(localeFromPath('/zh/')).toBe('zh');
    expect(localeFromPath('/zh/cv/')).toBe('zh');
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/publications/')).toBe('en');
  });
});

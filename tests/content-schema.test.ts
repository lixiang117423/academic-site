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

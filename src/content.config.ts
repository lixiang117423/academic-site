import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';
import {
  cvSchema,
  publicationItem,
  researchSchema,
  siteProfileSchema,
  softwareSchema,
} from './lib/schemas';

// schema 值集中在 src/lib/schemas.ts，本文件只做 loader 与 defineCollection 接线。
// 拆分的唯一目的：让 vitest 能直接加载 schema 对真实内容文件做校验
// （src/lib/schemas.ts 不 import 'astro:content'，测试运行时可用）。
const research = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/research' }),
  schema: researchSchema,
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/software' }),
  schema: softwareSchema,
});

const publicationsGenerated = defineCollection({
  loader: file('./content/publications.json', {
    parser: (text: string) => JSON.parse(text).items,
  }),
  schema: publicationItem,
});

// site.yaml / cv.yaml 是单对象文件，不是数组；用 parser 包成 Astro 要求的
// 「带 id 的条目数组」，id 固定为文件名，便于 data-source.ts 用 getEntry 取回。
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

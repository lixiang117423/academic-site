import { z } from 'astro/zod';

// 本模块只依赖 zod，不 import 'astro:content'：这样 vitest 能直接加载这些
// schema 并对真实内容文件做校验（Astro 的虚拟模块在测试运行时不可用）。
// src/content.config.ts 从这里取 schema，只保留 loader 与 defineCollection 接线。

export const localized = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

// 一个研究方向一个文件：content/research/<slug>.md。
// title / summary 都带 { en, zh }，中英只写一份，不会两处漂移。
export const researchSchema = z.object({
  title: localized,
  summary: localized,
  order: z.number().int(),
  keywords: z.array(z.string()).default([]),
  image: z.string().optional(),
});

export const softwareSchema = z.object({
  name: z.string(),
  tagline: localized,
  repo: z.string().url(),
  language: z.string(),
  install: z.string().optional(),
  docs: z.string().url().optional(),
  order: z.number().int().default(999),
});

export const publicationItem = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().int(),
  venue: z.string(),
  type: z.enum([
    'journal',
    'conference',
    'preprint',
    'book',
    'book-chapter',
    'thesis',
    'report',
    'other',
  ]),
  doi: z.string().nullable(),
  url: z.string().nullable(),
  code: z.string().nullable(),
  pdf: z.string().nullable(),
  keywords: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  authorRole: z.enum(['first', 'co-first', 'corresponding', 'co-author']),
});

export const siteProfileSchema = z.object({
  name: localized,
  title: localized,
  affiliation: localized,
  intro: localized,
  location: z.string(),
  email: z.string(),
  selfAuthors: z.array(z.string()).default([]),
  links: z.array(
    z.object({
      label: z.string(),
      url: z.string().url(),
      icon: z.string(),
    })
  ),
  blog: z.object({ label: localized, url: z.string().url() }),
  featuredPosts: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      date: z.string(),
    })
  ),
});

export const cvEntrySchema = z.object({
  start: z.string(),
  end: z.string(),
  title: localized,
  org: localized,
  note: localized.optional(),
});

export const cvSchema = z.object({
  education: z.array(cvEntrySchema),
  positions: z.array(cvEntrySchema),
  awards: z.array(cvEntrySchema),
  talks: z.array(cvEntrySchema),
});

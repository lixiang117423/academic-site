import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { parse as parseYaml } from 'yaml';

const localized = z.object({
  en: z.string(),
  zh: z.string().optional(),
});

// 一个研究方向一个文件：content/research/<slug>.md。
// title / summary 都带 { en, zh }，中英只写一份，不会两处漂移。
const research = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/research' }),
  schema: z.object({
    title: localized,
    summary: localized,
    order: z.number().int(),
    keywords: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

const software = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/software' }),
  schema: z.object({
    name: z.string(),
    tagline: localized,
    repo: z.string().url(),
    language: z.string(),
    install: z.string().optional(),
    docs: z.string().url().optional(),
    order: z.number().int().default(999),
  }),
});

const publicationItem = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().int(),
  venue: z.string(),
  type: z.enum(['journal', 'preprint', 'conference']),
  doi: z.string().nullable(),
  url: z.string().nullable(),
  code: z.string().nullable(),
  pdf: z.string().nullable(),
  keywords: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  authorRole: z.enum(['first', 'co-first', 'corresponding', 'co-author']),
});

const publicationsGenerated = defineCollection({
  loader: file('./content/publications.json', {
    parser: (text: string) => JSON.parse(text).items,
  }),
  schema: publicationItem,
});

// site.yaml / cv.yaml 是单对象文件，不是数组；用 parser 包成 Astro 要求的
// 「带 id 的条目数组」，id 固定为文件名，便于 data-source.ts 用 getEntry 取回。
const siteProfileSchema = z.object({
  name: localized,
  title: localized,
  affiliation: localized,
  location: z.string(),
  email: z.string(),
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

const cvEntrySchema = z.object({
  start: z.string(),
  end: z.string(),
  title: localized,
  org: localized,
  note: localized.optional(),
});

const cvSchema = z.object({
  education: z.array(cvEntrySchema),
  positions: z.array(cvEntrySchema),
  awards: z.array(cvEntrySchema),
  talks: z.array(cvEntrySchema),
});

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

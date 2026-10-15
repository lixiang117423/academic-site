/** 双语字段：中文缺失时由 pick() 回退英文 */
export interface Localized {
  en: string;
  zh?: string;
}

export type Locale = 'en' | 'zh';

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  type:
    | 'journal'
    | 'conference'
    | 'preprint'
    | 'book'
    | 'book-chapter'
    | 'thesis'
    | 'report'
    | 'other';
  doi: string | null;
  url: string | null;
  code: string | null;
  pdf: string | null;
  keywords: string[];
  featured: boolean;
  authorRole: 'first' | 'co-first' | 'corresponding' | 'co-author';
}

export interface ResearchItem {
  slug: string;
  title: Localized;
  summary: Localized;
  order: number;
  keywords: string[];
  image?: string;
}

export interface SoftwareItem {
  slug: string;
  name: string;
  tagline: Localized;
  repo: string;
  language: string;
  install?: string;
  docs?: string;
  order: number;
}

export interface SiteLink {
  label: string;
  url: string;
  icon: string;
}

export interface FeaturedPost {
  title: string;
  url: string;
  date: string;
}

export interface SiteProfile {
  name: Localized;
  title: Localized;
  affiliation: Localized;
  location: string;
  email: string;
  links: SiteLink[];
  blog: { label: Localized; url: string };
  featuredPosts: FeaturedPost[];
}

export interface CvEntry {
  start: string;
  end: string;
  title: Localized;
  org: Localized;
  note?: Localized;
}

export interface CvData {
  education: CvEntry[];
  positions: CvEntry[];
  awards: CvEntry[];
  talks: CvEntry[];
}

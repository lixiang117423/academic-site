import { getCollection, getEntry } from 'astro:content';
import { filterPublications, sortResearch, sortSoftware } from './data-select';
import type { PublicationQuery } from './data-select';
import type {
  CvData,
  Publication,
  ResearchItem,
  SiteProfile,
  SoftwareItem,
} from './types';

export type { PublicationQuery };

export async function getSiteProfile(): Promise<SiteProfile> {
  const entry = await getEntry('site', 'site');
  if (!entry) {
    throw new Error("缺少 content/site.yaml（集合 site 的条目 id 必须是 'site'）");
  }
  return entry.data as SiteProfile;
}

export async function listPublications(
  query: PublicationQuery = {}
): Promise<Publication[]> {
  const entries = await getCollection('publicationsGenerated');
  return filterPublications(entries.map((entry) => entry.data as Publication), query);
}

export async function listResearch(): Promise<ResearchItem[]> {
  const entries = await getCollection('research');
  const items: ResearchItem[] = entries.map((entry) => ({
    slug: entry.id,
    title: entry.data.title,
    summary: entry.data.summary,
    order: entry.data.order,
    keywords: entry.data.keywords,
  }));
  return sortResearch(items);
}

export async function listSoftware(): Promise<SoftwareItem[]> {
  const entries = await getCollection('software');
  const items: SoftwareItem[] = entries.map((entry) => ({
    slug: entry.id,
    name: entry.data.name,
    tagline: entry.data.tagline,
    repo: entry.data.repo,
    language: entry.data.language,
    install: entry.data.install,
    docs: entry.data.docs,
    order: entry.data.order,
  }));
  return sortSoftware(items);
}

export async function getCV(): Promise<CvData> {
  const entry = await getEntry('cv', 'cv');
  if (!entry) {
    throw new Error("缺少 content/cv.yaml（集合 cv 的条目 id 必须是 'cv'）");
  }
  return entry.data as CvData;
}

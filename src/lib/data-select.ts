import type { Publication, ResearchItem, SoftwareItem } from './types';

export interface PublicationQuery {
  featured?: boolean;
  year?: number;
  keyword?: string;
  limit?: number;
}

export function filterPublications(
  items: Publication[],
  query: PublicationQuery = {}
): Publication[] {
  let result = [...items];

  if (query.featured !== undefined) {
    result = result.filter((item) => item.featured === query.featured);
  }
  if (query.year !== undefined) {
    result = result.filter((item) => item.year === query.year);
  }
  if (query.keyword !== undefined) {
    result = result.filter((item) => item.keywords.includes(query.keyword as string));
  }

  result.sort((a, b) => b.year - a.year || a.id.localeCompare(b.id));
  return query.limit === undefined ? result : result.slice(0, query.limit);
}

export function sortResearch(items: ResearchItem[]): ResearchItem[] {
  return [...items].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
}

export function sortSoftware(items: SoftwareItem[]): SoftwareItem[] {
  return [...items].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

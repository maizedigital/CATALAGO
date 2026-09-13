// MB Moda Brasil — all routes are at the root, no slug prefix needed.
export function catalogPath(path: string): string {
  return path;
}

export function useCatalogPrefix(): string {
  return '';
}

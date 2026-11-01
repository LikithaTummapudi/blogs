const rawBase = import.meta.env.BASE_URL || '/';
export const BASE_PATH = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

/**
 * Prepends the base path (e.g. /blogs) to internal routes and public assets.
 */
export function url(path: string = ''): string {
  if (!path || path.trim() === '') return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('tel:') ||
    path.startsWith('#')
  ) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') {
    return BASE_PATH ? `${BASE_PATH}/` : '/';
  }

  if (BASE_PATH && cleanPath.startsWith(`${BASE_PATH}/`)) {
    return cleanPath;
  }

  return `${BASE_PATH}${cleanPath}`;
}

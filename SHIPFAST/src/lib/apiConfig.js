const DEFAULT_API_BASE_URL = 'http://localhost:8085';

const stripTrailingSlash = (value = '') => String(value || '').replace(/\/+$/, '');
const toLower = (value = '') => String(value || '').trim().toLowerCase();
const isHttpLocal = (value = '') => {
  const normalized = toLower(value);
  return normalized.includes('localhost') || normalized.includes('127.0.0.1');
};
const FALLBACK_ENABLED = String(import.meta.env.VITE_ENABLE_OLD_BACKEND_FALLBACK ?? 'true').toLowerCase() !== 'false';

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const resolveServiceBaseUrl = (envValue) => {
  const explicit = stripTrailingSlash(envValue || '');
  if (explicit) return explicit;
  return API_BASE_URL;
};

export const resolveServiceBaseUrls = (envValue, options = {}) => {
  const { localDirectBase = '', includeProxyFallback = true } = options;
  const primary = resolveServiceBaseUrl(envValue);
  const primaryClean = stripTrailingSlash(primary);
  const candidates = [primaryClean];

  if (FALLBACK_ENABLED) {
    const localDirect = stripTrailingSlash(localDirectBase);
    if (localDirect) {
      if (!isHttpLocal(primaryClean)) {
        candidates.unshift(localDirect);
      } else {
        candidates.push(localDirect);
      }
    }
    if (includeProxyFallback && !isHttpLocal(primaryClean)) candidates.push('');
  }

  return candidates.filter((value, index, list) => list.indexOf(value) === index);
};

export const toServiceBaseUrl = (baseUrl, apiPath) => {
  const cleanedPath = String(apiPath || '').startsWith('/') ? String(apiPath) : `/${String(apiPath || '')}`;
  const cleanedBase = stripTrailingSlash(baseUrl || '');
  if (!cleanedBase) return cleanedPath;
  return `${cleanedBase}${cleanedPath}`;
};

export const shouldRetryWithFallback = (error) => {
  const status = Number(error?.response?.status || 0);
  if (!error?.response) return true;
  return [404, 408, 429, 500, 502, 503, 504].includes(status);
};

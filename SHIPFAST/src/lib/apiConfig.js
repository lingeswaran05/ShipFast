const DEFAULT_API_BASE_URL = 'http://localhost:8081';

const stripTrailingSlash = (value = '') => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
);

export const resolveServiceBaseUrl = (envValue) => {
  const explicit = stripTrailingSlash(envValue || '');
  if (explicit) return explicit;
  return API_BASE_URL;
};

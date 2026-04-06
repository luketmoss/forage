import { signal } from '@preact/signals';

export interface Route {
  name: string;
  path: string;
  params: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'schedule', path: '/', params: {} };

  if (parts[0] === 'recipes') {
    if (parts.length === 1) return { name: 'recipes', path: '/recipes', params: {} };
    if (parts[1] === 'new') return { name: 'recipe-new', path: '/recipes/new', params: {} };
    if (parts.length === 2) return { name: 'recipe-detail', path: hash, params: { id: parts[1] } };
    if (parts[2] === 'edit') return { name: 'recipe-edit', path: hash, params: { id: parts[1] } };
    return { name: 'recipe-detail', path: hash, params: { id: parts[1] } };
  }

  if (parts[0] === 'ingredients') {
    return { name: 'ingredients', path: '/ingredients', params: {} };
  }

  if (parts[0] === 'session') {
    if (parts[1] === 'new') return { name: 'session-new', path: hash, params: {} };
    if (parts.length >= 2) return { name: 'session-active', path: hash, params: { id: parts[1] } };
  }

  if (parts[0] === 'history') {
    if (parts.length >= 2) return { name: 'session-detail', path: hash, params: { id: parts[1] } };
  }

  if (parts[0] === 'settings') {
    if (parts[1] === 'labels') return { name: 'manage-labels', path: '/settings/labels', params: {} };
    return { name: 'settings', path: '/settings', params: {} };
  }
  if (parts[0] === 'shopping') return { name: 'shopping', path: '/shopping', params: {} };

  return { name: 'schedule', path: '/', params: {} };
}

export const currentRoute = signal<Route>(parseHash());

window.addEventListener('hashchange', () => {
  currentRoute.value = parseHash();
});

export function navigate(path: string) {
  window.location.hash = path;
}

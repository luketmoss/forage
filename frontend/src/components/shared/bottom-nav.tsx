import { currentRoute, navigate } from '../../router/router';

export function BottomNav() {
  const route = currentRoute.value;

  const tabs = [
    { name: 'schedule', label: 'Schedule', icon: '\u{1F4C5}', path: '/' },
    { name: 'recipes', label: 'Recipes', icon: '\u{1F4D6}', path: '/recipes' },
    { name: 'ingredients', label: 'Ingredients', icon: '\u{1F966}', path: '/ingredients' },
  ];

  return (
    <nav class="bottom-nav">
      {tabs.map(tab => {
        const isActive = route.name === tab.name ||
          (tab.name === 'schedule' && ['session-detail', 'session-new'].includes(route.name)) ||
          (tab.name === 'recipes' && ['recipe-detail', 'recipe-edit', 'recipe-new'].includes(route.name));
        return (
          <button
            key={tab.name}
            class={`bottom-nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
          >
            <span class="bottom-nav-icon">{tab.icon}</span>
            <span class="bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

import { signal } from '@preact/signals';

type ThemeChoice = 'light' | 'dark' | 'system';

function getStoredTheme(): ThemeChoice {
  try {
    const stored = localStorage.getItem('forage-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'system';
}

function resolveTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'light' || choice === 'dark') return choice;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(choice: ThemeChoice) {
  const resolved = resolveTheme(choice);
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    if (choice === 'system') {
      localStorage.removeItem('forage-theme');
    } else {
      localStorage.setItem('forage-theme', choice);
    }
  } catch {}
}

export const themeChoice = signal<ThemeChoice>(getStoredTheme());

// Listen for OS theme changes
try {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeChoice.value === 'system') {
      applyTheme('system');
    }
  });
} catch {}

export function setTheme(choice: ThemeChoice) {
  themeChoice.value = choice;
  applyTheme(choice);
}

export function ThemeToggle() {
  const options: ThemeChoice[] = ['light', 'dark', 'system'];

  return (
    <div class="theme-toggle" role="radiogroup" aria-label="Theme">
      {options.map(opt => (
        <button
          key={opt}
          class={`theme-toggle-btn ${themeChoice.value === opt ? 'active' : ''}`}
          onClick={() => setTheme(opt)}
          role="radio"
          aria-checked={themeChoice.value === opt}
        >
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

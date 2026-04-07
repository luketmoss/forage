import { useEffect, useState } from 'preact/hooks';

/**
 * Detects when a new service worker is available and shows an update banner.
 * Uses the registerSW helper from vite-plugin-pwa.
 */
export function SwUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Dynamic import to avoid issues in dev/test where SW isn't registered
    import('virtual:pwa-register').then(({ registerSW }) => {
      const update = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          console.log('Forage ready for offline use');
        },
      });
      setUpdateSW(() => update);
    }).catch(() => {
      // SW registration not available (dev mode, test, etc.)
    });
  }, []);

  if (!needRefresh) return null;

  return (
    <div class="sw-update-banner">
      <span>New version available</span>
      <button
        class="btn btn-primary"
        style={{ minHeight: '32px', padding: '4px 12px', fontSize: 'var(--text-sm)' }}
        onClick={() => updateSW?.()}
      >
        Update
      </button>
      <button
        class="btn-icon"
        onClick={() => setNeedRefresh(false)}
        aria-label="Dismiss"
        style={{ width: '32px', height: '32px' }}
      >
        ✕
      </button>
    </div>
  );
}

import { navigate } from '../../router/router';
import { ThemeToggle } from '../shared/theme-toggle';
import { ForageLogo } from '../shared/forage-logo';

export function SettingsScreen() {
  return (
    <div class="screen">
      <div class="detail-header">
        <button class="btn-icon" onClick={() => navigate('/')} aria-label="Back">
          ←
        </button>
        <h1>Settings</h1>
      </div>

      {/* Theme */}
      <div class="settings-section">
        <h2>Appearance</h2>
        <div class="settings-row">
          <span class="settings-row-label">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Labels */}
      <div class="settings-section">
        <h2>Labels</h2>
        <div
          class="settings-row"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/settings/labels')}
        >
          <span class="settings-row-label">Manage Labels</span>
          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
        </div>
      </div>

      {/* Account */}
      <div class="settings-section">
        <h2>Account</h2>
        <div class="settings-row">
          <span class="settings-row-label">Signed in as</span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>demo@example.com</span>
        </div>
        <div class="settings-row" style={{ cursor: 'pointer' }}>
          <span class="settings-row-label" style={{ color: 'var(--color-danger)' }}>Sign Out</span>
        </div>
      </div>

      {/* About */}
      <div class="settings-section">
        <h2>About</h2>
        <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
          <ForageLogo size={48} />
          <h3 style={{ marginTop: 'var(--space-sm)', fontWeight: 700 }}>Forage</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>From recipe to table.</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

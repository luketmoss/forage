import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';

interface AddRecipeSheetProps {
  onClose: () => void;
  /** When opened from the schedule's new cook flow, show a hint about returning to start the cook */
  fromCookFlow?: boolean;
}

export function AddRecipeSheet({ onClose, fromCookFlow }: AddRecipeSheetProps) {
  const [showImportUrl, setShowImportUrl] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  function handleImport() {
    setImportStatus('loading');
    setTimeout(() => setImportStatus('done'), 1500);
  }

  function closeImport() {
    setShowImportUrl(false);
    setImportUrl('');
    setImportStatus('idle');
  }

  if (showImportUrl) {
    return (
      <div class="modal-overlay" onClick={() => { closeImport(); onClose(); }}>
        <div class="modal-content" onClick={e => e.stopPropagation()}>
          <div class="modal-handle" />
          <div class="modal-header">
            <h2>🌐 Import from URL</h2>
            <button class="btn-icon" onClick={() => { closeImport(); onClose(); }} aria-label="Close">✕</button>
          </div>

          {importStatus === 'idle' && (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                Paste a recipe URL and we'll extract the ingredients, prep steps, and cooking instructions automatically.
              </p>
              <div class="form-group">
                <label class="form-label">Recipe URL</label>
                <input
                  type="url"
                  class="form-input"
                  placeholder="https://example.com/recipe/..."
                  value={importUrl}
                  onInput={e => setImportUrl((e.target as HTMLInputElement).value)}
                  autoFocus
                />
              </div>
              <button class="btn btn-primary btn-block" onClick={handleImport} disabled={!importUrl.trim()}>
                Import Recipe
              </button>
            </div>
          )}

          {importStatus === 'loading' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div class="spinner" style={{ margin: '0 auto var(--space-md)' }} />
              <p style={{ color: 'var(--color-text-secondary)' }}>Analyzing recipe...</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{importUrl}</p>
            </div>
          )}

          {importStatus === 'done' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-md)' }}>🚧</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Coming Soon</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                AI-powered recipe import is under development. For now, you can enter recipes manually.
              </p>
              <button class="btn btn-primary btn-block" onClick={() => { closeImport(); onClose(); navigate('/recipes/new'); }}>
                Enter Manually Instead
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={e => e.stopPropagation()}>
        <div class="modal-handle" />
        <div class="modal-header">
          <h2>Add Recipe</h2>
          <button class="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {fromCookFlow && (
          <div class="cook-flow-notice">
            <span style={{ fontSize: '1rem' }}>💡</span>
            <span>Create your recipe first — you'll be able to start or schedule it right after.</span>
          </div>
        )}

        <button class="action-sheet-option" onClick={() => { onClose(); navigate('/recipes/new'); }}>
          <span class="action-sheet-icon">✏️</span>
          <div class="action-sheet-label">
            Enter Manually
            <span>Type in your recipe from scratch</span>
          </div>
        </button>

        <button class="action-sheet-option" onClick={() => setShowImportUrl(true)}>
          <span class="action-sheet-icon">🌐</span>
          <div class="action-sheet-label">
            Import from URL
            <span>Paste a recipe website link (AI-powered)</span>
          </div>
        </button>

        <button class="action-sheet-option" onClick={onClose}>
          <span class="action-sheet-icon">📷</span>
          <div class="action-sheet-label">
            Import from Photo
            <span>Take a picture of a recipe (AI-powered)</span>
          </div>
        </button>
      </div>
    </div>
  );
}

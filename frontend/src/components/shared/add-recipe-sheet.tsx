import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { useAuth } from '../../auth/auth-context';
import { importRecipeFromUrl, ImportError } from '../../api/import-api';
import { getConfigValue } from '../../api/config-api';
import type { ImportedRecipe } from '../../api/types';
import { ImportReview } from '../recipes/import-review';

interface AddRecipeSheetProps {
  onClose: () => void;
  /** When opened from the schedule's new cook flow, show a hint about returning to start the cook */
  fromCookFlow?: boolean;
}

type ImportStatus = 'idle' | 'fetching' | 'extracting' | 'matching' | 'done' | 'error';

/** Extract domain from URL for display. */
function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function AddRecipeSheet({ onClose, fromCookFlow }: AddRecipeSheetProps) {
  const { token } = useAuth();
  const [showImportUrl, setShowImportUrl] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<ImportedRecipe | null>(null);

  async function handleImport() {
    if (!importUrl.trim()) return;

    setImportStatus('fetching');
    setErrorMessage('');

    try {
      // Get custom prompt from Config sheet if available
      let prompt: string | undefined;
      if (token) {
        setImportStatus('fetching');
        prompt = await getConfigValue('import_prompt', token) || undefined;
      }

      setImportStatus('extracting');

      const recipe = await importRecipeFromUrl(importUrl.trim(), prompt);

      setImportStatus('matching');
      // Brief pause to show matching state
      await new Promise(r => setTimeout(r, 300));

      setImportedRecipe(recipe);
      setImportStatus('done');
    } catch (err) {
      setImportStatus('error');
      if (err instanceof ImportError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Could not extract a recipe from this page');
      }
    }
  }

  function closeImport() {
    setShowImportUrl(false);
    setImportUrl('');
    setImportStatus('idle');
    setErrorMessage('');
    setImportedRecipe(null);
  }

  function handleImportSaved(recipeId: string) {
    closeImport();
    onClose();
    navigate(`/recipes/${recipeId}`);
  }

  const domain = extractDomain(importUrl);
  const buttonText = domain ? `Import from ${domain}` : 'Import Recipe';
  const isLoading = importStatus === 'fetching' || importStatus === 'extracting' || importStatus === 'matching';

  const statusMessages: Record<string, string> = {
    fetching: 'Fetching page...',
    extracting: 'Extracting recipe...',
    matching: 'Matching ingredients...',
  };

  // Show review screen when recipe is extracted
  if (importedRecipe && importStatus === 'done') {
    return (
      <ImportReview
        recipe={importedRecipe}
        sourceUrl={importUrl.trim()}
        onSave={handleImportSaved}
        onBack={() => {
          setImportedRecipe(null);
          setImportStatus('idle');
        }}
        onClose={() => { closeImport(); onClose(); }}
      />
    );
  }

  if (showImportUrl) {
    return (
      <div class="modal-overlay" onClick={() => { closeImport(); onClose(); }}>
        <div class="modal-content" onClick={e => e.stopPropagation()}>
          <div class="modal-handle" />
          <div class="modal-header">
            <h2>Import from URL</h2>
            <button class="btn-icon" onClick={() => { closeImport(); onClose(); }} aria-label="Close">✕</button>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
              <div class="spinner" style={{ margin: '0 auto var(--space-md)' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {statusMessages[importStatus]}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
                {importUrl}
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
                Paste a recipe URL and we'll extract the ingredients, prep steps, and cooking instructions automatically.
              </p>

              {importStatus === 'error' && errorMessage && (
                <div class="import-error-banner">
                  {errorMessage}
                </div>
              )}

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
                {buttonText}
              </button>

              {importStatus === 'error' && (
                <button
                  class="btn btn-secondary btn-block"
                  style={{ marginTop: 'var(--space-sm)' }}
                  onClick={() => { closeImport(); onClose(); navigate('/recipes/new'); }}
                >
                  Enter Manually Instead
                </button>
              )}
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

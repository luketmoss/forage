import { useState, useEffect } from 'preact/hooks';
import { navigate } from '../../router/router';
import { useAuth } from '../../auth/auth-context';
import { ThemeToggle } from '../shared/theme-toggle';
import { ForageLogo } from '../shared/forage-logo';
import { getConfigValue, setConfigValue } from '../../api/config-api';
import { showToast } from '../../state/store';

const DEFAULT_IMPORT_PROMPT = `You are a recipe step classifier. Given a numbered list of recipe steps, classify each step as either "prep" or "cooking".

Prep steps: measuring, cutting, chopping, dicing, mincing, mixing, seasoning, marinating, preheating, breading, whisking — anything that does NOT involve applying heat to the food.

Cooking steps: sauteing, frying, baking, boiling, simmering, roasting, grilling, broiling, steaming, assembling in a hot pan — anything that applies heat or is the final assembly.

Return ONLY valid JSON with this exact structure:
{
  "prepSteps": ["Step description", ...],
  "cookingSteps": ["Step description", ...]
}

Rules:
- Every input step must appear in exactly one of the two arrays
- Preserve the original step text exactly
- Do not add or remove steps
- Do not include any text outside the JSON`;

export function SettingsScreen() {
  const { token } = useAuth();
  const [importPrompt, setImportPrompt] = useState('');
  const [promptLoaded, setPromptLoaded] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);

  // Load the current prompt from Config sheet
  useEffect(() => {
    if (!token) return;
    getConfigValue('import_prompt', token).then(value => {
      setImportPrompt(value || DEFAULT_IMPORT_PROMPT);
      setPromptLoaded(true);
    }).catch(() => {
      setImportPrompt(DEFAULT_IMPORT_PROMPT);
      setPromptLoaded(true);
    });
  }, [token]);

  async function savePrompt() {
    if (!token || promptSaving) return;
    setPromptSaving(true);
    try {
      await setConfigValue('import_prompt', importPrompt, token);
      showToast('Import prompt saved', 'success');
    } catch {
      showToast('Failed to save prompt', 'error');
    } finally {
      setPromptSaving(false);
    }
  }

  function resetPrompt() {
    setImportPrompt(DEFAULT_IMPORT_PROMPT);
  }

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

      {/* Recipe Import Prompt */}
      <div class="settings-section">
        <h2>Recipe Import</h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-sm)' }}>
          Customize the AI prompt used to classify recipe steps into prep and cooking categories.
        </p>
        {promptLoaded ? (
          <>
            <textarea
              class="form-input import-prompt-editor"
              value={importPrompt}
              onInput={e => setImportPrompt((e.target as HTMLTextAreaElement).value)}
              rows={10}
            />
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <button class="btn btn-primary" style={{ flex: 1 }} onClick={savePrompt} disabled={promptSaving}>
                {promptSaving ? 'Saving...' : 'Save Prompt'}
              </button>
              <button class="btn btn-secondary" onClick={resetPrompt}>
                Reset to Default
              </button>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)', fontStyle: 'italic' }}>
              This prompt is also used as the full extraction fallback for sites without structured recipe data.
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-md)' }}>
            <div class="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}
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

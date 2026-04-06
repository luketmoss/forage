import { useState } from 'preact/hooks';
import { mockIngredients } from '../../mock-data';

export function IngredientsScreen() {
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filtered = search.trim()
    ? mockIngredients.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      )
    : mockIngredients;

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  function handleSaveNew() {
    // In the real app, this would save to the Google Sheet
    setShowNew(false);
    setNewName('');
    setNewDesc('');
  }

  return (
    <div class="screen">
      <header class="screen-header">
        <h1>Ingredients</h1>
      </header>

      {/* Search Bar */}
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input
          type="text"
          class="form-input"
          placeholder="Search ingredients..."
          value={search}
          onInput={e => setSearch((e.target as HTMLInputElement).value)}
        />
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
        {sorted.length} ingredient{sorted.length !== 1 ? 's' : ''}
      </p>

      {/* Ingredient List */}
      {sorted.length === 0 ? (
        <div class="empty-state">
          <p>{search ? 'No ingredients found' : 'No ingredients yet'}</p>
          <p>Tap + to add your first ingredient</p>
        </div>
      ) : (
        <div>
          {sorted.map(ingredient => (
            <div key={ingredient.id} class="card card-clickable" style={{ marginBottom: 'var(--space-sm)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ingredient.name}</div>
              {ingredient.description && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  {ingredient.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAB — New Ingredient */}
      <button class="fab" onClick={() => setShowNew(true)} aria-label="Add ingredient">
        +
      </button>

      {/* New Ingredient Modal */}
      {showNew && (
        <div class="modal-overlay" onClick={() => setShowNew(false)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>New Ingredient</h2>
              <button class="btn-icon" onClick={() => setShowNew(false)} aria-label="Close">✕</button>
            </div>

            <div class="form-group">
              <label class="form-label">Name</label>
              <input
                type="text"
                class="form-input"
                placeholder="e.g., Paprika"
                value={newName}
                onInput={e => setNewName((e.target as HTMLInputElement).value)}
                autoFocus
              />
            </div>

            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea
                class="form-input"
                placeholder="Optional description..."
                value={newDesc}
                onInput={e => setNewDesc((e.target as HTMLTextAreaElement).value)}
              />
            </div>

            <button
              class="btn btn-primary btn-block"
              onClick={handleSaveNew}
              disabled={!newName.trim()}
            >
              Save Ingredient
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

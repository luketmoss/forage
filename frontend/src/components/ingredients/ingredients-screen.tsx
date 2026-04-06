import { useState } from 'preact/hooks';
import { useAuth } from '../../auth/auth-context';
import { ingredients } from '../../state/store';
import { addIngredient, editIngredient, removeIngredient } from '../../state/actions';
import type { IngredientWithRow } from '../../api/types';

export function IngredientsScreen() {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingIngredient, setEditingIngredient] = useState<IngredientWithRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const allIngredients = ingredients.value;

  const filtered = search.trim()
    ? allIngredients.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      )
    : allIngredients;

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  async function handleSaveNew() {
    if (!token || !newName.trim()) return;
    setSaving(true);
    try {
      await addIngredient({ name: newName.trim(), description: newDesc.trim() }, token);
      setShowNew(false);
      setNewName('');
      setNewDesc('');
    } catch { /* toast shown by action */ }
    setSaving(false);
  }

  function openEdit(ingredient: IngredientWithRow) {
    setEditingIngredient(ingredient);
    setEditName(ingredient.name);
    setEditDesc(ingredient.description);
    setShowDeleteConfirm(false);
  }

  function closeEdit() {
    setEditingIngredient(null);
    setShowDeleteConfirm(false);
  }

  async function handleSaveEdit() {
    if (!token || !editingIngredient || !editName.trim()) return;
    setSaving(true);
    try {
      await editIngredient(
        { ...editingIngredient, name: editName.trim(), description: editDesc.trim() },
        token,
      );
      closeEdit();
    } catch { /* toast shown by action */ }
    setSaving(false);
  }

  async function handleDelete() {
    if (!token || !editingIngredient) return;
    setSaving(true);
    try {
      await removeIngredient(editingIngredient, token);
      closeEdit();
    } catch { /* toast shown by action */ }
    setSaving(false);
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
            <div
              key={ingredient.id}
              class="card card-clickable"
              style={{ marginBottom: 'var(--space-sm)' }}
              onClick={() => openEdit(ingredient)}
            >
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
              disabled={!newName.trim() || saving}
            >
              {saving ? 'Saving...' : 'Save Ingredient'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Ingredient Modal */}
      {editingIngredient && (
        <div class="modal-overlay" onClick={closeEdit}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Edit Ingredient</h2>
              <button class="btn-icon" onClick={closeEdit} aria-label="Close">✕</button>
            </div>

            {!showDeleteConfirm ? (
              <div>
                <div class="form-group">
                  <label class="form-label">Name</label>
                  <input
                    type="text"
                    class="form-input"
                    value={editName}
                    onInput={e => setEditName((e.target as HTMLInputElement).value)}
                    autoFocus
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Description</label>
                  <textarea
                    class="form-input"
                    value={editDesc}
                    onInput={e => setEditDesc((e.target as HTMLTextAreaElement).value)}
                  />
                </div>

                <div class="confirm-modal-actions">
                  <button
                    class="btn btn-danger"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                  <button
                    class="btn btn-primary"
                    onClick={handleSaveEdit}
                    disabled={!editName.trim() || saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ marginBottom: 'var(--space-lg)' }}>
                  Delete "<strong>{editingIngredient.name}</strong>"? This cannot be undone.
                </p>
                <div class="confirm-modal-actions">
                  <button class="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button class="btn btn-danger" onClick={handleDelete} disabled={saving}>
                    {saving ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

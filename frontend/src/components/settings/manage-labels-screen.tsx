import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { mockLabels, LABEL_COLORS, COLOR_KEYS, getLabelColor, mockRecipes, type Label } from '../../mock-data';

export function ManageLabelsScreen() {
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('green');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Label | null>(null);

  function getUsageCount(labelName: string): number {
    return mockRecipes.filter(r => r.labels.includes(labelName)).length;
  }

  function openEdit(label: Label) {
    setEditingLabel(label);
    setEditName(label.name);
    setEditColor(label.colorKey);
  }

  function saveEdit() {
    // In real app: update via API, cascade rename to recipes
    setEditingLabel(null);
  }

  function handleCreate() {
    if (!newName.trim()) return;
    // In real app: create via API
    setNewName('');
    setNewColor('green');
    setShowCreate(false);
  }

  function confirmDelete() {
    // In real app: delete via API, remove from all recipes
    setShowDeleteConfirm(null);
  }

  return (
    <div class="screen">
      <div class="detail-header">
        <button class="btn-icon" onClick={() => navigate('/settings')} aria-label="Back">
          ←
        </button>
        <h1>Manage Labels</h1>
      </div>

      {/* Label List */}
      {mockLabels.length === 0 ? (
        <div class="empty-state">
          <p>No labels yet</p>
          <p>Create labels to organize your recipes</p>
        </div>
      ) : (
        <div>
          {mockLabels.map(label => {
            const color = getLabelColor(label.colorKey);
            const usage = getUsageCount(label.name);
            return (
              <div key={label.id} class="settings-row" style={{ gap: 'var(--space-md)' }}>
                {/* Color swatch */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: color.bg,
                    border: `2px solid ${color.text}`,
                    flexShrink: 0,
                  }}
                />
                {/* Name + usage */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{label.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-sm)' }}>
                    {usage} {usage === 1 ? 'recipe' : 'recipes'}
                  </span>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: '2px' }}>
                  <button class="btn-icon" onClick={() => openEdit(label)} aria-label={`Edit ${label.name}`} style={{ width: '36px', height: '36px' }}>
                    ✎
                  </button>
                  <button class="btn-icon" onClick={() => setShowDeleteConfirm(label)} aria-label={`Delete ${label.name}`} style={{ width: '36px', height: '36px', color: 'var(--color-danger)' }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create New */}
      {showCreate ? (
        <div class="card" style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)' }}>
          <div class="form-group">
            <label class="form-label">Label Name</label>
            <input
              type="text"
              class="form-input"
              placeholder="e.g., Breakfast"
              value={newName}
              onInput={e => setNewName((e.target as HTMLInputElement).value)}
              autoFocus
              maxLength={30}
            />
          </div>
          <div class="form-group">
            <label class="form-label">Color</label>
            <ColorSwatchGrid selected={newColor} onSelect={setNewColor} />
          </div>
          <div class="confirm-modal-actions">
            <button class="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button class="btn btn-primary" onClick={handleCreate} disabled={!newName.trim()}>Save</button>
          </div>
        </div>
      ) : (
        <button
          class="btn btn-secondary btn-block"
          style={{ marginTop: 'var(--space-md)' }}
          onClick={() => setShowCreate(true)}
        >
          + New Label
        </button>
      )}

      {/* Edit Modal */}
      {editingLabel && (
        <div class="modal-overlay" onClick={() => setEditingLabel(null)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Edit Label</h2>
              <button class="btn-icon" onClick={() => setEditingLabel(null)} aria-label="Close">✕</button>
            </div>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input
                type="text"
                class="form-input"
                value={editName}
                onInput={e => setEditName((e.target as HTMLInputElement).value)}
                autoFocus
                maxLength={30}
              />
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <ColorSwatchGrid selected={editColor} onSelect={setEditColor} />
            </div>
            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setEditingLabel(null)}>Cancel</button>
              <button class="btn btn-primary" onClick={saveEdit} disabled={!editName.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div class="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Delete Label</h2>
              <button class="btn-icon" onClick={() => setShowDeleteConfirm(null)} aria-label="Close">✕</button>
            </div>
            <p style={{ marginBottom: 'var(--space-lg)' }}>
              {(() => {
                const usage = getUsageCount(showDeleteConfirm.name);
                if (usage > 0) {
                  return <>This label is used by <strong>{usage} {usage === 1 ? 'recipe' : 'recipes'}</strong>. It will be removed from all of them.</>;
                }
                return <>Delete the label "<strong>{showDeleteConfirm.name}</strong>"?</>;
              })()}
            </p>
            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button class="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Color Swatch Grid =====
function ColorSwatchGrid({ selected, onSelect }: { selected: string; onSelect: (key: string) => void }) {
  return (
    <div class="color-swatch-grid" role="radiogroup" aria-label="Label color">
      {COLOR_KEYS.map(key => {
        const color = LABEL_COLORS[key];
        return (
          <button
            key={key}
            class={`color-swatch ${selected === key ? 'color-swatch-selected' : ''}`}
            style={{ background: color.bg, borderColor: color.text }}
            onClick={() => onSelect(key)}
            role="radio"
            aria-checked={selected === key}
            aria-label={key}
          >
            {selected === key && <span style={{ color: color.text }}>✓</span>}
          </button>
        );
      })}
    </div>
  );
}

import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { useAuth } from '../../auth/auth-context';
import { labels, labelUsageCount } from '../../state/store';
import { addLabel, editLabel, removeLabel } from '../../state/actions';
import { LABEL_COLORS, COLOR_KEYS, getLabelColor } from '../../api/label-colors';
import type { LabelWithRow } from '../../api/types';

export function ManageLabelsScreen() {
  const { token } = useAuth();
  const [editingLabel, setEditingLabel] = useState<LabelWithRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('green');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<LabelWithRow | null>(null);
  const [saving, setSaving] = useState(false);

  const allLabels = labels.value;

  function openEdit(label: LabelWithRow) {
    setEditingLabel(label);
    setEditName(label.name);
    setEditColor(label.colorKey);
  }

  async function saveEdit() {
    if (!token || !editingLabel || !editName.trim()) return;
    setSaving(true);
    try {
      const oldName = editingLabel.name;
      await editLabel({ ...editingLabel, name: editName.trim(), colorKey: editColor }, oldName, token);
      setEditingLabel(null);
    } catch { /* toast */ }
    setSaving(false);
  }

  async function handleCreate() {
    if (!token || !newName.trim()) return;
    setSaving(true);
    try {
      await addLabel({ name: newName.trim(), colorKey: newColor }, token);
      setNewName('');
      setNewColor('green');
      setShowCreate(false);
    } catch { /* toast */ }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!token || !showDeleteConfirm) return;
    setSaving(true);
    try {
      await removeLabel(showDeleteConfirm, token);
      setShowDeleteConfirm(null);
    } catch { /* toast */ }
    setSaving(false);
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
      {allLabels.length === 0 ? (
        <div class="empty-state">
          <p>No labels yet</p>
          <p>Create labels to organize your recipes</p>
        </div>
      ) : (
        <div>
          {allLabels.map(label => {
            const color = getLabelColor(label.colorKey);
            const usage = labelUsageCount(label.name);
            return (
              <div key={label.id} class="settings-row" style={{ gap: 'var(--space-md)' }}>
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{label.name}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-sm)' }}>
                    {usage} {usage === 1 ? 'recipe' : 'recipes'}
                  </span>
                </div>
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
            <button class="btn btn-primary" onClick={handleCreate} disabled={!newName.trim() || saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
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
              <input type="text" class="form-input" value={editName} onInput={e => setEditName((e.target as HTMLInputElement).value)} autoFocus maxLength={30} />
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <ColorSwatchGrid selected={editColor} onSelect={setEditColor} />
            </div>
            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setEditingLabel(null)}>Cancel</button>
              <button class="btn btn-primary" onClick={saveEdit} disabled={!editName.trim() || saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
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
                const usage = labelUsageCount(showDeleteConfirm.name);
                if (usage > 0) {
                  return <>This label is used by <strong>{usage} {usage === 1 ? 'recipe' : 'recipes'}</strong>. It will be removed from all of them.</>;
                }
                return <>Delete the label "<strong>{showDeleteConfirm.name}</strong>"?</>;
              })()}
            </p>
            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button class="btn btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
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

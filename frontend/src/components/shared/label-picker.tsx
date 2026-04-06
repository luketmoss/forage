import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { mockLabels, LABEL_COLORS, COLOR_KEYS, getLabelColor, type Label } from '../../mock-data';

interface LabelPickerProps {
  selected: string[];
  onToggle: (labelName: string) => void;
}

export function LabelPicker({ selected, onToggle }: LabelPickerProps) {
  const [mode, setMode] = useState<'select' | 'manage'>('select');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('green');
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  function handleCreate() {
    if (!newName.trim()) return;
    // In real app, would create via API
    setNewName('');
    setNewColor('green');
    setShowCreate(false);
  }

  function openEdit(label: Label) {
    setEditingLabel(label);
    setEditName(label.name);
    setEditColor(label.colorKey);
  }

  function saveEdit() {
    // In real app, would update via API
    setEditingLabel(null);
  }

  return (
    <div class="label-picker">
      {/* Header */}
      <div class="label-picker-header">
        <span class="form-label" style={{ margin: 0 }}>Labels</span>
        <button
          class="btn-icon"
          onClick={() => setMode(mode === 'select' ? 'manage' : 'select')}
          aria-label={mode === 'select' ? 'Manage labels' : 'Done managing'}
          style={{ width: '32px', height: '32px', fontSize: 'var(--text-sm)' }}
        >
          {mode === 'select' ? '⚙' : '✓'}
        </button>
      </div>

      {/* Label Grid */}
      <div class="label-chip-grid">
        {mockLabels.map(label => {
          const isSelected = selected.includes(label.name);
          const color = getLabelColor(label.colorKey);

          if (mode === 'manage') {
            return (
              <div key={label.id} class="label-manage-row">
                <span
                  class="label-badge"
                  style={{
                    '--label-bg': color.bg,
                    '--label-text': color.text,
                    '--label-bg-dark': color.bgDark,
                    '--label-text-dark': color.textDark,
                  } as Record<string, string>}
                >
                  {label.name}
                </span>
                <div class="label-manage-actions">
                  <button class="btn-icon" onClick={() => openEdit(label)} aria-label={`Edit ${label.name}`} style={{ width: '28px', height: '28px', fontSize: 'var(--text-xs)' }}>
                    ✎
                  </button>
                  <button class="btn-icon" aria-label={`Delete ${label.name}`} style={{ width: '28px', height: '28px', fontSize: 'var(--text-xs)', color: 'var(--color-danger)' }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          }

          return (
            <button
              key={label.id}
              class={`label-chip ${isSelected ? 'label-chip-active' : ''}`}
              style={{
                '--label-bg': color.bg,
                '--label-text': color.text,
                '--label-bg-dark': color.bgDark,
                '--label-text-dark': color.textDark,
              } as Record<string, string>}
              onClick={() => onToggle(label.name)}
            >
              {label.name}
            </button>
          );
        })}

        {/* Create new label */}
        {mode === 'select' && !showCreate && (
          <button class="label-chip label-chip-create" onClick={() => setShowCreate(true)}>
            + New
          </button>
        )}
      </div>

      {/* Manage labels link */}
      {mode === 'select' && !showCreate && (
        <button
          class="btn btn-ghost"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', padding: '2px 0' }}
          onClick={() => navigate('/settings/labels')}
        >
          Manage labels →
        </button>
      )}

      {/* Inline Create Form */}
      {showCreate && (
        <div class="label-create-form">
          <input
            type="text"
            class="form-input"
            placeholder="Label name"
            value={newName}
            onInput={e => setNewName((e.target as HTMLInputElement).value)}
            style={{ minHeight: '36px', fontSize: 'var(--text-sm)' }}
            autoFocus
          />
          <ColorSwatchGrid selected={newColor} onSelect={setNewColor} />
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button class="btn btn-secondary" style={{ flex: 1, minHeight: '36px', fontSize: 'var(--text-sm)' }} onClick={() => setShowCreate(false)}>Cancel</button>
            <button class="btn btn-primary" style={{ flex: 1, minHeight: '36px', fontSize: 'var(--text-sm)' }} onClick={handleCreate} disabled={!newName.trim()}>Save</button>
          </div>
        </div>
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
              <input type="text" class="form-input" value={editName} onInput={e => setEditName((e.target as HTMLInputElement).value)} />
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <ColorSwatchGrid selected={editColor} onSelect={setEditColor} />
            </div>
            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setEditingLabel(null)}>Cancel</button>
              <button class="btn btn-primary" onClick={saveEdit}>Save</button>
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

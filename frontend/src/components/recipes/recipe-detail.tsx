import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { getRecipeById, getSessionsForRecipe, formatTime, type Recipe, type CookingSession } from '../../mock-data';
import { LabelBadge } from '../shared/label-badge';
import { LabelPicker } from '../shared/label-picker';

interface RecipeDetailProps {
  recipeId: string;
}

type TabName = 'info' | 'ingredients' | 'prep' | 'steps' | 'history';

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Entered manually',
  web: 'Imported from web',
  photo: 'Imported from photo',
};

export function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const recipe = getRecipeById(recipeId);
  const [activeTab, setActiveTab] = useState<TabName>('info');
  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [rating, setRating] = useState(recipe?.rating ?? 0);
  const [isEditing, setIsEditing] = useState(false);
  const [showStartSheet, setShowStartSheet] = useState(false);
  const [recipeLabels, setRecipeLabels] = useState<string[]>(recipe?.labels ?? []);

  if (!recipe) {
    return (
      <div class="screen">
        <div class="empty-state">
          <p>Recipe not found</p>
          <button class="btn btn-primary" onClick={() => navigate('/recipes')}>Back to Recipes</button>
        </div>
      </div>
    );
  }

  const sessions = getSessionsForRecipe(recipeId);
  const lastSession = sessions.sort((a, b) => b.date.localeCompare(a.date))[0];
  const scaleFactor = servings / recipe.servings;

  const tabs: { name: TabName; label: string }[] = [
    { name: 'info', label: 'Info' },
    { name: 'ingredients', label: 'Ingredients' },
    { name: 'prep', label: 'Prep' },
    { name: 'steps', label: 'Steps' },
    { name: 'history', label: 'History' },
  ];

  return (
    <div class="screen">
      {/* Header */}
      <div class="detail-header">
        <button class="btn-icon" onClick={() => navigate('/recipes')} aria-label="Back">
          ←
        </button>
        <h1>{recipe.name}</h1>
        {isEditing ? (
          <button class="btn btn-secondary" style={{ fontSize: 'var(--text-sm)', minHeight: '36px', padding: '4px 12px' }} onClick={() => setIsEditing(false)}>
            Done
          </button>
        ) : (
          <button class="btn-icon" onClick={() => navigate(`/recipes/${recipeId}/edit`)} aria-label="Edit recipe">
            ✎
          </button>
        )}
      </div>

      {/* Horizontal Tab Bar */}
      <div class="htab-bar">
        {tabs.map(tab => (
          <button
            key={tab.name}
            class={`htab-btn ${activeTab === tab.name ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div class="htab-content">
        {activeTab === 'info' && (
          <InfoTab
            recipe={recipe}
            servings={servings}
            setServings={setServings}
            rating={rating}
            setRating={setRating}
            lastSession={lastSession}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            labels={recipeLabels}
            onToggleLabel={(name) => {
              setRecipeLabels(prev =>
                prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
              );
            }}
          />
        )}

        {activeTab === 'ingredients' && (
          <IngredientsTab recipe={recipe} scaleFactor={scaleFactor} servings={servings} />
        )}

        {activeTab === 'prep' && (
          <PrepTab recipe={recipe} />
        )}

        {activeTab === 'steps' && (
          <StepsTab recipe={recipe} />
        )}

        {activeTab === 'history' && (
          <HistoryTab sessions={sessions} />
        )}
      </div>

      {/* Start Cook FAB */}
      <button class="fab" onClick={() => setShowStartSheet(true)} aria-label="Start cook">
        🔥
      </button>

      {/* Start Cook Sheet */}
      {showStartSheet && (
        <div class="modal-overlay" onClick={() => setShowStartSheet(false)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Cook: {recipe.name}</h2>
              <button class="btn-icon" onClick={() => setShowStartSheet(false)} aria-label="Close">✕</button>
            </div>

            <button
              class="action-sheet-option"
              onClick={() => { setShowStartSheet(false); navigate(`/session/${recipeId}`); }}
            >
              <span class="action-sheet-icon">▶️</span>
              <div class="action-sheet-label">
                Start Now
                <span>Begin cook immediately</span>
              </div>
            </button>

            <button class="action-sheet-option" onClick={() => setShowStartSheet(false)}>
              <span class="action-sheet-icon">📅</span>
              <div class="action-sheet-label">
                Schedule for Later
                <span>Pick a date to cook this recipe</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Info Tab =====
function InfoTab({ recipe, servings, setServings, rating, setRating, lastSession, isEditing, onEditToggle, labels, onToggleLabel }: {
  recipe: Recipe;
  servings: number;
  setServings: (n: number) => void;
  rating: number;
  setRating: (n: number) => void;
  lastSession?: CookingSession;
  isEditing: boolean;
  onEditToggle: () => void;
  labels: string[];
  onToggleLabel: (name: string) => void;
}) {
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  return (
    <div>
      {/* Labels */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        {labels.length > 0 ? (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            {labels.map(l => <LabelBadge key={l} name={l} />)}
            <button
              class="btn-icon"
              onClick={() => setShowLabelPicker(!showLabelPicker)}
              aria-label="Edit labels"
              style={{ width: '28px', height: '28px', fontSize: 'var(--text-xs)' }}
            >
              ✎
            </button>
          </div>
        ) : (
          <button
            class="btn btn-ghost"
            style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', padding: 0 }}
            onClick={() => setShowLabelPicker(!showLabelPicker)}
          >
            + Add labels
          </button>
        )}
        {showLabelPicker && (
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <LabelPicker selected={labels} onToggle={onToggleLabel} />
          </div>
        )}
      </div>

      <div class="info-grid">
        <span class="info-label">Description</span>
        <span class="info-value">{recipe.description}</span>

        <span class="info-label">Source</span>
        <span class="info-value">{SOURCE_LABELS[recipe.source]}{recipe.sourceUrl ? ` — ${recipe.sourceUrl}` : ''}</span>

        <span class="info-label">Created</span>
        <span class="info-value">{recipe.created}</span>

        <span class="info-label">Last Made</span>
        <span class="info-value">{lastSession ? lastSession.date : 'Never'}</span>

        <span class="info-label">Rating</span>
        <span class="info-value">
          <span class="star-rating">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                class={`star-rating-btn ${n <= rating ? 'filled' : ''}`}
                onClick={() => setRating(n === rating ? 0 : n)}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </span>
        </span>

        <span class="info-label">Prep Time</span>
        <span class="info-value">{recipe.prepTime > 0 ? formatTime(recipe.prepTime) : '—'}</span>

        <span class="info-label">Servings</span>
        <span class="info-value">
          {isEditing ? (
            <span>
              <span class="servings-stepper">
                <button class="stepper-btn" onClick={() => setServings(Math.max(1, servings - 1))}>−</button>
                <span class="stepper-value">{servings}</span>
                <button class="stepper-btn" onClick={() => setServings(servings + 1)}>+</button>
              </span>
              {servings !== recipe.servings && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-sm)' }}>
                  (original: {recipe.servings})
                </span>
              )}
            </span>
          ) : (
            <span>
              {servings} servings
              {servings !== recipe.servings && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--space-sm)' }}>
                  (original: {recipe.servings})
                </span>
              )}
            </span>
          )}
        </span>
      </div>

      {!isEditing && (
        <button
          class="btn btn-ghost"
          style={{ marginTop: 'var(--space-md)', fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}
          onClick={onEditToggle}
        >
          ✎ Edit servings
        </button>
      )}
    </div>
  );
}

// ===== Ingredients Tab =====
function IngredientsTab({ recipe, scaleFactor, servings }: { recipe: Recipe; scaleFactor: number; servings: number }) {
  const [showGrocerySheet, setShowGrocerySheet] = useState(false);
  const [groceryChecked, setGroceryChecked] = useState<Record<string, boolean>>({});
  const [showToast, setShowToast] = useState(false);

  function initGroceryChecked() {
    const init: Record<string, boolean> = {};
    recipe.ingredients.forEach(ing => { init[ing.ingredient_id] = true; });
    setGroceryChecked(init);
    setShowGrocerySheet(true);
  }

  function addToGroceryList() {
    const count = Object.values(groceryChecked).filter(Boolean).length;
    setShowGrocerySheet(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  const selectedCount = Object.values(groceryChecked).filter(Boolean).length;

  return (
    <div>
      {scaleFactor !== 1 && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', marginBottom: 'var(--space-md)', fontWeight: 600 }}>
          Scaled for {servings} servings ({scaleFactor > 1 ? '×' : ''}{Math.round(scaleFactor * 100) / 100})
        </p>
      )}

      {/* Add to Grocery List button */}
      <button
        class="btn btn-secondary btn-block"
        style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }}
        onClick={initGroceryChecked}
      >
        🛒 Add to grocery list
      </button>

      {recipe.ingredients.map(ing => {
        const scaledQty = Math.round(ing.quantity * scaleFactor * 100) / 100;
        return (
          <div class="ingredient-row" key={ing.ingredient_id}>
            <span class="ingredient-qty">{scaledQty} {ing.unit}</span>
            <span class="ingredient-name">{ing.name}</span>
          </div>
        );
      })}

      {/* Grocery List Sheet */}
      {showGrocerySheet && (
        <div class="modal-overlay" onClick={() => setShowGrocerySheet(false)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>🛒 Add to Grocery List</h2>
              <button class="btn-icon" onClick={() => setShowGrocerySheet(false)} aria-label="Close">✕</button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              Select ingredients to add ({selectedCount} of {recipe.ingredients.length})
            </p>

            {recipe.ingredients.map(ing => {
              const scaledQty = Math.round(ing.quantity * scaleFactor * 100) / 100;
              return (
                <div class="shopping-item" key={ing.ingredient_id}>
                  <div class="shopping-check">
                    <input
                      type="checkbox"
                      checked={groceryChecked[ing.ingredient_id] ?? true}
                      onChange={() => setGroceryChecked(prev => ({ ...prev, [ing.ingredient_id]: !prev[ing.ingredient_id] }))}
                    />
                  </div>
                  <div class="shopping-item-body">
                    <div class="shopping-item-name">{ing.name}</div>
                    <div class="shopping-item-qty">{scaledQty} {ing.unit}</div>
                  </div>
                </div>
              );
            })}

            <button
              class="btn btn-primary btn-block"
              style={{ marginTop: 'var(--space-lg)' }}
              onClick={addToGroceryList}
              disabled={selectedCount === 0}
            >
              Add {selectedCount} item{selectedCount !== 1 ? 's' : ''} to List
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div class="toast-container">
          <div class="toast toast-success">
            ✓ {selectedCount} item{selectedCount !== 1 ? 's' : ''} added to grocery list
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Prep Tab =====
function PrepTab({ recipe }: { recipe: Recipe }) {
  if (recipe.prep.length === 0) {
    return <div class="empty-state"><p>No prep steps for this recipe</p></div>;
  }
  return (
    <ol class="step-list">
      {recipe.prep.map(step => (
        <li key={step.step} class="step-item">
          <span class="step-number">{step.step}</span>
          <span class="step-text">{step.description}</span>
        </li>
      ))}
    </ol>
  );
}

// ===== Steps Tab =====
function StepsTab({ recipe }: { recipe: Recipe }) {
  return (
    <ol class="step-list">
      {recipe.steps.map(step => (
        <li key={step.step} class="step-item">
          <span class="step-number">{step.step}</span>
          <span class="step-text">{step.description}</span>
        </li>
      ))}
    </ol>
  );
}

// ===== History Tab =====
function HistoryTab({ sessions }: { sessions: CookingSession[] }) {
  const [editingSession, setEditingSession] = useState<CookingSession | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editPrepTime, setEditPrepTime] = useState(0);
  const [editCookTime, setEditCookTime] = useState(0);
  const [editRating, setEditRating] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  if (sessions.length === 0) {
    return <div class="empty-state"><p>No cook history for this recipe</p></div>;
  }

  function openEdit(session: CookingSession) {
    setEditDate(session.date);
    setEditPrepTime(session.prepTime);
    setEditCookTime(session.cookTime);
    setEditRating(session.rating);
    setEditNotes(session.notes);
    setEditingSession(session);
  }

  function saveEdit() {
    // In real app, would save to Google Sheets
    setEditingSession(null);
  }

  return (
    <div>
      <table class="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Prep</th>
            <th>Cook</th>
            <th>Total</th>
            <th>Rating</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.date.split('-').slice(1).join('/')}</td>
              <td>{s.prepTime > 0 ? `${s.prepTime}m` : '—'}</td>
              <td>{s.cookTime > 0 ? `${s.cookTime}m` : '—'}</td>
              <td>{s.prepTime + s.cookTime > 0 ? `${s.prepTime + s.cookTime}m` : '—'}</td>
              <td>
                {s.rating > 0 ? (
                  <span class="star-rating-display">
                    {[1, 2, 3, 4, 5].map(n => (
                      <span key={n} class={`star ${n <= s.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </span>
                ) : '—'}
              </td>
              <td>
                <button class="btn-icon" onClick={() => openEdit(s)} aria-label="Edit session" style={{ width: '32px', height: '32px', fontSize: 'var(--text-sm)' }}>
                  ✎
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Session Modal */}
      {editingSession && (
        <div class="modal-overlay" onClick={() => setEditingSession(null)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Edit Cook</h2>
              <button class="btn-icon" onClick={() => setEditingSession(null)} aria-label="Close">✕</button>
            </div>

            <div class="form-group">
              <label class="form-label">Date</label>
              <input type="date" class="form-input" value={editDate} onInput={e => setEditDate((e.target as HTMLInputElement).value)} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <div class="form-group" style={{ flex: 1 }}>
                <label class="form-label">Prep (min)</label>
                <input type="number" class="form-input" inputMode="numeric" value={editPrepTime} onInput={e => setEditPrepTime(Number((e.target as HTMLInputElement).value))} />
              </div>
              <div class="form-group" style={{ flex: 1 }}>
                <label class="form-label">Cook (min)</label>
                <input type="number" class="form-input" inputMode="numeric" value={editCookTime} onInput={e => setEditCookTime(Number((e.target as HTMLInputElement).value))} />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Rating</label>
              <span class="star-rating">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    class={`star-rating-btn ${n <= editRating ? 'filled' : ''}`}
                    onClick={() => setEditRating(n === editRating ? 0 : n)}
                    aria-label={`${n} star${n !== 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea class="form-input" value={editNotes} onInput={e => setEditNotes((e.target as HTMLTextAreaElement).value)} />
            </div>

            <div class="confirm-modal-actions">
              <button class="btn btn-secondary" onClick={() => setEditingSession(null)}>Cancel</button>
              <button class="btn btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

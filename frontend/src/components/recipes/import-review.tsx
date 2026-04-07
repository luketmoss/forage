import { useState, useRef, useCallback } from 'preact/hooks';
import { useAuth } from '../../auth/auth-context';
import { ingredients as ingredientsSignal } from '../../state/store';
import { saveImportedRecipe, type ImportSaveData } from '../../state/actions';
import { findBestMatch, type MatchResult, type MatchTier } from '../../utils/fuzzy-match';
import type { ImportedRecipe, ImportedIngredient } from '../../api/types';

interface ImportReviewProps {
  recipe: ImportedRecipe;
  sourceUrl: string;
  onSave: (recipeId: string) => void;
  onBack: () => void;
  onClose: () => void;
}

type ReviewTab = 'info' | 'ingredients' | 'prep' | 'steps';

interface ReviewIngredient extends ImportedIngredient {
  match: MatchResult;
  /** Override ingredient ID (user changed the match) */
  overrideId?: string | null;
  overrideName?: string | null;
}

interface DragState {
  index: number;
  listType: 'prep' | 'cooking';
}

export function ImportReview({ recipe, sourceUrl, onSave, onBack, onClose }: ImportReviewProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<ReviewTab>('info');
  const [saving, setSaving] = useState(false);

  // Editable recipe fields
  const [name, setName] = useState(recipe.name);
  const [description, setDescription] = useState(recipe.description);
  const [servings, setServings] = useState(recipe.servings);

  // Steps (mutable arrays for drag-and-drop)
  const [prepSteps, setPrepSteps] = useState<string[]>([...recipe.prepSteps]);
  const [cookingSteps, setCookingSteps] = useState<string[]>([...recipe.cookingSteps]);

  // Ingredients with match results
  const [reviewIngredients] = useState<ReviewIngredient[]>(() => {
    const library = ingredientsSignal.value;
    return recipe.ingredients.map(ing => ({
      ...ing,
      match: findBestMatch(ing.name, library),
    }));
  });

  // Drag state
  const dragRef = useRef<DragState | null>(null);
  const [dragOver, setDragOver] = useState<{ index: number; listType: string } | null>(null);

  // Context menu for moving steps between sections
  const [contextMenu, setContextMenu] = useState<{ index: number; listType: 'prep' | 'cooking'; x: number; y: number } | null>(null);

  async function handleSave() {
    if (!token || !name.trim() || saving) return;
    setSaving(true);

    try {
      const saveData: ImportSaveData = {
        name: name.trim(),
        description: description.trim(),
        servings,
        sourceUrl,
        labels: '',
        ingredients: reviewIngredients.map(ing => {
          const effectiveId = ing.overrideId !== undefined ? ing.overrideId : ing.match.ingredientId;
          const effectiveName = ing.overrideName !== undefined ? (ing.overrideName || ing.name) : (ing.match.ingredientName || ing.name);
          return {
            ingredientId: effectiveId,
            name: effectiveName,
            quantity: ing.quantity,
            unit: ing.unit,
            matchResult: ing.match,
          };
        }),
        prepSteps,
        cookingSteps,
      };

      const created = await saveImportedRecipe(saveData, token);
      onSave(created.id);
    } catch {
      setSaving(false);
    }
  }

  // Drag handlers for step reordering
  function handleDragStart(index: number, listType: 'prep' | 'cooking') {
    dragRef.current = { index, listType };
  }

  function handleDragOver(e: DragEvent, index: number, listType: string) {
    e.preventDefault();
    setDragOver({ index, listType });
  }

  function handleDragEnd() {
    dragRef.current = null;
    setDragOver(null);
  }

  function handleDrop(targetIndex: number, targetList: 'prep' | 'cooking') {
    const drag = dragRef.current;
    if (!drag) return;

    // Only handle reorder within same list
    if (drag.listType !== targetList) {
      handleDragEnd();
      return;
    }

    const setSteps = targetList === 'prep' ? setPrepSteps : setCookingSteps;
    const steps = targetList === 'prep' ? prepSteps : cookingSteps;

    const newSteps = [...steps];
    const [moved] = newSteps.splice(drag.index, 1);
    newSteps.splice(targetIndex, 0, moved);
    setSteps(newSteps);
    handleDragEnd();
  }

  function moveStep(index: number, fromList: 'prep' | 'cooking') {
    const toList = fromList === 'prep' ? 'cooking' : 'prep';
    const fromSteps = fromList === 'prep' ? prepSteps : cookingSteps;
    const setFrom = fromList === 'prep' ? setPrepSteps : setCookingSteps;
    const setTo = toList === 'prep' ? setPrepSteps : setCookingSteps;
    const toSteps = toList === 'prep' ? prepSteps : cookingSteps;

    const step = fromSteps[index];
    setFrom(fromSteps.filter((_, i) => i !== index));
    setTo([...toSteps, step]);
    setContextMenu(null);
  }

  function handleStepContext(e: MouseEvent | TouchEvent, index: number, listType: 'prep' | 'cooking') {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenu({ index, listType, x: rect.left, y: rect.bottom });
  }

  function updateIngredientMatch(index: number, ingredientId: string | null, ingredientName: string | null) {
    reviewIngredients[index].overrideId = ingredientId;
    reviewIngredients[index].overrideName = ingredientName;
  }

  const tabs: { name: ReviewTab; label: string }[] = [
    { name: 'info', label: 'Info' },
    { name: 'ingredients', label: 'Ingredients' },
    { name: 'prep', label: 'Prep' },
    { name: 'steps', label: 'Steps' },
  ];

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content import-review-modal" onClick={e => e.stopPropagation()}>
        <div class="modal-handle" />
        <div class="modal-header">
          <button class="btn-icon" onClick={onBack} aria-label="Back">←</button>
          <h2>Review Import</h2>
          <button class="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tab Bar */}
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
        <div class="htab-content import-review-content">
          {activeTab === 'info' && (
            <InfoTab
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              servings={servings} setServings={setServings}
              sourceUrl={sourceUrl}
            />
          )}

          {activeTab === 'ingredients' && (
            <IngredientsTab
              ingredients={reviewIngredients}
              onUpdateMatch={updateIngredientMatch}
            />
          )}

          {activeTab === 'prep' && (
            <StepsTab
              steps={prepSteps}
              setSteps={setPrepSteps}
              listType="prep"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              dragOver={dragOver}
              onMoveStep={moveStep}
              onContext={handleStepContext}
            />
          )}

          {activeTab === 'steps' && (
            <StepsTab
              steps={cookingSteps}
              setSteps={setCookingSteps}
              listType="cooking"
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              dragOver={dragOver}
              onMoveStep={moveStep}
              onContext={handleStepContext}
            />
          )}
        </div>

        {/* Sticky Save Button */}
        <div class="import-review-footer">
          <button
            class="btn btn-primary btn-block"
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div class="import-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={() => setContextMenu(null)}>
            <button
              class="import-context-option"
              onClick={() => moveStep(contextMenu.index, contextMenu.listType)}
            >
              Move to {contextMenu.listType === 'prep' ? 'Cooking' : 'Prep'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Info Tab =====
function InfoTab({ name, setName, description, setDescription, servings, setServings, sourceUrl }: {
  name: string; setName: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  servings: number; setServings: (v: number) => void;
  sourceUrl: string;
}) {
  return (
    <div>
      <div class="form-group">
        <label class="form-label">Recipe Name</label>
        <input
          type="text"
          class="form-input"
          value={name}
          onInput={e => setName((e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          class="form-input"
          value={description}
          onInput={e => setDescription((e.target as HTMLTextAreaElement).value)}
          style={{ minHeight: '80px' }}
        />
      </div>
      <div class="form-group">
        <label class="form-label">Servings</label>
        <input
          type="number"
          class="form-input"
          inputMode="numeric"
          value={servings}
          onInput={e => setServings(Number((e.target as HTMLInputElement).value) || 1)}
          min={1}
        />
      </div>
      <div class="form-group">
        <label class="form-label">Source URL</label>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
          {sourceUrl}
        </p>
      </div>
    </div>
  );
}

// ===== Ingredients Tab =====
function IngredientsTab({ ingredients, onUpdateMatch }: {
  ingredients: ReviewIngredient[];
  onUpdateMatch: (index: number, id: string | null, name: string | null) => void;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const library = ingredientsSignal.value;

  function getEffectiveTier(ing: ReviewIngredient): MatchTier {
    if (ing.overrideId !== undefined) {
      return ing.overrideId ? 'auto' : 'new';
    }
    return ing.match.tier;
  }

  function getEffectiveName(ing: ReviewIngredient): string {
    if (ing.overrideName !== undefined) return ing.overrideName || ing.name;
    return ing.match.ingredientName || ing.name;
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
        Tap an ingredient to change its library match.
      </p>
      {ingredients.map((ing, i) => {
        const tier = getEffectiveTier(ing);
        const matchName = getEffectiveName(ing);
        const isExpanded = expandedIndex === i;

        return (
          <div key={i}>
            <div
              class={`import-ingredient-row import-match-${tier}`}
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
            >
              <span class="import-match-icon">
                {tier === 'auto' && <span class="match-icon-auto" title="Auto-matched">✓</span>}
                {tier === 'suggest' && <span class="match-icon-suggest" title="Suggested match">?</span>}
                {tier === 'new' && <span class="match-icon-new" title="New ingredient">+</span>}
              </span>
              <span class="ingredient-qty">{ing.quantity} {ing.unit}</span>
              <span class="ingredient-name">
                {matchName}
                {tier !== 'new' && matchName !== ing.name && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>
                    from: {ing.name}
                  </span>
                )}
              </span>
              {tier === 'new' && <span class="import-new-badge">New</span>}
            </div>

            {/* Expanded: pick a different match */}
            {isExpanded && (
              <div class="import-match-picker">
                <button
                  class={`import-match-option ${tier === 'new' ? 'active' : ''}`}
                  onClick={() => { onUpdateMatch(i, null, null); setExpandedIndex(null); }}
                >
                  + Create new: "{ing.name}"
                </button>
                {library.map(libIng => (
                  <button
                    key={libIng.id}
                    class={`import-match-option ${(ing.overrideId ?? ing.match.ingredientId) === libIng.id ? 'active' : ''}`}
                    onClick={() => { onUpdateMatch(i, libIng.id, libIng.name); setExpandedIndex(null); }}
                  >
                    {libIng.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ===== Steps Tab (shared for prep and cooking) =====
function StepsTab({ steps, setSteps, listType, onDragStart, onDragOver, onDragEnd, onDrop, dragOver, onMoveStep, onContext }: {
  steps: string[];
  setSteps: (steps: string[]) => void;
  listType: 'prep' | 'cooking';
  onDragStart: (index: number, listType: 'prep' | 'cooking') => void;
  onDragOver: (e: DragEvent, index: number, listType: string) => void;
  onDragEnd: () => void;
  onDrop: (index: number, listType: 'prep' | 'cooking') => void;
  dragOver: { index: number; listType: string } | null;
  onMoveStep: (index: number, fromList: 'prep' | 'cooking') => void;
  onContext: (e: MouseEvent | TouchEvent, index: number, listType: 'prep' | 'cooking') => void;
}) {
  const moveLabel = listType === 'prep' ? 'Move to Cooking' : 'Move to Prep';

  function updateStep(index: number, value: string) {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function addStep() {
    setSteps([...steps, '']);
  }

  if (steps.length === 0) {
    return (
      <div class="empty-state">
        <p>No {listType} steps extracted</p>
        <button class="btn btn-secondary" onClick={addStep}>+ Add Step</button>
      </div>
    );
  }

  return (
    <div>
      <ol class="step-list import-step-list">
        {steps.map((step, i) => (
          <li
            key={i}
            class={`step-item import-step-item ${dragOver?.index === i && dragOver.listType === listType ? 'drag-over' : ''}`}
            draggable
            onDragStart={() => onDragStart(i, listType)}
            onDragOver={(e: DragEvent) => onDragOver(e, i, listType)}
            onDragEnd={onDragEnd}
            onDrop={() => onDrop(i, listType)}
            onContextMenu={(e: MouseEvent) => onContext(e, i, listType)}
          >
            <span class="import-drag-handle" aria-label="Drag to reorder">⋮⋮</span>
            <span class="step-number">{i + 1}</span>
            <textarea
              class="form-input import-step-textarea"
              value={step}
              onInput={e => updateStep(i, (e.target as HTMLTextAreaElement).value)}
              rows={2}
            />
            <div class="import-step-actions">
              <button
                class="btn-icon import-step-move"
                onClick={() => onMoveStep(i, listType)}
                title={moveLabel}
                aria-label={moveLabel}
              >
                ↔
              </button>
              <button
                class="btn-icon import-step-delete"
                onClick={() => removeStep(i)}
                aria-label="Remove step"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button class="btn btn-secondary btn-block" style={{ marginTop: 'var(--space-md)' }} onClick={addStep}>
        + Add Step
      </button>
    </div>
  );
}

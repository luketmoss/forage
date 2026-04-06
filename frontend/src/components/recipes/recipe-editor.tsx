import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { getRecipeById, mockIngredients, type RecipeIngredient, type PrepStep, type CookingStep } from '../../mock-data';
import { LabelPicker } from '../shared/label-picker';

interface RecipeEditorProps {
  recipeId?: string;
}

export function RecipeEditor({ recipeId }: RecipeEditorProps) {
  const existing = recipeId ? getRecipeById(recipeId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [servings, setServings] = useState(existing?.servings ?? 4);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(existing?.ingredients ?? []);
  const [prepSteps, setPrepSteps] = useState<PrepStep[]>(existing?.prep ?? []);
  const [cookSteps, setCookSteps] = useState<CookingStep[]>(existing?.steps ?? []);
  const [recipeLabels, setRecipeLabels] = useState<string[]>(existing?.labels ?? []);
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [ingSearch, setIngSearch] = useState('');

  const isEdit = !!existing;
  const title = isEdit ? `Edit: ${existing!.name}` : 'New Recipe';

  function addIngredient(ingredientId: string, ingredientName: string) {
    setIngredients([...ingredients, {
      ingredient_id: ingredientId,
      name: ingredientName,
      quantity: 1,
      unit: 'whole',
      order: ingredients.length + 1,
    }]);
    setShowIngredientPicker(false);
    setIngSearch('');
  }

  function removeIngredient(idx: number) {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  }

  function updateIngredientQty(idx: number, value: string) {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], quantity: Number(value) };
    setIngredients(updated);
  }

  function updateIngredientUnit(idx: number, value: string) {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], unit: value };
    setIngredients(updated);
  }

  function addPrepStep() {
    setPrepSteps([...prepSteps, { step: prepSteps.length + 1, description: '' }]);
  }

  function addCookStep() {
    setCookSteps([...cookSteps, { step: cookSteps.length + 1, description: '' }]);
  }

  const filteredIngredients = ingSearch.trim()
    ? mockIngredients.filter(i =>
        i.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
        !ingredients.some(added => added.ingredient_id === i.id)
      )
    : mockIngredients.filter(i => !ingredients.some(added => added.ingredient_id === i.id));

  const UNITS = ['whole', 'cups', 'tbsp', 'tsp', 'oz', 'lbs', 'cloves', 'slices', 'pieces'];

  return (
    <div class="screen">
      <div class="detail-header">
        <button class="btn-icon" onClick={() => navigate(isEdit ? `/recipes/${recipeId}` : '/recipes')} aria-label="Back">
          ←
        </button>
        <h1>{title}</h1>
      </div>

      {/* Basic Info */}
      <div class="form-group">
        <label class="form-label">Recipe Name</label>
        <input
          type="text"
          class="form-input"
          placeholder="e.g., Chicken Stir Fry"
          value={name}
          onInput={e => setName((e.target as HTMLInputElement).value)}
        />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          class="form-input"
          placeholder="Brief description of the dish..."
          value={description}
          onInput={e => setDescription((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      <div class="form-group">
        <label class="form-label">Servings</label>
        <input
          type="number"
          class="form-input"
          inputMode="numeric"
          value={servings}
          onInput={e => setServings(Number((e.target as HTMLInputElement).value))}
          style={{ maxWidth: '100px' }}
        />
      </div>

      {/* Labels */}
      <LabelPicker
        selected={recipeLabels}
        onToggle={(name) => {
          setRecipeLabels(prev =>
            prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
          );
        }}
      />

      {/* Ingredients Section */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Ingredients</h2>
          <button class="btn btn-secondary" onClick={() => setShowIngredientPicker(true)}>+ Add</button>
        </div>

        {ingredients.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No ingredients yet — tap Add to start</p>
        ) : (
          ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <input
                type="number"
                class="form-input"
                inputMode="decimal"
                value={ing.quantity}
                onInput={e => updateIngredientQty(idx, (e.target as HTMLInputElement).value)}
                style={{ width: '70px', textAlign: 'center' }}
              />
              <select
                class="form-input"
                value={ing.unit}
                onChange={e => updateIngredientUnit(idx, (e.target as HTMLSelectElement).value)}
                style={{ width: '90px' }}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{ing.name}</span>
              <button class="btn-icon" onClick={() => removeIngredient(idx)} aria-label={`Remove ${ing.name}`} style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Prep Steps */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Prep Steps</h2>
          <button class="btn btn-secondary" onClick={addPrepStep}>+ Add</button>
        </div>

        {prepSteps.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No prep steps yet</p>
        ) : (
          prepSteps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <span class="step-number">{idx + 1}</span>
              <textarea
                class="form-input"
                style={{ flex: 1, minHeight: '48px' }}
                placeholder="Describe this prep step..."
                value={step.description}
                onInput={e => {
                  const updated = [...prepSteps];
                  updated[idx] = { ...updated[idx], description: (e.target as HTMLTextAreaElement).value };
                  setPrepSteps(updated);
                }}
              />
              <button class="btn-icon" onClick={() => setPrepSteps(prepSteps.filter((_, i) => i !== idx))} aria-label="Remove step" style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Cooking Steps */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Cooking Steps</h2>
          <button class="btn btn-secondary" onClick={addCookStep}>+ Add</button>
        </div>

        {cookSteps.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No cooking steps yet</p>
        ) : (
          cookSteps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <span class="step-number">{idx + 1}</span>
              <textarea
                class="form-input"
                style={{ flex: 1, minHeight: '48px' }}
                placeholder="Describe this cooking step..."
                value={step.description}
                onInput={e => {
                  const updated = [...cookSteps];
                  updated[idx] = { ...updated[idx], description: (e.target as HTMLTextAreaElement).value };
                  setCookSteps(updated);
                }}
              />
              <button class="btn-icon" onClick={() => setCookSteps(cookSteps.filter((_, i) => i !== idx))} aria-label="Remove step" style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Save — always lands on the recipe detail page */}
      <button class="btn btn-primary btn-block" onClick={() => {
        // In real app: save to Sheets, get new recipe ID back
        // For mockup: edit goes back to detail; new simulates landing on the new recipe
        if (isEdit) {
          navigate(`/recipes/${recipeId}`);
        } else {
          // Simulate: navigate to first recipe as placeholder for newly created recipe
          navigate('/recipes/rec-1');
        }
      }}>
        {isEdit ? 'Save Changes' : 'Save Recipe'}
      </button>

      {/* Ingredient Picker Modal */}
      {showIngredientPicker && (
        <div class="modal-overlay" onClick={() => setShowIngredientPicker(false)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />
            <div class="modal-header">
              <h2>Add Ingredient</h2>
              <button class="btn-icon" onClick={() => setShowIngredientPicker(false)} aria-label="Close">✕</button>
            </div>

            <div class="search-bar">
              <span class="search-bar-icon">🔍</span>
              <input
                type="text"
                class="form-input"
                placeholder="Search ingredients..."
                value={ingSearch}
                onInput={e => setIngSearch((e.target as HTMLInputElement).value)}
                autoFocus
              />
            </div>

            {filteredIngredients.slice(0, 10).map(ing => (
              <button
                key={ing.id}
                class="action-sheet-option"
                onClick={() => addIngredient(ing.id, ing.name)}
              >
                <span class="action-sheet-icon">🥬</span>
                <div class="action-sheet-label">
                  {ing.name}
                  <span>{ing.description}</span>
                </div>
              </button>
            ))}

            {ingSearch.trim() && filteredIngredients.length === 0 && (
              <button
                class="action-sheet-option"
                onClick={() => addIngredient(`new-${Date.now()}`, ingSearch.trim())}
              >
                <span class="action-sheet-icon">➕</span>
                <div class="action-sheet-label">
                  Create "{ingSearch.trim()}"
                  <span>Add as new ingredient</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

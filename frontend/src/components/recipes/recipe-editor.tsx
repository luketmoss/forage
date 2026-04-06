import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { useAuth } from '../../auth/auth-context';
import { getHydratedRecipe, ingredients as ingredientsSignal } from '../../state/store';
import { addRecipe, editRecipe } from '../../state/actions';
import type { RecipeIngredientWithRow, RecipeStepWithRow } from '../../api/types';
import { LabelPicker } from '../shared/label-picker';

interface RecipeEditorProps {
  recipeId?: string;
}

interface EditableIngredient {
  ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
  order: number;
}

interface EditableStep {
  step: number;
  description: string;
}

export function RecipeEditor({ recipeId }: RecipeEditorProps) {
  const { token } = useAuth();
  const existing = recipeId ? getHydratedRecipe(recipeId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [servings, setServings] = useState(existing?.servings ?? 4);
  const [recipeLabels, setRecipeLabels] = useState<string[]>(existing?.parsedLabels ?? []);
  const [editorIngredients, setEditorIngredients] = useState<EditableIngredient[]>(
    existing?.recipeIngredients.map(ri => ({
      ingredient_id: ri.ingredient_id,
      name: ri.ingredientName,
      quantity: ri.quantity,
      unit: ri.unit,
      order: ri.order,
    })) ?? []
  );
  const [prepSteps, setPrepSteps] = useState<EditableStep[]>(
    existing?.prepSteps.map(s => ({ step: s.stepNumber, description: s.description })) ?? []
  );
  const [cookSteps, setCookSteps] = useState<EditableStep[]>(
    existing?.cookingSteps.map(s => ({ step: s.stepNumber, description: s.description })) ?? []
  );
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [ingSearch, setIngSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!existing;
  const title = isEdit ? `Edit: ${existing!.name}` : 'New Recipe';

  function addIngredient(ingredientId: string, ingredientName: string) {
    setEditorIngredients([...editorIngredients, {
      ingredient_id: ingredientId,
      name: ingredientName,
      quantity: 1,
      unit: 'whole',
      order: editorIngredients.length + 1,
    }]);
    setShowIngredientPicker(false);
    setIngSearch('');
  }

  function removeIngredient(idx: number) {
    setEditorIngredients(editorIngredients.filter((_, i) => i !== idx));
  }

  function updateIngredientQty(idx: number, value: string) {
    const updated = [...editorIngredients];
    updated[idx] = { ...updated[idx], quantity: Number(value) };
    setEditorIngredients(updated);
  }

  function updateIngredientUnit(idx: number, value: string) {
    const updated = [...editorIngredients];
    updated[idx] = { ...updated[idx], unit: value };
    setEditorIngredients(updated);
  }

  function addPrepStep() {
    setPrepSteps([...prepSteps, { step: prepSteps.length + 1, description: '' }]);
  }

  function addCookStep() {
    setCookSteps([...cookSteps, { step: cookSteps.length + 1, description: '' }]);
  }

  async function handleSave() {
    if (!token || !name.trim()) return;
    setSaving(true);
    try {
      if (isEdit && existing) {
        await editRecipe({
          ...existing,
          name: name.trim(),
          description: description.trim(),
          servings,
          labels: recipeLabels.join(','),
        }, token);
        navigate(`/recipes/${recipeId}`);
      } else {
        const created = await addRecipe({
          name: name.trim(),
          description: description.trim(),
          source: 'manual',
          sourceUrl: '',
          servings,
          labels: recipeLabels.join(','),
          notes: '',
        }, token);
        navigate(`/recipes/${created.id}`);
      }
    } catch { /* toast shown by action */ }
    setSaving(false);
  }

  const allIngredients = ingredientsSignal.value;
  const filteredIngredients = ingSearch.trim()
    ? allIngredients.filter(i =>
        i.name.toLowerCase().includes(ingSearch.toLowerCase()) &&
        !editorIngredients.some(added => added.ingredient_id === i.id)
      )
    : allIngredients.filter(i => !editorIngredients.some(added => added.ingredient_id === i.id));

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
        <input type="text" class="form-input" placeholder="e.g., Chicken Stir Fry" value={name} onInput={e => setName((e.target as HTMLInputElement).value)} />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-input" placeholder="Brief description of the dish..." value={description} onInput={e => setDescription((e.target as HTMLTextAreaElement).value)} />
      </div>

      <div class="form-group">
        <label class="form-label">Servings</label>
        <input type="number" class="form-input" inputMode="numeric" value={servings} onInput={e => setServings(Number((e.target as HTMLInputElement).value))} style={{ maxWidth: '100px' }} />
      </div>

      {/* Labels */}
      <LabelPicker
        selected={recipeLabels}
        onToggle={(labelName) => {
          setRecipeLabels(prev =>
            prev.includes(labelName) ? prev.filter(l => l !== labelName) : [...prev, labelName]
          );
        }}
      />

      {/* Ingredients Section */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Ingredients</h2>
          <button class="btn btn-secondary" onClick={() => setShowIngredientPicker(true)}>+ Add</button>
        </div>

        {editorIngredients.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No ingredients yet — tap Add to start</p>
        ) : (
          editorIngredients.map((ing, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
              <input type="number" class="form-input" inputMode="decimal" value={ing.quantity} onInput={e => updateIngredientQty(idx, (e.target as HTMLInputElement).value)} style={{ width: '70px', textAlign: 'center' }} />
              <select class="form-input" value={ing.unit} onChange={e => updateIngredientUnit(idx, (e.target as HTMLSelectElement).value)} style={{ width: '90px' }}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{ing.name}</span>
              <button class="btn-icon" onClick={() => removeIngredient(idx)} aria-label={`Remove ${ing.name}`} style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>✕</button>
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
              <textarea class="form-input" style={{ flex: 1, minHeight: '48px' }} placeholder="Describe this prep step..." value={step.description} onInput={e => { const updated = [...prepSteps]; updated[idx] = { ...updated[idx], description: (e.target as HTMLTextAreaElement).value }; setPrepSteps(updated); }} />
              <button class="btn-icon" onClick={() => setPrepSteps(prepSteps.filter((_, i) => i !== idx))} aria-label="Remove step" style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>✕</button>
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
              <textarea class="form-input" style={{ flex: 1, minHeight: '48px' }} placeholder="Describe this cooking step..." value={step.description} onInput={e => { const updated = [...cookSteps]; updated[idx] = { ...updated[idx], description: (e.target as HTMLTextAreaElement).value }; setCookSteps(updated); }} />
              <button class="btn-icon" onClick={() => setCookSteps(cookSteps.filter((_, i) => i !== idx))} aria-label="Remove step" style={{ color: 'var(--color-danger)', width: '36px', height: '36px' }}>✕</button>
            </div>
          ))
        )}
      </div>

      {/* Save */}
      <button class="btn btn-primary btn-block" onClick={handleSave} disabled={!name.trim() || saving}>
        {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Recipe'}
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
              <input type="text" class="form-input" placeholder="Search ingredients..." value={ingSearch} onInput={e => setIngSearch((e.target as HTMLInputElement).value)} autoFocus />
            </div>
            {filteredIngredients.slice(0, 10).map(ing => (
              <button key={ing.id} class="action-sheet-option" onClick={() => addIngredient(ing.id, ing.name)}>
                <span class="action-sheet-icon">🥬</span>
                <div class="action-sheet-label">
                  {ing.name}
                  <span>{ing.description}</span>
                </div>
              </button>
            ))}
            {ingSearch.trim() && filteredIngredients.length === 0 && (
              <button class="action-sheet-option" onClick={() => addIngredient(`new-${Date.now()}`, ingSearch.trim())}>
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

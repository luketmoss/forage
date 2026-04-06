import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { hydratedRecipes, getLastSessionForRecipe } from '../../state/store';
import { LabelBadge } from '../shared/label-badge';
import { AddRecipeSheet } from '../shared/add-recipe-sheet';
import { formatTime } from '../../shared/utils';

const SOURCE_ICONS: Record<string, string> = {
  manual: '✏️',
  web: '🌐',
  photo: '📷',
};

export function RecipesScreen() {
  const [search, setSearch] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  const allRecipes = hydratedRecipes.value;

  const filtered = search.trim()
    ? allRecipes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description.toLowerCase().includes(search.toLowerCase())
      )
    : allRecipes;

  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div class="screen">
      <header class="screen-header">
        <h1>Recipes</h1>
      </header>

      {/* Search Bar */}
      <div class="search-bar">
        <span class="search-bar-icon">🔍</span>
        <input
          type="text"
          class="form-input"
          placeholder="Search recipes..."
          value={search}
          onInput={e => setSearch((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Recipe List */}
      {sorted.length === 0 ? (
        <div class="empty-state">
          <p>{search ? 'No recipes found' : 'No recipes yet'}</p>
          <p>Tap + to add your first recipe</p>
        </div>
      ) : (
        <div>
          {sorted.map(recipe => {
            const lastSession = getLastSessionForRecipe(recipe.id);
            return (
              <div
                key={recipe.id}
                class="recipe-card card-clickable"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                <div class="recipe-card-body">
                  <span class="recipe-card-name">{recipe.name}</span>
                  <span class="recipe-card-desc">{recipe.description}</span>
                  <div class="recipe-card-footer">
                    <span class="recipe-card-source">
                      {SOURCE_ICONS[recipe.source]} {recipe.source}
                    </span>
                    {recipe.rating > 0 && (
                      <span class="star-rating-display">
                        {[1, 2, 3, 4, 5].map(n => (
                          <span key={n} class={`star ${n <= recipe.rating ? 'filled' : ''}`}>★</span>
                        ))}
                      </span>
                    )}
                    {lastSession && (
                      <span>Last: {lastSession.date.split('-').slice(1).join('/')}</span>
                    )}
                    <span>{recipe.servings} servings</span>
                  </div>
                  {recipe.parsedLabels.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
                      {recipe.parsedLabels.map(label => (
                        <LabelBadge key={label} name={label} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB — New Recipe */}
      <button class="fab" onClick={() => setShowAddRecipe(true)} aria-label="Add recipe">
        +
      </button>

      {/* Add Recipe Sheet (shared component) */}
      {showAddRecipe && <AddRecipeSheet onClose={() => setShowAddRecipe(false)} />}
    </div>
  );
}

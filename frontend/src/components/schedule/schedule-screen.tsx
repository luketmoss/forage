import { useState } from 'preact/hooks';
import { navigate } from '../../router/router';
import { useAuth } from '../../auth/auth-context';
import {
  labels as labelsSignal,
  recipes as recipesSignal,
  sessions as sessionsSignal,
  recipeIngredients as riSignal,
} from '../../state/store';
import type { SessionWithRow } from '../../api/types';
import { getLabelColor } from '../../api/label-colors';
import { getWeekDays, getWeekStats, groupSessionsByWeek, toLocalDateStr, formatTime } from '../../shared/utils';
import { LabelBadge } from '../shared/label-badge';
import { AddRecipeSheet } from '../shared/add-recipe-sheet';
import { ShoppingSheet } from './shopping-sheet';

function pluralMeal(n: number): string {
  return `${n} ${n === 1 ? 'meal' : 'meals'}`;
}

export function ScheduleScreen() {
  const [showNewSheet, setShowNewSheet] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [newSheetStep, setNewSheetStep] = useState<'timing' | 'pick-recipe'>('timing');
  const [newCookTiming, setNewCookTiming] = useState<'now' | 'later'>('now');
  const [pendingSession, setPendingSession] = useState<SessionWithRow | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerLabelFilter, setPickerLabelFilter] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  const todayStr = toLocalDateStr(new Date());
  const activeSessions = sessionsSignal.value.filter(s => s.status === 'active');
  const completed = sessionsSignal.value.filter(s => s.status === 'completed');
  const scheduled = sessionsSignal.value.filter(s => s.status === 'scheduled');
  const weekDays = getWeekDays(sessionsSignal.value, todayStr);
  const stats = getWeekStats(sessionsSignal.value, todayStr);

  // Filter completed sessions by labels
  const filteredCompleted = filterLabels.length > 0
    ? completed.filter(s => {
        const recipe = recipesSignal.value.find(r => r.id === s.recipe_id);
        const rl = recipe?.labels.split(',').filter(Boolean) ?? [];
        return rl.length > 0 && filterLabels.some(fl => rl.includes(fl));
      })
    : completed;

  const completedSorted = [...filteredCompleted].sort((a, b) => b.date.localeCompare(a.date));
  const groups = groupSessionsByWeek(completedSorted, todayStr);

  // Labels used across all session recipes (for filter chips)
  const availableLabels = Array.from(new Set(completed.flatMap(s => {
    const recipe = recipesSignal.value.find(r => r.id === s.recipe_id);
    return recipe ? recipe.labels.split(',').filter(Boolean) : [];
  }))).sort();

  function toggleFilterLabel(name: string) {
    setFilterLabels(prev =>
      prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
    );
  }

  function openNewSheet() {
    setNewSheetStep('timing');
    setPickerSearch('');
    setPickerLabelFilter([]);
    setScheduleDate('');
    setShowNewSheet(true);
  }

  function selectTiming(timing: 'now' | 'later') {
    setNewCookTiming(timing);
    setPickerSearch('');
    setPickerLabelFilter([]);
    setScheduleDate('');
    setNewSheetStep('pick-recipe');
  }

  function pickRecipe(recipeId: string) {
    if (newCookTiming === 'now') {
      setShowNewSheet(false);
      navigate(`/session/${recipeId}`);
    } else {
      // Schedule: date is already on screen, just need to confirm
      // In real app: create scheduled session with scheduleDate + recipeId
      setShowNewSheet(false);
    }
  }

  // Filtered recipe list for the picker
  const pickerRecipes = recipesSignal.value.filter(r => {
    const matchesSearch = !pickerSearch.trim() ||
      r.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesLabels = pickerLabelFilter.length === 0 ||
      pickerLabelFilter.some(fl => r.labels.split(',').filter(Boolean).includes(fl));
    return matchesSearch && matchesLabels;
  }).sort((a, b) => a.name.localeCompare(b.name));

  // All unique labels across recipes (for picker filter)
  const allRecipeLabels = Array.from(new Set(recipesSignal.value.flatMap(r => r.labels.split(',').filter(Boolean)))).sort();

  return (
    <div class="screen">
      <header class="screen-header">
        <div class="screen-header-row">
          <h1>Schedule</h1>
          <div class="screen-header-actions">
            <button
              class="btn-icon"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
            >
              {showFilters ? '✕' : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M1 2h16l-6 7.5V15l-4 2v-7.5L1 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
              )}
            </button>
            <button class="btn-icon" onClick={() => setShowShopping(true)} aria-label="Shopping trip planner">
              🛒
            </button>
            <button class="btn-icon" onClick={() => navigate('/settings')} aria-label="Settings">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Week Calendar Strip */}
      <div class="week-streak-bar">
        <div class="week-streak-dots" aria-hidden="true">
          {weekDays.map(d => (
            <div
              key={d.date}
              class={`streak-dot${d.hasCompleted ? ' filled-completed' : d.hasScheduled ? ' filled-scheduled' : ''}${d.isToday ? ' today' : ''}`}
            />
          ))}
        </div>
        <div class="week-streak-labels" aria-hidden="true">
          {weekDays.map(d => (
            <span key={d.date} class={`streak-label${d.isToday ? ' today' : ''}`}>{d.label}</span>
          ))}
        </div>
        <div class="stats-bar">
          <div class="stats-bar-cell">
            <span class="stats-bar-label">This week</span>
            <span class="stats-bar-value">{pluralMeal(stats.thisWeekCount)} · {stats.thisWeekMinutes} min</span>
          </div>
          <div class="stats-bar-cell stats-bar-cell--center">
            <span class="stats-bar-label">Last week</span>
            <span class="stats-bar-value">{pluralMeal(stats.lastWeekCount)} · {stats.lastWeekMinutes} min</span>
          </div>
          <div class="stats-bar-cell stats-bar-cell--right">
            <span class="stats-bar-label">This month</span>
            <span class="stats-bar-value">{pluralMeal(stats.thisMonthCount)} · {stats.thisMonthMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div class="filter-bar">
          <div class="filter-row">
            {availableLabels.map((name: string) => {
              const label = labelsSignal.value.find(l => l.name === name);
              const color = getLabelColor(label?.colorKey ?? 'gray');
              return (
                <button
                  key={name}
                  class={`filter-chip ${filterLabels.includes(name) ? 'active' : ''}`}
                  style={{
                    '--label-bg': color.bg,
                    '--label-text': color.text,
                    '--label-bg-dark': color.bgDark,
                    '--label-text-dark': color.textDark,
                  } as Record<string, string>}
                  onClick={() => toggleFilterLabel(name)}
                >
                  {name}
                </button>
              );
            })}
          </div>
          {filterLabels.length > 0 && (
            <button class="filter-clear" onClick={() => setFilterLabels([])}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* In Progress */}
      {activeSessions.length > 0 && (
        <div class="planned-section">
          <div class="date-group-header first">In Progress</div>
          {activeSessions.map(session => (
            <div
              key={session.id}
              class="session-card session-card-active"
              onClick={() => navigate(`/session/${session.recipe_id}`)}
            >
              <div class="session-card-center">
                <span class="session-card-name">{session.recipeName}</span>
                <span class="session-card-meta">Tap to resume</span>
              </div>
              <span class="status-badge badge-active">Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Sessions */}
      {scheduled.length > 0 && (
        <div class="planned-section">
          <div class={`date-group-header${activeSessions.length === 0 ? ' first' : ''}`}>Scheduled</div>
          {[...scheduled].sort((a, b) => a.date.localeCompare(b.date)).map(session => (
            <div
              key={session.id}
              class="session-card session-card-scheduled"
              onClick={() => setPendingSession(session)}
            >
              <div class="session-card-center">
                <span class="session-card-name">{session.recipeName}</span>
                <span class="session-card-meta">
                  {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span class="status-badge badge-scheduled">Scheduled</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed Session History — Weekly groupings */}
      <div class="screen-body">
        {completedSorted.length === 0 ? (
          <div class="empty-state">
            <p>{filterLabels.length > 0 ? 'No cooks match filters' : 'No meals cooked yet'}</p>
            <p>{filterLabels.length > 0 ? 'Try clearing filters' : 'Tap + to start your first cook'}</p>
          </div>
        ) : (
          <div>
            {groups.map((group, idx) => (
              <div key={group.label}>
                <div class={`date-group-header${idx === 0 && activeSessions.length === 0 && scheduled.length === 0 ? ' first' : ''}`}>
                  {group.label}
                </div>
                {group.sessions.map(session => {
                  const totalTime = session.prepTime + session.cookTime;
                  const recipe = recipesSignal.value.find(r => r.id === session.recipe_id);
                  return (
                    <div
                      key={session.id}
                      class="session-card"
                      onClick={() => navigate(`/recipes/${session.recipe_id}`)}
                    >
                      <div class="session-card-left">
                        <span class="session-card-date">{session.date.split('-').slice(1).join('/')}</span>
                      </div>
                      <div class="session-card-center">
                        <span class="session-card-name">{session.recipeName}</span>
                        <span class="session-card-meta">
                          {totalTime > 0 ? formatTime(totalTime) : ''}
                          {totalTime > 0 && session.rating > 0 ? ' · ' : ''}
                          {session.rating > 0 && (
                            <span class="star-rating-display">
                              {[1, 2, 3, 4, 5].map(n => (
                                <span key={n} class={`star ${n <= session.rating ? 'filled' : ''}`}>★</span>
                              ))}
                            </span>
                          )}
                        </span>
                        {recipe && recipe.labels && (
                          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '3px' }}>
                            {recipe.labels.split(',').filter(Boolean).slice(0, 3).map(l => <LabelBadge key={l} name={l} />)}
                          </div>
                        )}
                      </div>
                      <span class="status-badge badge-completed">Done</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB — New Cook */}
      <button class="fab" onClick={openNewSheet} aria-label="New cook">
        +
      </button>

      {/* ===== New Cook Flow ===== */}
      {showNewSheet && (
        <div class="modal-overlay" onClick={() => setShowNewSheet(false)}>
          <div class="modal-content" onClick={e => e.stopPropagation()}>
            <div class="modal-handle" />

            {/* Step 1: When? */}
            {newSheetStep === 'timing' && (
              <div>
                <div class="modal-header">
                  <h2>New Cook</h2>
                  <button class="btn-icon" onClick={() => setShowNewSheet(false)} aria-label="Close">✕</button>
                </div>
                <button class="action-sheet-option" onClick={() => selectTiming('now')}>
                  <span class="action-sheet-icon">🔥</span>
                  <div class="action-sheet-label">
                    Cook Now
                    <span>Start a cook right away</span>
                  </div>
                </button>
                <button class="action-sheet-option" onClick={() => selectTiming('later')}>
                  <span class="action-sheet-icon">📅</span>
                  <div class="action-sheet-label">
                    Schedule for Later
                    <span>Plan a cook for another day</span>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Pick Recipe (with search, label filter, and date for schedule) */}
            {newSheetStep === 'pick-recipe' && (
              <div>
                <div class="modal-header">
                  <button class="btn-icon" onClick={() => setNewSheetStep('timing')} aria-label="Back" style={{ fontSize: 'var(--text-base)' }}>←</button>
                  <h2 style={{ flex: 1 }}>{newCookTiming === 'now' ? 'Cook Now' : 'Schedule Cook'}</h2>
                  <button class="btn-icon" onClick={() => setShowNewSheet(false)} aria-label="Close">✕</button>
                </div>

                {/* Date picker for Schedule (same screen as recipe list) */}
                {newCookTiming === 'later' && (
                  <div class="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                    <label class="form-label">Schedule date</label>
                    <input
                      type="date"
                      class="form-input"
                      value={scheduleDate}
                      onInput={e => setScheduleDate((e.target as HTMLInputElement).value)}
                    />
                  </div>
                )}

                {/* Search + Add new recipe */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <div class="search-bar" style={{ flex: 1, marginBottom: 0 }}>
                    <span class="search-bar-icon">🔍</span>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="Search recipes..."
                      value={pickerSearch}
                      onInput={e => setPickerSearch((e.target as HTMLInputElement).value)}
                    />
                  </div>
                  <button
                    class="btn-icon"
                    onClick={() => { setShowNewSheet(false); setShowAddRecipe(true); }}
                    aria-label="Add new recipe"
                    title="Add new recipe"
                    style={{ flexShrink: 0, fontSize: '1.25rem', color: 'var(--color-primary)' }}
                  >
                    +
                  </button>
                </div>

                {/* Label filter chips */}
                {allRecipeLabels.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
                    {allRecipeLabels.map(name => {
                      const label = labelsSignal.value.find(l => l.name === name);
                      const color = getLabelColor(label?.colorKey ?? 'gray');
                      return (
                        <button
                          key={name}
                          class={`filter-chip ${pickerLabelFilter.includes(name) ? 'active' : ''}`}
                          style={{
                            '--label-bg': color.bg, '--label-text': color.text,
                            '--label-bg-dark': color.bgDark, '--label-text-dark': color.textDark,
                          } as Record<string, string>}
                          onClick={() => setPickerLabelFilter(prev =>
                            prev.includes(name) ? prev.filter(l => l !== name) : [...prev, name]
                          )}
                        >
                          {name}
                        </button>
                      );
                    })}
                    {pickerLabelFilter.length > 0 && (
                      <button class="filter-clear" style={{ minHeight: 'auto', fontSize: 'var(--text-xs)', padding: '2px 4px' }} onClick={() => setPickerLabelFilter([])}>
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Recipe list */}
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {pickerRecipes.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                      {pickerSearch || pickerLabelFilter.length > 0 ? 'No recipes match' : 'No recipes yet'}
                    </p>
                  ) : (
                    pickerRecipes.map(recipe => (
                      <button
                        key={recipe.id}
                        class="recipe-pick-item"
                        onClick={() => {
                          if (newCookTiming === 'later' && !scheduleDate) return; // date required for schedule
                          pickRecipe(recipe.id);
                        }}
                        disabled={newCookTiming === 'later' && !scheduleDate}
                        style={newCookTiming === 'later' && !scheduleDate ? { opacity: 0.5 } : undefined}
                      >
                        <div style={{ flex: 1 }}>
                          <div class="recipe-pick-name">{recipe.name}</div>
                          <div class="recipe-pick-meta">
                            {recipe.servings} servings · {recipe.prepTime > 0 ? `${recipe.prepTime}m prep` : 'No prep'}
                          </div>
                          {recipe.labels && (
                            <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '3px' }}>
                              {recipe.labels.split(',').filter(Boolean).slice(0, 3).map(l => <LabelBadge key={l} name={l} />)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {newCookTiming === 'later' && !scheduleDate && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                    Pick a date above first
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Recipe Sheet (shared) — fromCookFlow hint when opened from new cook flow */}
      {showAddRecipe && <AddRecipeSheet onClose={() => setShowAddRecipe(false)} fromCookFlow={true} />}

      {/* Pending Session Detail Sheet */}
      {pendingSession && (
        <PendingSessionSheet session={pendingSession} onClose={() => setPendingSession(null)} />
      )}

      {/* Shopping Trip Planner Sheet */}
      {showShopping && (
        <ShoppingSheet onClose={() => setShowShopping(false)} />
      )}
    </div>
  );
}

// ===== Pending Session Detail Sheet =====
function PendingSessionSheet({ session, onClose }: { session: SessionWithRow; onClose: () => void }) {
  const [editDate, setEditDate] = useState(session.date);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={e => e.stopPropagation()}>
        <div class="modal-handle" />
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h2
            style={{ cursor: 'pointer', color: 'var(--color-primary)' }}
            onClick={() => { onClose(); navigate(`/recipes/${session.recipe_id}`); }}
          >
            {session.recipeName}
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Tap name to view recipe</p>
        </div>
        <div class="card" style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <span style={{ fontSize: '1.5rem' }}>📅</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block' }}>Scheduled for</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{formattedDate}</span>
          </div>
        </div>
        {showDatePicker ? (
          <div class="form-group">
            <label class="form-label">New date</label>
            <input type="date" class="form-input" value={editDate} onInput={e => setEditDate((e.target as HTMLInputElement).value)} />
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowDatePicker(false)}>Cancel</button>
              <button class="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowDatePicker(false)}>Save Date</button>
            </div>
          </div>
        ) : (
          <button class="btn btn-secondary btn-block" style={{ marginBottom: 'var(--space-md)' }} onClick={() => setShowDatePicker(true)}>
            📅 Change Date
          </button>
        )}
        <button class="btn btn-primary btn-block" style={{ marginBottom: 'var(--space-sm)' }} onClick={() => { onClose(); navigate(`/session/${session.recipe_id}`); }}>
          🔥 Start Now
        </button>
        <button class="btn btn-secondary btn-block" style={{ marginBottom: 'var(--space-sm)' }} onClick={() => { onClose(); navigate(`/recipes/${session.recipe_id}/edit`); }}>
          ✎ Edit Recipe
        </button>
        <button class="btn btn-ghost btn-block" style={{ color: 'var(--color-danger)', marginTop: 'var(--space-sm)' }} onClick={onClose}>
          Cancel Cook
        </button>
      </div>
    </div>
  );
}

// ShoppingSheet is now in ./shopping-sheet.tsx

import { useState } from 'preact/hooks';
import { useAuth } from '../../auth/auth-context';
import { recipes as recipesSignal, sessions as sessionsSignal, recipeIngredients as riSignal } from '../../state/store';
import { showToast } from '../../state/store';
import { isHiveConfigured, exportToHive, formatShoppingListText, type ShoppingExportItem } from '../../api/hive-api';

interface ShoppingSheetProps {
  onClose: () => void;
}

export function ShoppingSheet({ onClose }: ShoppingSheetProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<'dates' | 'review' | 'exporting' | 'done'>('dates');
  const [shopDate, setShopDate] = useState('');
  const [throughDate, setThroughDate] = useState('');
  const [included, setIncluded] = useState<Record<string, boolean>>({});
  const [copyText, setCopyText] = useState('');
  const [copied, setCopied] = useState(false);
  const [hiveExported, setHiveExported] = useState(false);

  const scheduled = sessionsSignal.value.filter(s => s.status === 'scheduled' && s.date >= shopDate && s.date <= throughDate);

  interface ShoppingItem {
    name: string;
    totalQty: number;
    unit: string;
    recipes: { name: string; date: string; qty: number }[];
  }

  const itemMap = new Map<string, ShoppingItem>();
  for (const session of scheduled) {
    const recipe = recipesSignal.value.find(r => r.id === session.recipe_id);
    if (!recipe) continue;
    const ings = riSignal.value.filter(ri => ri.recipe_id === recipe.id);
    for (const ing of ings) {
      const key = ing.ingredient_id;
      if (!itemMap.has(key)) itemMap.set(key, { name: ing.ingredientName, totalQty: 0, unit: ing.unit, recipes: [] });
      const item = itemMap.get(key)!;
      item.totalQty += ing.quantity;
      item.recipes.push({ name: recipe.name, date: session.date, qty: ing.quantity });
    }
  }

  const shoppingItems = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  const selectedCount = Object.values(included).filter(Boolean).length;

  function getSelectedItems(): ShoppingExportItem[] {
    return shoppingItems
      .filter(item => included[item.name])
      .map(item => ({
        name: item.name,
        quantity: item.totalQty,
        unit: item.unit,
        recipes: item.recipes.map(r => r.name),
      }));
  }

  async function handleExport() {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    if (isHiveConfigured() && token) {
      // Try Hive export
      setStep('exporting');
      try {
        await exportToHive(selected, shopDate, '', token);
        setHiveExported(true);
        setStep('done');
      } catch (err) {
        console.error('Hive export failed:', err);
        showToast('Hive export failed — showing text list instead', 'error');
        // Fall back to text
        setCopyText(formatShoppingListText(selected, shopDate));
        setHiveExported(false);
        setStep('done');
      }
    } else {
      // No Hive configured — show text fallback
      setCopyText(formatShoppingListText(selected, shopDate));
      setHiveExported(false);
      setStep('done');
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the textarea content
    }
  }

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="modal-content" onClick={e => e.stopPropagation()}>
        <div class="modal-handle" />
        <div class="modal-header">
          <h2>🛒 Shopping Trip</h2>
          <button class="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Step 1: Pick dates */}
        {step === 'dates' && (
          <div>
            <div class="form-group">
              <label class="form-label">Shopping Date</label>
              <input type="date" class="form-input" value={shopDate} onInput={e => setShopDate((e.target as HTMLInputElement).value)} />
            </div>
            <div class="form-group">
              <label class="form-label">Plan meals through</label>
              <input type="date" class="form-input" value={throughDate} onInput={e => setThroughDate((e.target as HTMLInputElement).value)} />
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
              {scheduled.length} scheduled {scheduled.length === 1 ? 'meal' : 'meals'} in this range
            </p>
            <button
              class="btn btn-primary btn-block"
              onClick={() => {
                const init: Record<string, boolean> = {};
                shoppingItems.forEach(item => { init[item.name] = true; });
                setIncluded(init);
                setStep('review');
              }}
              disabled={scheduled.length === 0 || !shopDate || !throughDate}
            >
              Review Ingredients
            </button>
          </div>
        )}

        {/* Step 2: Review ingredients */}
        {step === 'review' && (
          <div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              {selectedCount} of {shoppingItems.length} items selected
            </p>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {shoppingItems.map(item => (
                <div class="shopping-item" key={item.name}>
                  <div class="shopping-check">
                    <input
                      type="checkbox"
                      checked={included[item.name] ?? true}
                      onChange={() => setIncluded(prev => ({ ...prev, [item.name]: !prev[item.name] }))}
                    />
                  </div>
                  <div class="shopping-item-body">
                    <div class="shopping-item-name">{item.name}</div>
                    <div class="shopping-item-qty">{item.totalQty} {item.unit}</div>
                    <div class="shopping-item-recipes">
                      {item.recipes.map(r => `${r.name} (${r.date.split('-').slice(1).join('/')})`).join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
              <button class="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('dates')}>Back</button>
              <button
                class="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleExport}
                disabled={selectedCount === 0}
              >
                {isHiveConfigured() ? 'Export to Hive' : 'Create List'}
              </button>
            </div>
          </div>
        )}

        {/* Exporting... */}
        {step === 'exporting' && (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
            <div class="spinner" style={{ margin: '0 auto var(--space-md)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Exporting to Hive...</p>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div>
            {hiveExported ? (
              // Hive export success
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>✅</div>
                <h3 style={{ marginBottom: 'var(--space-sm)' }}>Shopping list exported!</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>
                  Created "🛒 Grocery Store" task in Hive with {selectedCount} items, due {shopDate && new Date(shopDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                </p>
                <button class="btn btn-primary btn-block" onClick={onClose}>Done</button>
              </div>
            ) : (
              // Text fallback
              <div>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>📋</div>
                  <h3>Shopping List</h3>
                  {!isHiveConfigured() && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>
                      Connect Hive for automatic export — add VITE_HIVE_SPREADSHEET_ID to .env
                    </p>
                  )}
                </div>

                <textarea
                  class="form-input"
                  value={copyText}
                  readOnly
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', minHeight: '160px', resize: 'vertical' }}
                  onClick={e => (e.target as HTMLTextAreaElement).select()}
                />

                <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
                  <button class="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
                  <button class="btn btn-primary" style={{ flex: 1 }} onClick={handleCopy}>
                    {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { signal } from '@preact/signals';
import { currentRoute } from './router/router';
import { BottomNav } from './components/shared/bottom-nav';
import { LoginScreen } from './auth/login-screen';
import { ScheduleScreen } from './components/schedule/schedule-screen';
import { RecipesScreen } from './components/recipes/recipes-screen';
import { RecipeDetail } from './components/recipes/recipe-detail';
import { RecipeEditor } from './components/recipes/recipe-editor';
import { IngredientsScreen } from './components/ingredients/ingredients-screen';
import { SessionFlow } from './components/session/session-flow';
import { SettingsScreen } from './components/settings/settings-screen';
import { ManageLabelsScreen } from './components/settings/manage-labels-screen';

const isAuthenticated = signal(false);
// Track if a cooking session is active (full-screen takeover, no bottom nav)
const activeSession = signal<string | null>(null);

function handleLogin() {
  isAuthenticated.value = true;
}

function Router() {
  const route = currentRoute.value;

  // Full-screen cooking session
  if (route.name === 'session-active') {
    return <SessionFlow recipeId={route.params.id} onClose={() => window.location.hash = '/'} />;
  }

  switch (route.name) {
    case 'schedule':
      return <ScheduleScreen />;
    case 'recipes':
      return <RecipesScreen />;
    case 'recipe-detail':
      return <RecipeDetail recipeId={route.params.id} />;
    case 'recipe-new':
    case 'recipe-edit':
      return <RecipeEditor recipeId={route.params.id} />;
    case 'ingredients':
      return <IngredientsScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'manage-labels':
      return <ManageLabelsScreen />;
    default:
      return <ScheduleScreen />;
  }
}

export function App() {
  if (!isAuthenticated.value) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const route = currentRoute.value;
  const isFullScreen = route.name === 'session-active';

  if (isFullScreen) {
    return <Router />;
  }

  return (
    <div class="app-layout">
      <main class="app-content">
        <Router />
      </main>
      <BottomNav />
    </div>
  );
}

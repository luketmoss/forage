import { useEffect } from 'preact/hooks';
import { AuthProvider } from './auth/auth-provider';
import { useAuth } from './auth/auth-context';
import { LoginScreen } from './auth/login-screen';
import { BottomNav } from './components/shared/bottom-nav';
import { Toast } from './components/shared/toast';
import { loadInitialData } from './state/actions';
import { loading } from './state/store';
import { currentRoute } from './router/router';
import { ScheduleScreen } from './components/schedule/schedule-screen';
import { RecipesScreen } from './components/recipes/recipes-screen';
import { RecipeDetail } from './components/recipes/recipe-detail';
import { RecipeEditor } from './components/recipes/recipe-editor';
import { IngredientsScreen } from './components/ingredients/ingredients-screen';
import { SessionFlow } from './components/session/session-flow';
import { SettingsScreen } from './components/settings/settings-screen';
import { ManageLabelsScreen } from './components/settings/manage-labels-screen';

function Router() {
  const route = currentRoute.value;

  // Full-screen cooking session (no bottom nav)
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

function AuthenticatedApp() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    loadInitialData(token);
  }, [token]);

  if (loading.value) {
    return (
      <div class="loading-screen">
        <div class="spinner" />
        <p>Loading...</p>
      </div>
    );
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

function AppContent() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated ? <AuthenticatedApp /> : <LoginScreen />}
      <Toast />
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

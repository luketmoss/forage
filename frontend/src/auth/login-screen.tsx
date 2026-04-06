import { useAuth } from './auth-context';
import { ForageLogo } from '../components/shared/forage-logo';

export function LoginScreen() {
  const { login } = useAuth();
  return (
    <div class="login-screen">
      <div class="login-card">
        <ForageLogo size={64} class="login-icon" />
        <h1>Forage</h1>
        <p>From recipe to table.</p>
        <button class="login-btn" onClick={login}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

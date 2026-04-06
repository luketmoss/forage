import { ForageLogo } from '../components/shared/forage-logo';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div class="login-screen">
      <div class="login-card">
        <ForageLogo size={64} class="login-icon" />
        <h1>Forage</h1>
        <p>From recipe to table.</p>
        <button class="login-btn" onClick={onLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

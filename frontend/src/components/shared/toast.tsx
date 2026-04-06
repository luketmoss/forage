import { toastMessage, toastType } from '../../state/store';

export function Toast() {
  const msg = toastMessage.value;
  if (!msg) return null;

  return (
    <div class="toast-container">
      <div class={`toast toast-${toastType.value}`}>
        {msg}
      </div>
    </div>
  );
}

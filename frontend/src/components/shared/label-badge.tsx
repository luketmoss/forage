import { mockLabels, getLabelColor } from '../../mock-data';

interface LabelBadgeProps {
  name: string;
  onClick?: () => void;
  active?: boolean;
}

export function LabelBadge({ name, onClick, active }: LabelBadgeProps) {
  const label = mockLabels.find(l => l.name === name);
  const color = getLabelColor(label?.colorKey ?? 'gray');

  const style = {
    '--label-bg': color.bg,
    '--label-text': color.text,
    '--label-bg-dark': color.bgDark,
    '--label-text-dark': color.textDark,
  } as Record<string, string>;

  if (onClick) {
    return (
      <button
        class={`label-badge ${active ? 'label-badge-active' : ''}`}
        style={style}
        onClick={onClick}
      >
        {name}
      </button>
    );
  }

  return (
    <span class="label-badge" style={style}>
      {name}
    </span>
  );
}

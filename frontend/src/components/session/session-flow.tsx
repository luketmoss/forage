import { useState, useEffect } from 'preact/hooks';
import { getRecipeById, formatTimerDisplay } from '../../mock-data';

interface SessionFlowProps {
  recipeId: string;
  onClose: () => void;
}

type Phase = 'prep' | 'cooking' | 'summary';

interface CountdownTimer {
  id: number;
  label: string;
  totalSeconds: number;
  remaining: number;
  running: boolean;
}

// ===== Rectangular Timer Card Component =====
function TimerCard({ seconds, totalSeconds, label, isMain, isCountdown, running, alarm, onTap, onLongPress }: {
  seconds: number;
  totalSeconds: number;
  label: string;
  isMain: boolean;
  isCountdown: boolean;
  running: boolean;
  alarm?: boolean;
  onTap?: () => void;
  onLongPress?: () => void;
}) {
  // Progress bar (horizontal, at the bottom of the card)
  let progress: number;
  if (isCountdown) {
    progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  } else {
    progress = (seconds % 3600) / 3600;
  }

  const barColor = alarm ? 'var(--color-danger)' : running ? 'var(--color-primary)' : 'var(--color-text-muted)';

  let pressTimer: ReturnType<typeof setTimeout> | null = null;

  function handlePointerDown() {
    if (onLongPress) {
      pressTimer = setTimeout(() => {
        onLongPress();
        pressTimer = null;
      }, 600);
    }
  }

  function handlePointerUp() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
      if (onTap) onTap();
    }
  }

  return (
    <div
      class={`timer-card ${isMain ? 'timer-card-main' : 'timer-card-cd'} ${alarm ? 'timer-card-alarm' : ''} ${running ? 'timer-card-running' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { if (pressTimer) clearTimeout(pressTimer); }}
      style={{ cursor: onTap ? 'pointer' : 'default' }}
    >
      <span class="timer-card-label">{label}</span>
      <span class={`timer-card-time ${isMain ? 'timer-card-time-main' : ''}`}>
        {formatTimerDisplay(seconds)}
      </span>
      {isCountdown && !running && seconds === totalSeconds && (
        <span class="timer-card-hint">Tap to start</span>
      )}
      {isCountdown && running && (
        <span class="timer-card-hint">Tap to pause</span>
      )}
      {alarm && <span class="timer-card-hint">🔔 Done!</span>}
      {/* Progress bar */}
      <div class="timer-card-bar">
        <div class="timer-card-bar-fill" style={{ width: `${progress * 100}%`, background: barColor }} />
      </div>
    </div>
  );
}

export function SessionFlow({ recipeId, onClose }: SessionFlowProps) {
  const recipe = getRecipeById(recipeId);
  const [phase, setPhase] = useState<Phase>('prep');
  const [prepChecked, setPrepChecked] = useState<Set<number>>(new Set());
  const [stepsChecked, setStepsChecked] = useState<Set<number>>(new Set());

  // Timers
  const [prepSeconds, setPrepSeconds] = useState(0);
  const [cookSeconds, setCookSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  // Countdown timers (up to 2)
  const [countdowns, setCountdowns] = useState<CountdownTimer[]>([
    { id: 1, label: 'Timer 1', totalSeconds: 300, remaining: 300, running: false },
    { id: 2, label: 'Timer 2', totalSeconds: 600, remaining: 600, running: false },
  ]);
  const [settingCountdown, setSettingCountdown] = useState<number | null>(null);

  // Summary state
  const [summaryNotes, setSummaryNotes] = useState('');

  // Main timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      if (phase === 'prep') setPrepSeconds(s => s + 1);
      else if (phase === 'cooking') setCookSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, phase]);

  // Countdown timers tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => prev.map(cd => {
        if (!cd.running || cd.remaining <= 0) return cd;
        return { ...cd, remaining: cd.remaining - 1 };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!recipe) {
    return (
      <div class="session-fullscreen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Recipe not found</p>
        <button class="btn btn-primary" onClick={onClose}>Go Back</button>
      </div>
    );
  }

  function togglePrepCheck(stepNum: number) {
    const next = new Set(prepChecked);
    if (next.has(stepNum)) next.delete(stepNum);
    else next.add(stepNum);
    setPrepChecked(next);
  }

  function toggleStepCheck(stepNum: number) {
    const next = new Set(stepsChecked);
    if (next.has(stepNum)) next.delete(stepNum);
    else next.add(stepNum);
    setStepsChecked(next);
  }

  function startCooking() {
    setTimerRunning(true);
    setPhase('cooking');
  }

  function finishCooking() {
    setTimerRunning(false);
    setPhase('summary');
  }

  function toggleCountdown(id: number) {
    setCountdowns(prev => prev.map(cd =>
      cd.id === id ? { ...cd, running: !cd.running } : cd
    ));
  }

  function setCountdownTime(id: number, minutes: number) {
    const secs = minutes * 60;
    setCountdowns(prev => prev.map(cd =>
      cd.id === id ? { ...cd, totalSeconds: secs, remaining: secs, running: false } : cd
    ));
    setSettingCountdown(null);
  }

  const currentTimer = phase === 'prep' ? prepSeconds : cookSeconds;

  return (
    <div class="session-fullscreen">
      {/* Header */}
      <div class="session-header">
        <button class="btn-icon" onClick={onClose} aria-label="Exit cook" style={{ color: 'var(--color-danger)' }}>
          ✕
        </button>
        <div class="session-header-title">
          <h2>{recipe.name}</h2>
          <span class="session-phase">{phase === 'prep' ? 'Prep' : phase === 'cooking' ? 'Cooking' : 'Done!'}</span>
        </div>
        {phase !== 'summary' && (
          <button
            class="btn-icon"
            onClick={() => setTimerRunning(!timerRunning)}
            aria-label={timerRunning ? 'Pause' : 'Resume'}
            style={{ fontSize: '1.2rem' }}
          >
            {timerRunning ? '⏸' : '▶'}
          </button>
        )}
      </div>

      {/* Timer Row — 3 rectangular timer cards across the top (40% 30% 30%) */}
      {phase !== 'summary' && (
        <div class="timer-row">
          <TimerCard
            seconds={currentTimer}
            totalSeconds={3600}
            label={phase === 'prep' ? 'PREP' : 'COOK'}
            isMain={true}
            isCountdown={false}
            running={timerRunning}
          />
          <TimerCard
            seconds={countdowns[0].remaining}
            totalSeconds={countdowns[0].totalSeconds}
            label={countdowns[0].label}
            isMain={false}
            isCountdown={true}
            running={countdowns[0].running}
            alarm={countdowns[0].remaining === 0 && countdowns[0].totalSeconds > 0}
            onTap={() => toggleCountdown(1)}
            onLongPress={() => setSettingCountdown(settingCountdown === 1 ? null : 1)}
          />
          <TimerCard
            seconds={countdowns[1].remaining}
            totalSeconds={countdowns[1].totalSeconds}
            label={countdowns[1].label}
            isMain={false}
            isCountdown={true}
            running={countdowns[1].running}
            alarm={countdowns[1].remaining === 0 && countdowns[1].totalSeconds > 0}
            onTap={() => toggleCountdown(2)}
            onLongPress={() => setSettingCountdown(settingCountdown === 2 ? null : 2)}
          />
        </div>
      )}

      {/* Countdown time setter */}
      {settingCountdown && phase !== 'summary' && (
        <div class="countdown-setter">
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginRight: 'var(--space-sm)' }}>
            Set {countdowns[settingCountdown - 1].label}:
          </span>
          {[1, 3, 5, 10, 15, 20, 30].map(min => (
            <button
              key={min}
              class="btn btn-secondary"
              style={{ fontSize: 'var(--text-xs)', padding: '4px 8px', minHeight: '32px' }}
              onClick={() => setCountdownTime(settingCountdown, min)}
            >
              {min}m
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div class="session-body">
        {/* Prep Phase — Checklist */}
        {phase === 'prep' && (
          <div>
            {recipe.prep.length === 0 ? (
              <div class="empty-state">
                <p>No prep steps for this recipe</p>
                <p>Tap "Start Cooking" to begin</p>
              </div>
            ) : (
              <ul class="prep-checklist">
                {recipe.prep.map(step => (
                  <li
                    key={step.step}
                    class={`prep-check-item ${prepChecked.has(step.step) ? 'checked' : ''}`}
                    onClick={() => togglePrepCheck(step.step)}
                  >
                    <div class="prep-checkbox">
                      {prepChecked.has(step.step) && '✓'}
                    </div>
                    <span class="prep-check-text">{step.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Cooking Phase — Step Checklist (same style as prep) */}
        {phase === 'cooking' && (
          <div>
            <ul class="prep-checklist">
              {recipe.steps.map(step => (
                <li
                  key={step.step}
                  class={`prep-check-item ${stepsChecked.has(step.step) ? 'checked' : ''}`}
                  onClick={() => toggleStepCheck(step.step)}
                >
                  <div class="prep-checkbox" style={{ borderRadius: '50%' }}>
                    {stepsChecked.has(step.step) && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', display: 'block', marginBottom: '2px' }}>
                      Step {step.step}
                    </span>
                    <span class="prep-check-text">{step.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Summary Phase */}
        {phase === 'summary' && (
          <div class="session-summary">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎉</div>
            <div class="session-summary-time">{formatTimerDisplay(prepSeconds + cookSeconds)}</div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-lg)' }}>Total Time</p>

            <div class="session-summary-breakdown">
              <div class="summary-stat">
                <span class="summary-stat-value">{formatTimerDisplay(prepSeconds)}</span>
                <span class="summary-stat-label">Prep</span>
              </div>
              <div class="summary-stat">
                <span class="summary-stat-value">{formatTimerDisplay(cookSeconds)}</span>
                <span class="summary-stat-label">Cook</span>
              </div>
            </div>

            {/* Notes */}
            <div class="form-group" style={{ textAlign: 'left' }}>
              <label class="form-label">Notes</label>
              <textarea
                class="form-input"
                placeholder="Any notes about this cook..."
                value={summaryNotes}
                onInput={e => setSummaryNotes((e.target as HTMLTextAreaElement).value)}
              />
            </div>

            <button class="btn btn-primary btn-block" onClick={onClose}>
              Save & Exit
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {phase === 'prep' && (
        <div class="session-nav">
          <button class="session-nav-btn primary" onClick={startCooking}>
            Done with Prep → Start Cooking
          </button>
        </div>
      )}

      {phase === 'cooking' && (
        <div class="session-nav">
          <button class="session-nav-btn finish" onClick={finishCooking}>
            ✓ Finish Cook
          </button>
        </div>
      )}
    </div>
  );
}

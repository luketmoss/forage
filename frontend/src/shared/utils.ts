// Shared utility functions — extracted from mock-data.ts.
// All session helpers work with SessionWithRow (uses recipe_id).

import type { SessionWithRow } from '../api/types';

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTimerDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function toLocalDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

export interface GroupedSessions {
  label: string;
  sessions: SessionWithRow[];
}

/** Group sessions into "This Week", "Last Week", "Earlier" — matching Thrive's grouping */
export function groupSessionsByWeek(sessions: SessionWithRow[], todayStr: string): GroupedSessions[] {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay();
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const thisMondayStr = toLocalDateStr(thisMonday);

  const lastMonday = new Date(thisMonday);
  lastMonday.setDate(thisMonday.getDate() - 7);
  const lastMondayStr = toLocalDateStr(lastMonday);

  const thisWeek: SessionWithRow[] = [];
  const lastWeek: SessionWithRow[] = [];
  const earlier: SessionWithRow[] = [];

  for (const s of sessions) {
    if (s.date >= thisMondayStr) thisWeek.push(s);
    else if (s.date >= lastMondayStr) lastWeek.push(s);
    else earlier.push(s);
  }

  const groups: GroupedSessions[] = [];
  if (thisWeek.length > 0) groups.push({ label: 'This Week', sessions: thisWeek });
  if (lastWeek.length > 0) groups.push({ label: 'Last Week', sessions: lastWeek });
  if (earlier.length > 0) groups.push({ label: 'Earlier', sessions: earlier });
  return groups;
}

export function getWeekDays(sessions: SessionWithRow[], todayStr: string): { date: string; label: string; hasCompleted: boolean; hasScheduled: boolean; isToday: boolean }[] {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = toLocalDateStr(d);
    days.push({
      date: dateStr,
      label: dayLabels[i],
      hasCompleted: sessions.some(s => s.date === dateStr && s.status === 'completed'),
      hasScheduled: sessions.some(s => s.date === dateStr && s.status === 'scheduled'),
      isToday: dateStr === todayStr,
    });
  }

  return days;
}

export function getWeekStats(sessions: SessionWithRow[], todayStr: string) {
  const today = new Date(todayStr + 'T00:00:00');
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const mondayStr = toLocalDateStr(monday);

  const lastMonday = new Date(monday);
  lastMonday.setDate(monday.getDate() - 7);
  const lastMondayStr = toLocalDateStr(lastMonday);

  const monthStart = todayStr.substring(0, 8) + '01';

  const completed = sessions.filter(s => s.status === 'completed');

  const thisWeek = completed.filter(s => s.date >= mondayStr && s.date <= todayStr);
  const lastWeek = completed.filter(s => s.date >= lastMondayStr && s.date < mondayStr);
  const thisMonth = completed.filter(s => s.date >= monthStart && s.date <= todayStr);

  const totalTime = (list: SessionWithRow[]) => list.reduce((sum, s) => sum + s.prepTime + s.cookTime, 0);

  return {
    thisWeekCount: thisWeek.length,
    thisWeekMinutes: totalTime(thisWeek),
    lastWeekCount: lastWeek.length,
    lastWeekMinutes: totalTime(lastWeek),
    thisMonthCount: thisMonth.length,
    thisMonthMinutes: totalTime(thisMonth),
  };
}

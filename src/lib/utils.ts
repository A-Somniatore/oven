import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function formatDuration(ms: number): string {
  const dur = dayjs.duration(ms);
  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatRelativeTime(dateString: string): string {
  return dayjs(dateString).fromNow();
}

export function getSessionDuration(session: any): number {
  const start = new Date(session.started_at).getTime();
  const end = session.ended_at
    ? new Date(session.ended_at).getTime()
    : new Date().getTime();
  const duration = end - start - (session.total_paused_time || 0);
  return Math.max(0, duration);
}

export function formatSessionStatus(session: any): string {
  if (session.ended_at) {
    return 'completed';
  }
  if (session.paused_at) {
    return '⏸️  paused';
  }
  return '🍳 cooking';
}

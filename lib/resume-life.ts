export const RESUME_LIFE_MS = 24 * 60 * 60 * 1000;

export function resumeExpiresAt(createdAt: string): number {
  const start = new Date(createdAt).getTime();
  if (Number.isNaN(start)) return 0;
  return start + RESUME_LIFE_MS;
}

export function resumeHoursLeft(createdAt: string): number {
  const left = resumeExpiresAt(createdAt) - Date.now();
  if (left <= 0) return 0;
  return Math.max(1, Math.round(left / (60 * 60 * 1000)));
}

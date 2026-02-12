export const SESSION_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function getSessionExpiryTime(): number {
  return Date.now() + SESSION_TTL_MS;
}

export function isSessionExpired(expiryTime: number): boolean {
  return Date.now() > expiryTime;
}

export function getRemainingTime(expiryTime: number): number {
  const remaining = expiryTime - Date.now();
  return Math.max(0, remaining);
}

export function formatRemainingTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

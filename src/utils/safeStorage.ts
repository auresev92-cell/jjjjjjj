/**
 * Robust LocalStorage access utilities that protect the app from crashing
 * when localStorage contains malformed JSON, "[object Object]", or corrupted values.
 */

export function safeJsonParse<T = any>(value: string | null | undefined, fallback: T): T {
  if (!value || typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (trimmed === '[object Object]' || trimmed === 'undefined' || trimmed === 'null') {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch (err) {
    console.warn(`[SafeStorage] Erreur de parsing JSON pour la valeur:`, value.slice(0, 50), err);
    return fallback;
  }
}

export function getSafeLocalStorageItem<T = any>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return safeJsonParse(raw, fallback);
  } catch (err) {
    console.warn(`[SafeStorage] Erreur de lecture pour la clé "${key}":`, err);
    return fallback;
  }
}

export function getSavedUserSafe(): any {
  return getSafeLocalStorageItem('app_user', null);
}

export function getSavedProfileSafe(): any {
  return getSafeLocalStorageItem('bavel_user_profile', null);
}

export function getSavedPhotosSafe(): string[] | null {
  return getSafeLocalStorageItem('bavel_user_photos', null);
}

/**
 * Sanitizes localStorage to eliminate legacy bad entries (like "[object Object]")
 * that break JSON.parse during initial render.
 */
export function sanitizeCorruptedLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    const criticalKeys = [
      'app_user',
      'bavel_user_profile',
      'bavel_user_photos',
      'bavel_profile_user',
      'bavel_blocked_users',
      'bavel_muted_discussions',
      'bavel_ignored_discussions',
    ];

    for (const key of criticalKeys) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          const trimmed = val.trim();
          if (trimmed === '[object Object]' || trimmed === 'undefined') {
            console.warn(`[SafeStorage] Clé corrompue détectée et purgée : ${key}`);
            localStorage.removeItem(key);
          } else {
            // Verify it can parse
            JSON.parse(trimmed);
          }
        }
      } catch {
        console.warn(`[SafeStorage] JSON corrompu détecté et purgé pour : ${key}`);
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn('[SafeStorage] Échec du nettoyage préventif :', err);
  }
}

// Helper for 1 Email = 1 Profile Account Persistence

export interface AccountRecord {
  email: string;
  userId: string;
  profile: any;
  photos: string[];
  updatedAt: string;
}

const STORAGE_KEY = 'bavel_accounts_by_email';

export function getAccountRecord(email?: string): AccountRecord | null {
  if (!email || !email.trim()) return null;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const map: Record<string, AccountRecord> = JSON.parse(raw);
    return map[cleanEmail] || null;
  } catch (e) {
    console.warn('Failed to read account record:', e);
    return null;
  }
}

export function saveAccountRecord(email: string, profile: any, photos?: string[]) {
  if (!email || !email.trim()) return;
  const cleanEmail = email.toLowerCase().trim();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map: Record<string, AccountRecord> = raw ? JSON.parse(raw) : {};
    const existing = map[cleanEmail];

    // Safety check: if existing account is complete and new profile is incomplete/empty, don't wipe existing profile details
    const newIsComplete = isCompletedProfile(profile);
    const existingIsComplete = existing?.profile && isCompletedProfile(existing.profile);

    const mergedProfile = {
      ...(existing?.profile || {}),
      ...(profile || {}),
      email: cleanEmail,
      onboardingCompleted: existingIsComplete || newIsComplete || Boolean(profile?.onboardingCompleted)
    };

    // Keep existing name if new profile has generic 'Membre' or empty name
    if (existing?.profile?.name && existing.profile.name !== 'Membre' && existing.profile.name !== 'Guest' && (!profile?.name || profile.name === 'Membre' || profile.name === 'Guest')) {
      mergedProfile.name = existing.profile.name;
    }

    const mergedPhotos = photos !== undefined ? photos : (existing?.photos || []);

    map[cleanEmail] = {
      email: cleanEmail,
      userId: profile?.id || existing?.userId || `user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      profile: mergedProfile,
      photos: mergedPhotos || [],
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));

    // Also sync to server endpoint asynchronously
    fetch('/api/user/profile/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: mergedProfile,
        photos: mergedPhotos
      })
    }).catch(err => console.warn('Server profile save notice:', err));

  } catch (e) {
    console.warn('Failed to save account record:', e);
  }
}

export function isCompletedProfile(profile: any): boolean {
  if (!profile) return false;
  if (profile.onboardingCompleted === true) return true;
  const hasName = Boolean(profile.name && profile.name.trim() && profile.name !== 'Membre' && profile.name !== 'Guest');
  const hasDetails = Boolean(profile.gender || profile.birthday || profile.city || profile.bio || profile.age || profile.purpose || profile.height || profile.job || profile.studies || (profile.details && Object.values(profile.details).some(v => Boolean(v))));
  return hasName && hasDetails;
}

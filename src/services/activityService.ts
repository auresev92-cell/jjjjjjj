// Real-time activity tracking service for Bavel app
// Tracks user interactions (likes, visits, contacts, swipes) by date and calculates dynamic activity levels.

export type ActivityLevel = 'très basse' | 'basse' | 'moyenne' | 'forte' | 'très forte';

export interface DailyActivityData {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g., '26' or 'Ce jour'
  isToday: boolean;
  activityLevel: ActivityLevel;
  yPercent: number; // SVG coordinate (0-100, where 100 is bottom, 12 is top)
  needleAngle: number; // Degrees for speedometer gauge
  contacts: number;
  visits: number;
  likes: number;
  swipes: number;
}

const STORAGE_KEY = 'bavel_user_activity_logs_v1';

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Default baseline generator for initial user experience so graph has realistic past context
function getInitialSeedData(): Record<string, { likes: number; visits: number; contacts: number; swipes: number }> {
  const seed: Record<string, { likes: number; visits: number; contacts: number; swipes: number }> = {};
  const now = new Date();
  
  // Create 7 days of real-time zero-initialized tracking data
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = formatDateKey(d);
    seed[key] = { likes: 0, visits: 0, contacts: 0, swipes: 0 };
  }
  return seed;
}

function loadStorage(): Record<string, { likes: number; visits: number; contacts: number; swipes: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading activity data:', e);
  }
  const initial = getInitialSeedData();
  saveStorage(initial);
  return initial;
}

function saveStorage(data: Record<string, { likes: number; visits: number; contacts: number; swipes: number }>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving activity data:', e);
  }
}

export function calculateActivityLevel(contacts: number, visits: number, likes: number, swipes: number = 0): {
  level: ActivityLevel;
  yPercent: number;
  needleAngle: number;
  color: string;
} {
  // Score formula weighting interactions
  const score = (likes * 4) + (contacts * 5) + (visits * 2) + Math.min(swipes, 10);

  if (score >= 18) {
    return { level: 'très forte', yPercent: 12, needleAngle: 75, color: '#9333ea' };
  } else if (score >= 10) {
    return { level: 'forte', yPercent: 26, needleAngle: 40, color: '#10b981' };
  } else if (score >= 5) {
    return { level: 'moyenne', yPercent: 42, needleAngle: 0, color: '#eab308' };
  } else if (score >= 2) {
    return { level: 'basse', yPercent: 58, needleAngle: -40, color: '#f97316' };
  } else {
    return { level: 'très basse', yPercent: 70, needleAngle: -75, color: '#e20030' };
  }
}

export const activityService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((fn) => fn());
  },

  recordActivity(type: 'like' | 'visit' | 'contact' | 'swipe', count: number = 1) {
    const data = loadStorage();
    const todayKey = formatDateKey(new Date());

    if (!data[todayKey]) {
      data[todayKey] = { likes: 0, visits: 0, contacts: 0, swipes: 0 };
    }

    data[todayKey][type] = (data[todayKey][type] || 0) + count;
    saveStorage(data);
    this.notify();
  },

  get7DaysData(): DailyActivityData[] {
    const data = loadStorage();
    const now = new Date();
    const result: DailyActivityData[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = formatDateKey(d);
      const isToday = i === 0;
      const dayLabel = isToday ? 'Ce jour' : String(d.getDate());

      const record = data[key] || { likes: 0, visits: 0, contacts: 0, swipes: 0 };
      const calc = calculateActivityLevel(record.contacts, record.visits, record.likes, record.swipes);

      result.push({
        dateKey: key,
        dayLabel,
        isToday,
        activityLevel: calc.level,
        yPercent: calc.yPercent,
        needleAngle: calc.needleAngle,
        contacts: record.contacts,
        visits: record.visits,
        likes: record.likes,
        swipes: record.swipes,
      });
    }

    return result;
  }
};

// ============================================
// NO-CODE STUDIO STORE & ENGINE
// Manages real-time text editing, custom buttons, section reordering, and element creation
// ============================================

export interface CustomButton {
  id: string;
  label: string;
  icon: string;
  actionType: 'navigate' | 'toast' | 'alert' | 'link';
  actionTarget: string; // e.g. 'likes', 'Coup de cœur envoyé !', 'https://...'
  color: 'rose' | 'purple' | 'amber' | 'blue' | 'emerald' | 'slate';
  targetContainer: 'discover' | 'encounters' | 'profile' | 'navbar' | 'floating';
}

export interface CustomSection {
  id: string;
  title: string;
  description?: string;
  targetTab: 'discover' | 'encounters' | 'likes' | 'discussions' | 'profile';
  order: number;
  visible: boolean;
  collapsed: boolean;
  type: 'card_grid' | 'banner' | 'text_block' | 'button_group';
  items?: { id: string; title: string; subtitle?: string; icon?: string; color?: string }[];
}

export interface CustomMenuItem {
  id: string;
  label: string;
  icon: string;
  targetMenu: 'settings' | 'profile' | 'actions' | 'top_bar';
  actionTarget: string;
  badge?: string;
}

export interface NoCodeStudioState {
  isEditMode: boolean;
  customTexts: Record<string, string>;
  customButtons: CustomButton[];
  customSections: CustomSection[];
  customMenuItems: CustomMenuItem[];
  selectedElementId: string | null;
}

const STORAGE_KEY = 'bavel_nocode_studio_config_v1';

const DEFAULT_STATE: NoCodeStudioState = {
  isEditMode: false,
  customTexts: {
    'app_title': 'BAVEL 🇨🇮',
    'app_subtitle': 'Rencontres Authentiques',
    'discover_header': 'À Découvrir',
    'encounters_header': 'Coups de Cœur',
    'likes_header': 'Personnes qui vous aiment',
    'profile_header': 'Mon Profil',
  },
  customButtons: [
    {
      id: 'btn_quick_wave',
      label: 'Faire un Coucou 🖐️',
      icon: 'Hand',
      actionType: 'toast',
      actionTarget: 'Coucou envoyé avec succès ! 🖐️',
      color: 'purple',
      targetContainer: 'discover'
    }
  ],
  customSections: [
    {
      id: 'sec_vip_banner',
      title: '🌟 Sélection VIP Abidjan',
      description: 'Les profils les plus populaires de la semaine',
      targetTab: 'discover',
      order: 1,
      visible: true,
      collapsed: false,
      type: 'card_grid',
      items: [
        { id: 'item_1', title: 'Fatou 🇨🇮', subtitle: 'Cocody', icon: '💖', color: 'rose' },
        { id: 'item_2', title: 'Ariel 🇨🇮', subtitle: 'Marcory', icon: '🔥', color: 'amber' }
      ]
    }
  ],
  customMenuItems: [
    {
      id: 'menu_my_boosts',
      label: 'Boosts & Visibilité 🚀',
      icon: 'Zap',
      targetMenu: 'profile',
      actionTarget: 'toast:Boosts activés !',
      badge: 'PRO'
    }
  ],
  selectedElementId: null
};

type Listener = () => void;

class NoCodeStudioEngine {
  private state: NoCodeStudioState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadFromStorage();
  }

  private loadFromStorage(): NoCodeStudioState {
    try {
      if (typeof window === 'undefined') return DEFAULT_STATE;
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          isEditMode: false, // Always start non-edit mode on fresh load
          selectedElementId: null
        };
      }
    } catch (e) {
      console.error('Error loading NoCodeStudio config:', e);
    }
    return DEFAULT_STATE;
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch (e) {
      console.error('Error saving NoCodeStudio config:', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  public getState(): NoCodeStudioState {
    return this.state;
  }

  public toggleEditMode(force?: boolean): void {
    this.state.isEditMode = force !== undefined ? force : !this.state.isEditMode;
    this.notify();
  }

  public selectElement(id: string | null): void {
    this.state.selectedElementId = id;
    this.notify();
  }

  // --- TEXT OVERRIDES ---
  public getText(key: string, fallback: string): string {
    return this.state.customTexts[key] ?? fallback;
  }

  public setText(key: string, value: string): void {
    this.state.customTexts[key] = value;
    this.saveToStorage();
  }

  // --- CUSTOM BUTTONS ---
  public addCustomButton(button: Omit<CustomButton, 'id'>): void {
    const newButton: CustomButton = {
      ...button,
      id: `custom_btn_${Date.now()}`
    };
    this.state.customButtons.push(newButton);
    this.saveToStorage();
  }

  public removeCustomButton(id: string): void {
    this.state.customButtons = this.state.customButtons.filter(b => b.id !== id);
    this.saveToStorage();
  }

  // --- CUSTOM SECTIONS ---
  public addCustomSection(section: Omit<CustomSection, 'id' | 'order'>): void {
    const newSection: CustomSection = {
      ...section,
      id: `custom_sec_${Date.now()}`,
      order: this.state.customSections.length + 1
    };
    this.state.customSections.push(newSection);
    this.saveToStorage();
  }

  public updateSection(id: string, updates: Partial<CustomSection>): void {
    this.state.customSections = this.state.customSections.map(s => {
      if (s.id === id) return { ...s, ...updates };
      return s;
    });
    this.saveToStorage();
  }

  public removeCustomSection(id: string): void {
    this.state.customSections = this.state.customSections.filter(s => s.id !== id);
    this.saveToStorage();
  }

  public moveSection(id: string, direction: 'up' | 'down'): void {
    const sections = [...this.state.customSections].sort((a, b) => a.order - b.order);
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap orders
    const tempOrder = sections[index].order;
    sections[index].order = sections[targetIndex].order;
    sections[targetIndex].order = tempOrder;

    this.state.customSections = sections;
    this.saveToStorage();
  }

  // --- CUSTOM MENUS ---
  public addCustomMenuItem(item: Omit<CustomMenuItem, 'id'>): void {
    const newItem: CustomMenuItem = {
      ...item,
      id: `custom_menu_${Date.now()}`
    };
    this.state.customMenuItems.push(newItem);
    this.saveToStorage();
  }

  public removeCustomMenuItem(id: string): void {
    this.state.customMenuItems = this.state.customMenuItems.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // --- RESET & EXPORT ---
  public resetToDefault(): void {
    this.state = { ...DEFAULT_STATE, isEditMode: this.state.isEditMode };
    this.saveToStorage();
  }

  public exportConfigJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importConfigJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        this.state = { ...DEFAULT_STATE, ...parsed, isEditMode: false };
        this.saveToStorage();
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
}

export const noCodeStudioEngine = new NoCodeStudioEngine();

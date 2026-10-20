import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Trash2, Edit3, MoveUp, MoveDown, Eye, EyeOff, Sparkles, 
  Layers, Type, MousePointer, Menu as MenuIcon, Download, Upload, RotateCcw, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { noCodeStudioEngine, CustomButton, CustomSection, CustomMenuItem, NoCodeStudioState } from '../../services/noCodeStudioStore';

interface NoCodeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export function NoCodeStudioModal({ isOpen, onClose, onShowToast }: NoCodeStudioModalProps) {
  const [studioState, setStudioState] = useState<NoCodeStudioState>(() => noCodeStudioEngine.getState());
  const [activeTab, setActiveTab] = useState<'sections' | 'buttons' | 'texts' | 'menus' | 'export'>('sections');

  // New Button Form State
  const [newBtnLabel, setNewBtnLabel] = useState('');
  const [newBtnIcon, setNewBtnIcon] = useState('Sparkles');
  const [newBtnActionType, setNewBtnActionType] = useState<'navigate' | 'toast' | 'link'>('toast');
  const [newBtnActionTarget, setNewBtnActionTarget] = useState('Action exécutée avec succès !');
  const [newBtnColor, setNewBtnColor] = useState<'rose' | 'purple' | 'amber' | 'blue' | 'emerald' | 'slate'>('rose');
  const [newBtnContainer, setNewBtnContainer] = useState<'discover' | 'encounters' | 'profile' | 'navbar'>('discover');

  // New Section Form State
  const [newSecTitle, setNewSecTitle] = useState('');
  const [newSecDesc, setNewSecDesc] = useState('');
  const [newSecTab, setNewSecTab] = useState<'discover' | 'encounters' | 'likes' | 'discussions' | 'profile'>('discover');
  const [newSecType, setNewSecTabType] = useState<'card_grid' | 'banner' | 'text_block' | 'button_group'>('card_grid');

  // New Menu Item Form State
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuIcon, setNewMenuIcon] = useState('Zap');
  const [newMenuTarget, setNewMenuTarget] = useState<'profile' | 'settings' | 'actions'>('profile');
  const [newMenuAction, setNewMenuAction] = useState('toast:Action personnalisée exécutée !');

  // Text Override Form State
  const [editingTextKey, setEditingTextKey] = useState('');
  const [editingTextVal, setEditingTextVal] = useState('');

  // Import JSON State
  const [importJsonInput, setImportJsonInput] = useState('');

  useEffect(() => {
    const unsub = noCodeStudioEngine.subscribe(() => {
      setStudioState({ ...noCodeStudioEngine.getState() });
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleCreateButton = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBtnLabel.trim()) return;

    noCodeStudioEngine.addCustomButton({
      label: newBtnLabel.trim(),
      icon: newBtnIcon,
      actionType: newBtnActionType,
      actionTarget: newBtnActionTarget.trim(),
      color: newBtnColor,
      targetContainer: newBtnContainer
    });

    setNewBtnLabel('');
    if (onShowToast) onShowToast('Nouveau bouton créé avec succès ! ✨');
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecTitle.trim()) return;

    noCodeStudioEngine.addCustomSection({
      title: newSecTitle.trim(),
      description: newSecDesc.trim(),
      targetTab: newSecTab,
      visible: true,
      collapsed: false,
      type: newSecType,
      items: [
        { id: `item_${Date.now()}_1`, title: 'Élément Exemple 1', subtitle: 'Aperçu', icon: '✨', color: 'rose' },
        { id: `item_${Date.now()}_2`, title: 'Élément Exemple 2', subtitle: 'Aperçu', icon: '🔥', color: 'amber' }
      ]
    });

    setNewSecTitle('');
    setNewSecDesc('');
    if (onShowToast) onShowToast('Nouvelle section créée avec succès ! 📦');
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;

    noCodeStudioEngine.addCustomMenuItem({
      label: newMenuLabel.trim(),
      icon: newMenuIcon,
      targetMenu: newMenuTarget,
      actionTarget: newMenuAction.trim(),
      badge: 'NOUVEAU'
    });

    setNewMenuLabel('');
    if (onShowToast) onShowToast('Nouvelle option de menu créée ! 📋');
  };

  const handleSaveTextOverride = (key: string, val: string) => {
    noCodeStudioEngine.setText(key, val);
    setEditingTextKey('');
    if (onShowToast) onShowToast('Texte mis à jour instantanément ! 📝');
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4 text-white font-sans select-none overflow-hidden"
      >
        <motion.div 
          initial={{ y: 100, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 100, scale: 0.95 }}
          className="bg-[#18181b] border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 bg-[#202024] border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div>
                <h3 className="text-[15px] font-black tracking-tight text-white flex items-center gap-2">
                  <span>Studio No-Code Complexe</span>
                  <span className="bg-rose-500/20 text-rose-300 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">Live Builder</span>
                </h3>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Éditez les textes, sections, boutons et menus sans toucher au code
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/80 hover:bg-neutral-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-neutral-800 bg-[#121215] px-3 pt-2 gap-1 overflow-x-auto scrollbar-hide shrink-0">
            {[
              { id: 'sections', label: 'Sections (📦)', icon: Layers },
              { id: 'buttons', label: 'Boutons (🖱️)', icon: MousePointer },
              { id: 'texts', label: 'Textes (📝)', icon: Type },
              { id: 'menus', label: 'Menus (📋)', icon: MenuIcon },
              { id: 'export', label: 'JSON (💾)', icon: Download }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-[12px] font-bold rounded-t-xl transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#18181b] text-rose-400 border-t-2 border-rose-500' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-[12px] scrollbar-hide">
            
            {/* 1. SECTIONS TAB */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                {/* Form to create section */}
                <form onSubmit={handleCreateSection} className="bg-[#202024] p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-white flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-rose-400" />
                    <span>Créer une Nouvelle Section</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Titre de la Section</label>
                      <input 
                        type="text" 
                        placeholder="Ex: 🌟 Sélection VIP Assinie"
                        value={newSecTitle}
                        onChange={e => setNewSecTitle(e.target.value)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-rose-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Onglet Cible</label>
                      <select 
                        value={newSecTab}
                        onChange={e => setNewSecTab(e.target.value as any)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-rose-500 outline-none"
                      >
                        <option value="discover">🔍 À Découvrir</option>
                        <option value="encounters">🔥 Rencontres</option>
                        <option value="likes">💖 Likes</option>
                        <option value="discussions">💬 Discussions</option>
                        <option value="profile">👤 Profil</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Description (Optionnel)</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Les meilleurs profils recommandés par l'IA"
                      value={newSecDesc}
                      onChange={e => setNewSecDesc(e.target.value)}
                      className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-rose-500 outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    ➕ Ajouter cette Section
                  </button>
                </form>

                {/* Section List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                    Sections Existantes ({studioState.customSections.length})
                  </h4>

                  {studioState.customSections.map(sec => (
                    <div 
                      key={sec.id} 
                      className="bg-[#202024] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[13px] font-black text-white truncate">{sec.title}</span>
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.2 rounded uppercase">
                            {sec.targetTab}
                          </span>
                        </div>
                        {sec.description && (
                          <p className="text-[11px] text-neutral-400 truncate">{sec.description}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Toggle visibility */}
                        <button 
                          onClick={() => noCodeStudioEngine.updateSection(sec.id, { visible: !sec.visible })}
                          className={`p-1.5 rounded-lg border cursor-pointer ${
                            sec.visible 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                          }`}
                          title={sec.visible ? 'Masquer la section' : 'Afficher la section'}
                        >
                          {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Move Up */}
                        <button 
                          onClick={() => noCodeStudioEngine.moveSection(sec.id, 'up')}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer"
                          title="Monter"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>

                        {/* Move Down */}
                        <button 
                          onClick={() => noCodeStudioEngine.moveSection(sec.id, 'down')}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer"
                          title="Descendre"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button 
                          onClick={() => {
                            noCodeStudioEngine.removeCustomSection(sec.id);
                            if (onShowToast) onShowToast('Section supprimée ! 🗑️');
                          }}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg cursor-pointer"
                          title="Supprimer la section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. BUTTONS TAB */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                {/* Form to create button */}
                <form onSubmit={handleCreateButton} className="bg-[#202024] p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-white flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-purple-400" />
                    <span>Créer un Nouveau Bouton Interactif</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Texte du Bouton</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Envoyer un Cadeau 🎁"
                        value={newBtnLabel}
                        onChange={e => setNewBtnLabel(e.target.value)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-purple-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Conteneur d'Affichage</label>
                      <select 
                        value={newBtnContainer}
                        onChange={e => setNewBtnContainer(e.target.value as any)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-purple-500 outline-none"
                      >
                        <option value="discover">🔍 Onglet À Découvrir</option>
                        <option value="encounters">🔥 Onglet Rencontres</option>
                        <option value="profile">👤 Onglet Profil</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Type d'Action</label>
                      <select 
                        value={newBtnActionType}
                        onChange={e => setNewBtnActionType(e.target.value as any)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-purple-500 outline-none"
                      >
                        <option value="toast">💬 Notification Toast</option>
                        <option value="navigate">🧭 Naviguer vers un Onglet</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Cible / Message d'Action</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Cadeau virtuel envoyé ! ✨"
                        value={newBtnActionTarget}
                        onChange={e => setNewBtnActionTarget(e.target.value)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-purple-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    ➕ Créer ce Bouton
                  </button>
                </form>

                {/* Button List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                    Boutons Personnalisés Actifs ({studioState.customButtons.length})
                  </h4>

                  {studioState.customButtons.map(btn => (
                    <div 
                      key={btn.id} 
                      className="bg-[#202024] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[13px] font-black text-white truncate">{btn.label}</span>
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.2 rounded uppercase">
                            {btn.targetContainer}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate">Action: {btn.actionTarget}</p>
                      </div>

                      <button 
                        onClick={() => {
                          noCodeStudioEngine.removeCustomButton(btn.id);
                          if (onShowToast) onShowToast('Bouton supprimé ! 🗑️');
                        }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg cursor-pointer shrink-0"
                        title="Supprimer le bouton"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. TEXTS TAB */}
            {activeTab === 'texts' && (
              <div className="space-y-3">
                <div className="bg-[#202024] p-3 rounded-2xl border border-neutral-800">
                  <h4 className="text-[12px] font-extrabold text-white mb-1">
                    Éditeur de Textes Directs
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Modifiez n'importe quel titre ou libellé de l'application en temps réel.
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.entries(studioState.customTexts).map(([key, val]) => (
                    <div key={key} className="bg-[#202024] p-3 rounded-2xl border border-neutral-800 space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                        <span className="font-bold text-rose-400">Clé: {key}</span>
                      </div>

                      {editingTextKey === key ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            value={editingTextVal}
                            onChange={e => setEditingTextVal(e.target.value)}
                            className="flex-1 bg-[#151518] border border-rose-500 rounded-xl px-3 py-1.5 text-[12px] text-white outline-none"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleSaveTextOverride(key, editingTextVal)}
                            className="p-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-white truncate">{val}</span>
                          <button 
                            onClick={() => {
                              setEditingTextKey(key);
                              setEditingTextVal(val);
                            }}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg cursor-pointer"
                            title="Modifier ce texte"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. MENUS TAB */}
            {activeTab === 'menus' && (
              <div className="space-y-4">
                {/* Form to create menu */}
                <form onSubmit={handleCreateMenuItem} className="bg-[#202024] p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-white flex items-center space-x-1.5">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Ajouter une Option de Menu</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Nom de l'Option</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Paramètres VIP 👑"
                        value={newMenuLabel}
                        onChange={e => setNewMenuLabel(e.target.value)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">Menu Cible</label>
                      <select 
                        value={newMenuTarget}
                        onChange={e => setNewMenuTarget(e.target.value as any)}
                        className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl px-3 py-2 text-[12px] text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="profile">👤 Menu Profil</option>
                        <option value="settings">⚙️ Menu Réglages</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    ➕ Ajouter au Menu
                  </button>
                </form>

                {/* Menu List */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
                    Options de Menu Personnalisées ({studioState.customMenuItems.length})
                  </h4>

                  {studioState.customMenuItems.map(m => (
                    <div 
                      key={m.id} 
                      className="bg-[#202024] p-3 rounded-2xl border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-black text-white truncate block">{m.label}</span>
                        <span className="text-[10px] text-neutral-400">Emplacement: {m.targetMenu}</span>
                      </div>

                      <button 
                        onClick={() => {
                          noCodeStudioEngine.removeCustomMenuItem(m.id);
                          if (onShowToast) onShowToast('Option de menu supprimée ! 🗑️');
                        }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. EXPORT / IMPORT JSON TAB */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="bg-[#202024] p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-white flex items-center space-x-1.5">
                    <Download className="w-4 h-4 text-blue-400" />
                    <span>Exporter / Importer la Configuration JSON</span>
                  </h4>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(noCodeStudioEngine.exportConfigJson());
                        if (onShowToast) onShowToast('Configuration JSON copiée dans le presse-papier ! 📋');
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Copier Configuration JSON</span>
                    </button>

                    <button 
                      onClick={() => {
                        noCodeStudioEngine.resetToDefault();
                        if (onShowToast) onShowToast('Studio réinitialisé avec succès ! 🔄');
                      }}
                      className="py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl flex items-center space-x-1 cursor-pointer"
                      title="Réinitialiser par défaut"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#202024] p-3.5 rounded-2xl border border-neutral-800 space-y-3">
                  <h4 className="text-[12.5px] font-extrabold text-white flex items-center space-x-1.5">
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>Importer une Configuration JSON</span>
                  </h4>

                  <textarea 
                    rows={4}
                    placeholder="Collez ici le JSON de configuration..."
                    value={importJsonInput}
                    onChange={e => setImportJsonInput(e.target.value)}
                    className="w-full bg-[#151518] border border-neutral-700/80 rounded-xl p-3 text-[11px] font-mono text-white outline-none focus:border-purple-500"
                  />

                  <button 
                    onClick={() => {
                      if (!importJsonInput.trim()) return;
                      const ok = noCodeStudioEngine.importConfigJson(importJsonInput);
                      if (ok) {
                        setImportJsonInput('');
                        if (onShowToast) onShowToast('Configuration JSON importée avec succès ! 🎉');
                      } else {
                        if (onShowToast) onShowToast('Format JSON invalide ! ❌');
                      }
                    }}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all cursor-pointer"
                  >
                    📥 Charger la Configuration
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 bg-[#202024] border-t border-neutral-800 flex items-center justify-between shrink-0 text-[11px]">
            <span className="text-neutral-400 font-medium">
              Toutes les modifications sont automatiquement enregistrées.
            </span>
            <button 
              onClick={onClose}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl cursor-pointer"
            >
              Fermer le Studio
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, Check, ShieldCheck } from 'lucide-react';

export const DEFAULT_INITIAL_BLOCKED_USERS = [
  { id: 'b_1', name: 'Marie', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', verified: true },
  { id: 'b_2', name: 'Sandrine', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', verified: false },
  { id: 'b_3', name: 'Leslie', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', verified: true },
  { id: 'b_4', name: 'Touria', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=400', verified: false },
  { id: 'b_5', name: 'Shofia', photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400', verified: true },
  { id: 'b_6', name: 'Coco', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400', verified: true },
  { id: 'b_7', name: 'Sylviane', photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', verified: true },
];

export interface BlockedUsersMenuProps {
  onClose: () => void;
}

export function BlockedUsersMenu({ onClose }: BlockedUsersMenuProps) {
  // Read real blocked users from localStorage
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; photo?: string; verified?: boolean; dateBlocked?: string }>>(() => {
    if (typeof window !== 'undefined') {
      const details = localStorage.getItem('bavel_blocked_users_details');
      if (details) {
        try {
          const parsed = JSON.parse(details);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return DEFAULT_INITIAL_BLOCKED_USERS;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const syncToStorage = (updatedList: typeof blockedUsers) => {
    setBlockedUsers(updatedList);
    if (typeof window !== 'undefined') {
      const ids = updatedList.map(u => u.id);
      localStorage.setItem('bavel_blocked_users', JSON.stringify(ids));
      localStorage.setItem('bavel_blocked_users_details', JSON.stringify(updatedList));
    }
  };

  const toggleSelect = (id: string) => {
    if (!isEditing) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUnblockSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const updated = blockedUsers.filter(u => !selectedIds.includes(u.id));
    syncToStorage(updated);
    showToast(`${count} profil${count > 1 ? 's' : ''} débloqué${count > 1 ? 's' : ''} avec succès`);
    setSelectedIds([]);
    setIsEditing(false);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[13px] font-semibold px-4 py-2 rounded-full z-[160] shadow-lg animate-in fade-in slide-in-from-top-2">
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-3 px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0 relative">
        <button 
          type="button"
          onClick={isEditing ? () => { setIsEditing(false); setSelectedIds([]); } : onClose} 
          className="p-1 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer z-10"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>

        <h2 className="text-[16px] sm:text-[17px] font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2">
          {isEditing ? 'Faites un choix' : 'Bloqués'}
        </h2>

        {blockedUsers.length > 0 && (
          <button 
            type="button"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setSelectedIds([]);
              } else {
                setIsEditing(true);
              }
            }} 
            className="text-[15px] sm:text-[16px] text-purple-300 hover:text-white font-normal transition-colors cursor-pointer z-10"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 pb-2">
        {blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400 shadow-xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-[16px] font-bold text-white mb-1">Aucun utilisateur bloqué</h3>
            <p className="text-[13px] text-purple-200/70 leading-relaxed max-w-[260px]">
              Votre liste d'utilisateurs bloqués est vide.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-3 gap-y-7 max-w-md mx-auto">
            {blockedUsers.map((user, idx) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <div 
                  key={`${user.id}-${idx}`} 
                  onClick={() => {
                    if (isEditing) {
                      toggleSelect(user.id);
                    }
                  }}
                  className={`flex flex-col items-center select-none ${isEditing ? 'cursor-pointer' : ''}`}
                >
                  {/* Avatar Circle */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden relative bg-[#220a3b] border border-purple-500/20 flex items-center justify-center shadow-xs">
                    {isEditing && isSelected ? (
                      <div className="w-full h-full bg-[#ec4899] flex items-center justify-center text-white">
                        <Check className="w-8 h-8 stroke-[2.5]" />
                      </div>
                    ) : (
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Name + Verified Badge */}
                  <div className="flex items-center justify-center space-x-1 mt-2 text-center max-w-[100px]">
                    {user.verified && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#1d9bf0] flex items-center justify-center shrink-0">
                        <Check className="w-2 h-2 text-white stroke-[3]" />
                      </div>
                    )}
                    <span className="text-[13px] sm:text-[14px] font-medium text-white tracking-tight truncate">
                      {user.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Button in Edit Mode */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-[#18052e]/95 backdrop-blur-md border-t border-purple-500/20 shrink-0 z-30 max-w-md mx-auto">
          <button 
            type="button"
            onClick={handleUnblockSelected}
            disabled={selectedIds.length === 0}
            className={`w-full py-3.5 rounded-full font-semibold text-[15px] sm:text-[16px] transition-all cursor-pointer flex items-center justify-center ${
              selectedIds.length > 0 
                ? 'bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] hover:opacity-95 active:scale-[0.99] text-white shadow-md shadow-pink-900/40' 
                : 'bg-white/10 text-white/40 cursor-not-allowed border border-purple-500/20'
            }`}
          >
            {selectedIds.length > 0 
              ? `Je veux en débloquer ${selectedIds.length}` 
              : 'Sélectionnez des profils à débloquer'}
          </button>
        </div>
      )}
    </div>
  );
}

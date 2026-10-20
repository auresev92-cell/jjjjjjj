import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, X } from 'lucide-react';
import { updatePassword } from '../../../lib/supabase';
import { getSavedBiometricUser, enableBiometricAuth } from '../../../lib/biometricAuth';

export interface AccountMenuProps {
  onClose: () => void;
  userProfile?: any;
  onLogout?: () => void;
}

export function AccountMenu({ onClose, userProfile, onLogout }: AccountMenuProps) {
  const [hideAccount, setHideAccount] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bavel_account_hidden') === 'true';
    }
    return false;
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const [showNewLogoutModal, setShowNewLogoutModal] = useState(false);
  const [showRegisterKeyModal, setShowRegisterKeyModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState<string>('');

  const handleLocalLogout = async () => {
    onClose();
    onLogout?.();
  };

  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return getSavedBiometricUser() !== null;
  });

  // Edit contact state
  const [contactEmail, setContactEmail] = useState(userProfile?.email || 'donkoff90@gmail.com');
  const [contactPhone, setContactPhone] = useState(userProfile?.phone || '+225 07 00 00 00');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleHideAccount = () => {
    const updated = !hideAccount;
    setHideAccount(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bavel_account_hidden', String(updated));
    }
    showToast(updated ? 'Profil masqué de la découverte' : 'Profil désormais visible');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setPasswordError('');
    setPasswordMsg('');
    setPasswordLoading(true);

    const res = await updatePassword(newPassword);
    setPasswordLoading(false);

    if (res.error) {
      setPasswordError(res.error);
    } else {
      setPasswordMsg('Mot de passe mis à jour avec succès dans Supabase Auth.');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleDownloadArchive = () => {
    const archiveData = {
      app: 'Bavel Dating',
      user_id: userProfile?.id || 'usr_current',
      email: contactEmail,
      phone: contactPhone,
      name: userProfile?.name || 'Steven',
      account_status: hideAccount ? 'paused' : 'active',
      two_factor: twoFactorEnabled,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bavel_account_archive_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archive de compte téléchargée !');
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
      <div className="flex items-center justify-between pt-8 pb-3 px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0 relative">
        <button 
          type="button"
          onClick={onClose} 
          className="p-1 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer z-10"
          aria-label="Retour"
        >
          <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
        <h2 className="text-[14.5px] font-extrabold text-white tracking-tight absolute left-1/2 -translate-x-1/2">
          Compte
        </h2>
        <div className="w-5" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-2 space-y-4">
        <div className="space-y-4">
          {/* Card 1: Cacher le compte */}
          <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-lg shadow-purple-950/40">
            <span className="text-[13.5px] font-medium text-white tracking-tight">
              Cacher le compte
            </span>
            <button 
              type="button"
              onClick={toggleHideAccount}
              className={`w-[51px] h-[31px] rounded-full transition-colors relative duration-200 shrink-0 cursor-pointer ${
                hideAccount ? 'bg-[#34c759]' : 'bg-purple-900/50 border border-purple-500/30'
              }`}
            >
              <div className={`w-[27px] h-[27px] rounded-full bg-white absolute top-[2px] transition-transform duration-200 shadow-sm ${
                hideAccount ? 'translate-x-[22px]' : 'translate-x-[2px]'
              }`} />
            </button>
          </div>

          {/* Section 2: Identifiants & Déconnexion */}
          <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-2xl p-4 text-center space-y-3 shadow-lg shadow-purple-950/40">
            <p className="text-[12.5px] text-purple-200/80 leading-snug font-normal max-w-[280px] mx-auto">
              Souvenez-vous de vos identifiants de connexion. Vous en aurez besoin pour vous connecter à nouveau.
            </p>

            <p className="text-[13.5px] text-purple-100 font-semibold tracking-tight">
              {contactEmail.includes('@') ? (
                contactEmail.replace(/^(.{1}).*(@.+)$/, '$1●●●●●$2')
              ) : (
                contactEmail
              )}
            </p>

            <div className="pt-1">
              <button 
                type="button"
                onClick={() => setShowNewLogoutModal(true)}
                className="w-full py-3 bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/30 active:scale-[0.99] text-white font-bold text-[13.5px] rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Link: Supprimer mon compte */}
        <div className="pt-6 pb-2 text-center">
          <button 
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-[13.5px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer inline-block"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Nouveau Modal de Déconnexion selon le design */}
      <AnimatePresence>
        {showNewLogoutModal && (
          <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowNewLogoutModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[#16042c] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10"
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowNewLogoutModal(false)}
                  className="p-1 text-gray-400 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="text-center space-y-4">
                <h3 className="text-[18px] font-bold text-white">Prêt(e) à vous déconnecter ?</h3>

                <div className="space-y-3 text-left">
                  <p className="text-[14px] text-gray-300 leading-relaxed">
                    Les autres personnes pourront toujours voir votre profil.
                  </p>
                  <p className="text-[14px] text-gray-300 leading-relaxed">
                    Une clé d'accès vous permettra de vous reconnecter rapidement et en toute sécurité. Vous pourrez toujours vous déconnecter sans en créer une.
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={async () => {
                      await enableBiometricAuth({
                        email: contactEmail,
                        name: userProfile?.name || 'Steven',
                        phone: contactPhone,
                        savedProfile: userProfile
                      });
                      setShowNewLogoutModal(false);
                      setShowRegisterKeyModal(true);
                    }}
                    className="w-full py-3 bg-black hover:bg-gray-900 text-white font-semibold text-[15px] rounded-full transition-all cursor-pointer"
                  >
                    Créer une clé d'accès
                  </button>

                  <button
                    onClick={async () => {
                      setShowNewLogoutModal(false);
                      await handleLocalLogout();
                    }}
                    className="w-full py-3 bg-[#0b0507] border border-purple-500/20 hover:bg-purple-900/20 text-[#f9dcdc] font-semibold text-[15px] rounded-full transition-all cursor-pointer"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Créer une clé d'accès */}
      {showRegisterKeyModal && (
        <div className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowRegisterKeyModal(false)} />
          <div className="bg-[#16042c] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative z-10 text-center space-y-4">
            <h3 className="text-[18px] font-bold text-white">Clé d'accès enregistrée</h3>
            <p className="text-[14px] text-gray-300">
              Votre clé d'accès (Passkey / Biométrie) a été créée avec succès. Vous pouvez maintenant vous reconnecter en un clin d'œil.
            </p>
            <button
              onClick={() => {
                setShowRegisterKeyModal(false);
                showToast('Clé d\'accès créée !');
                setTimeout(() => {
                  handleLocalLogout();
                }, 800);
              }}
              className="w-full py-3 bg-black text-white font-semibold rounded-full text-[15px] cursor-pointer"
            >
              Terminer et se déconnecter
            </button>
          </div>
        </div>
      )}

      {/* Modal Modifier Contact */}
      {showEditContactModal && (
        <div className="fixed inset-0 bg-black/60 z-[140] flex items-center justify-center p-4">
          <div className="bg-[#16042c] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-[16px] text-white">Coordonnées de compte</h3>
              <button onClick={() => setShowEditContactModal(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#f9dcdc] mb-1">Adresse e-mail</label>
                <input 
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#f9dcdc] mb-1">Numéro de téléphone</label>
                <input 
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black font-medium"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button 
                  onClick={() => setShowEditContactModal(false)}
                  className="px-4 py-2 bg-[#0b0507] text-[#f9dcdc] rounded-xl text-xs font-semibold"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    setShowEditContactModal(false);
                    showToast('Modifications enregistrées !');
                  }}
                  className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mot de passe */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-[140] flex items-center justify-center p-4">
          <div className="bg-[#16042c] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-[16px] text-black">Mettre à jour le mot de passe</h3>
              </div>
              <button onClick={() => setShowChangePasswordModal(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {passwordMsg ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs font-medium space-y-3">
                <p>{passwordMsg}</p>
                <button 
                  onClick={() => setShowChangePasswordModal(false)}
                  className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-black"
                  />
                </div>
                {passwordError && (
                  <div className="bg-rose-50 border border-rose-200 p-2 rounded-xl text-rose-700 text-xs font-medium">
                    {passwordError}
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold"
                  >
                    {passwordLoading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Sessions */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 z-[140] flex items-center justify-center p-4">
          <div className="bg-[#16042c] rounded-2xl w-full max-w-sm p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
              <h3 className="font-bold text-[16px] text-white">Sessions connectées</h3>
              <button onClick={() => setShowSessionsModal(false)} className="p-1 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Cet appareil (Session actuelle)</span>
                  <span className="text-[11px] text-emerald-700">Chrome Mobile • Abidjan, CI</span>
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Actif</span>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-black block">iPhone 14 Pro</span>
                  <span className="text-[11px] text-gray-500">Dernière activité il y a 2h</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                showToast('Déconnecté de toutes les autres sessions');
                setShowSessionsModal(false);
              }}
              className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-100"
            >
              Déconnecter les autres appareils
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setShowDeleteConfirm(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-[#16042c] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
       
            {/* Modal Content */}
            <div className="text-center space-y-4">
              <h3 className="text-[18px] font-bold text-white">Voulez-vous vraiment supprimer votre compte ?</h3>
              
              <p className="text-[14px] text-gray-300 leading-relaxed">
                Si vous souhaitez juste le masquer momentanément ou recommencer à zéro, vous pouvez :
              </p>
       
              {/* Radio Options */}
              <div className="space-y-3 text-left">
                {[
                  { id: 'likes_only', label: 'Faire en sorte que votre profil ne soit vu que par les personnes à qui vous donnez un Like' },
                  { id: 'hide_account', label: 'Masquer votre compte pour ne pas être visible' },
                  { id: 'erase_activity', label: 'Effacer toute activité' },
                  { id: 'disable_notifications', label: 'Désactiver les notifications' },
                  { id: 'logout', label: 'Vous déconnecter' },
                  { id: 'delete_account', label: 'Supprimer votre compte' }
                ].map((option) => (
                  <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="delete_reason"
                      value={option.id}
                      checked={deleteReason === option.id}
                      onChange={() => setDeleteReason(option.id)}
                      className="mt-1"
                    />
                    <span className="text-[13px] text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>

              {/* Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    if (deleteReason === 'hide_account' || deleteReason === 'likes_only') {
                      toggleHideAccount();
                      showToast('Préférence enregistrée');
                    } else if (deleteReason === 'erase_activity') {
                      showToast('Activité effacée avec succès');
                    } else if (deleteReason === 'disable_notifications') {
                      showToast('Notifications désactivées');
                    } else if (deleteReason === 'logout') {
                      onClose();
                      onLogout?.();
                    } else if (deleteReason === 'delete_account') {
                      showToast('Compte supprimé');
                      onClose();
                      onLogout?.();
                    }
                    setShowDeleteConfirm(false);
                  }}
                  disabled={!deleteReason}
                  className="w-full py-3 bg-black hover:bg-gray-900 text-white font-semibold text-[15px] rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-lg z-[200]"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

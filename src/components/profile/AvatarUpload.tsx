import React, { useState } from 'react';
import { Camera, Loader2, User as UserIcon, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { safeJsonParse } from '../../utils/safeStorage';

interface AvatarUploadProps {
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  } | null;
  avatarUrl?: string;
  onUploadSuccess?: (publicUrl: string) => void;
}

export default function AvatarUpload({ user, avatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(avatarUrl);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchroniser l'état si la prop change
  React.useEffect(() => {
    if (avatarUrl) {
      setCurrentAvatar(avatarUrl);
    }
  }, [avatarUrl]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setFeedback(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image à uploader.');
      }

      if (!user?.id) {
        throw new Error('Utilisateur non connecté.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop() || 'jpg';
      // Création d'un nom de fichier unique basé sur l'ID de l'utilisateur
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      if (supabase && isSupabaseConfigured) {
        // 1. Upload du fichier dans le bucket 'avatars' de Supabase
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { 
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          // Essai avec fallback sur bucket alternatif si 'avatars' n'est pas encore créé
          console.warn('Erreur bucket avatars, tentative avec fallback:', uploadError.message);
          const { error: fallbackError } = await supabase.storage
            .from('bavel-profile-photos')
            .upload(filePath, file, { upsert: true });

          if (fallbackError) {
            throw new Error(`Erreur Storage : ${uploadError.message}. Assurez-vous d'avoir créé le bucket public 'avatars'.`);
          }
        }

        // 2. Récupérer l'URL publique de l'image
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const finalUrl = publicUrl || URL.createObjectURL(file);

        // 3. Mettre à jour la table 'profiles' avec cette URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: finalUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          // Essayer également avec la colonne user_id
          await supabase
            .from('profiles')
            .update({ avatar_url: finalUrl })
            .eq('user_id', user.id);
        }

        setCurrentAvatar(finalUrl);
        setFeedback({ type: 'success', text: 'Photo de profil mise à jour !' });
        onUploadSuccess?.(finalUrl);
      } else {
        // Fallback local simulation (offline / dev sans clés)
        const reader = new FileReader();
        reader.onload = (e) => {
          const resultUrl = e.target?.result as string;
          setCurrentAvatar(resultUrl);
          // Sauvegarder localement
          const localUser: any = safeJsonParse(localStorage.getItem('bavel_profile_user'), {});
          localUser.avatar_url = resultUrl;
          if (localUser.photos && localUser.photos.length > 0) {
            localUser.photos[0] = resultUrl;
          } else {
            localUser.photos = [resultUrl];
          }
          localStorage.setItem('bavel_profile_user', JSON.stringify(localUser));
          setFeedback({ type: 'success', text: 'Photo mise à jour (mode local) !' });
          onUploadSuccess?.(resultUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error('Erreur upload avatar:', error);
      setFeedback({ type: 'error', text: error.message || "Erreur lors de l'upload de l'avatar." });
    } finally {
      setUploading(false);
      // Réinitialiser le input pour permettre de re-sélectionner le même fichier
      event.target.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-3">
      {/* Avatar Container */}
      <div className="relative group mb-3">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-purple-600/30 bg-slate-100 shadow-md flex items-center justify-center relative">
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt="Avatar de profil" 
              className="w-full h-full object-cover"
              onError={() => setCurrentAvatar(undefined)}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 text-slate-400 flex flex-col items-center justify-center">
              <UserIcon className="w-10 h-10 sm:w-12 sm:h-12" />
              <span className="text-[11px] font-semibold mt-0.5">Aucune</span>
            </div>
          )}

          {/* Overlay lors de l'envoi */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
              <Loader2 className="w-6 h-6 animate-spin mb-1 text-purple-300" />
              <span className="text-[10px] font-bold">Envoi...</span>
            </div>
          )}
        </div>

        {/* Badge bouton Caméra */}
        <label 
          htmlFor="avatar-upload-input"
          className="absolute bottom-0 right-0 w-8 h-8 sm:w-9 sm:h-9 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all border-2 border-white min-h-[32px] min-w-[32px]"
          title="Changer la photo"
        >
          <Camera className="w-4 h-4" />
        </label>
      </div>

      {/* Bouton de sélection / upload adapté mobile */}
      <label 
        htmlFor="avatar-upload-input"
        className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer min-h-[44px] ${
          uploading ? 'opacity-70 pointer-events-none' : ''
        }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Téléchargement...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Changer la photo</span>
          </>
        )}
        <input
          id="avatar-upload-input"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 text-center">
        Format JPG, PNG ou WebP (max 5 Mo)
      </p>

      {/* Message de confirmation ou erreur */}
      {feedback && (
        <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 ${
          feedback.type === 'error' 
            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {feedback.type === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  );
}

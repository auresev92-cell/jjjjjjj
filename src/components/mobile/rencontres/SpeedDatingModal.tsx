import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, X, Clock, Send, Heart, Sparkles, MessageCircle, 
  Eye, CheckCircle2, AlertCircle, RefreshCw, Flame
} from 'lucide-react';
import { speedDatingService, SpeedDatingSessionData, SpeedDatingPartner } from '../../../services/speedDatingService';

interface SpeedDatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  onMutualMatch?: (partner: SpeedDatingPartner) => void;
}

export const SpeedDatingModal: React.FC<SpeedDatingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onMutualMatch
}) => {
  const [phase, setPhase] = useState<'matchmaking' | 'chatting' | 'decision' | 'matched' | 'passed'>('matchmaking');
  const [session, setSession] = useState<SpeedDatingSessionData | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(180);
  const [icebreakers] = useState<string[]>(() => speedDatingService.getIcebreakers());
  const [decisionPending, setDecisionPending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  const cleanUserId = userProfile?.id || 'current_user';
  const cleanUserName = userProfile?.name || 'Moi';

  // 1. Démarrer la recherche ou rejoindre la session dès l'ouverture
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setPhase('matchmaking');

    const startSpeedDating = async () => {
      const res = await speedDatingService.joinQueue({
        id: cleanUserId,
        name: cleanUserName,
        age: userProfile?.age || 26,
        photoUrl: userProfile?.photos?.[0] || userProfile?.img || '',
        city: userProfile?.city || 'Abidjan'
      });

      if (!isMounted) return;

      if (res.session) {
        setSession(res.session);
        setRemainingSeconds(res.session.remainingSeconds);
        setPhase('chatting');
      }
    };

    startSpeedDating();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, cleanUserId, cleanUserName, userProfile]);

  // 2. Synchronisation du minuteur et polling d'état serveur (source de vérité)
  useEffect(() => {
    if (phase !== 'chatting' || !session?.sessionId) return;

    // Décompte local chaque seconde
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('decision');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Polling synchronisé avec le serveur toutes les 2 secondes pour les messages partenaires et le flou
    pollIntervalRef.current = setInterval(async () => {
      const updated = await speedDatingService.getSessionStatus(session.sessionId, cleanUserId);
      if (updated) {
        setSession(updated);
        setRemainingSeconds(updated.remainingSeconds);
        if (updated.isCompleted && phase === 'chatting') {
          setPhase('decision');
        }
      }
    }, 2000);

    return () => {
      clearInterval(timer);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [phase, session?.sessionId, cleanUserId]);

  // Défilement automatique vers le bas lors de l'arrivée de messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Formatage du chrono MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Envoi d'un message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !session?.sessionId || isSending) return;

    setIsSending(true);
    setInputText('');

    // Mise à jour optimiste
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      senderId: cleanUserId,
      senderName: cleanUserName,
      text,
      timestamp: Date.now()
    };
    setSession((prev) => prev ? {
      ...prev,
      messages: [...prev.messages, optimisticMsg]
    } : null);

    const updated = await speedDatingService.sendMessage(
      session.sessionId,
      cleanUserId,
      cleanUserName,
      text
    );

    if (updated) {
      setSession(updated);
    }
    setIsSending(false);
  };

  // Envoi d'une décision finale (Like ou Pass)
  const handleDecision = async (decision: 'like' | 'pass') => {
    if (!session?.sessionId || decisionPending) return;
    setDecisionPending(true);

    const res = await speedDatingService.submitDecision(
      session.sessionId,
      cleanUserId,
      decision
    );

    setDecisionPending(false);

    if (res.mutualMatch && res.partner) {
      setPhase('matched');
      onMutualMatch?.(res.partner);
    } else if (decision === 'like') {
      // Choix Like enregistré mais pas réciproque immédiat
      setPhase('passed');
    } else {
      setPhase('passed');
    }
  };

  // Quitter proprement la session
  const handleQuit = async () => {
    if (session?.sessionId) {
      await speedDatingService.leaveSession(session.sessionId, cleanUserId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-between font-sans overflow-hidden select-none"
      >
        {/* ========================================================= */}
        {/* HEADER DE LA SESSION SPEED DATING */}
        {/* ========================================================= */}
        <header className="w-full max-w-md pt-3 pb-2.5 px-4 flex items-center justify-between border-b border-purple-500/20 bg-gradient-to-r from-[#17062e] via-[#210940] to-[#120424] z-30 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span className="text-sm font-black tracking-tight text-white uppercase">
                  Speed Dating 3 min
                </span>
              </div>
              <span className="text-[10.5px] text-purple-200/80 font-medium">
                Blind Date synchrone en temps réel
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Minuteur 3 minutes synchronisé */}
            {phase === 'chatting' && (
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border text-xs font-black shadow-sm transition-colors ${
                remainingSeconds <= 30
                  ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                  : remainingSeconds <= 60
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-purple-600/30 border-purple-400/40 text-white'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span className="tabular-nums font-mono text-sm">{formatTime(remainingSeconds)}</span>
              </div>
            )}

            <button
              onClick={handleQuit}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Quitter le Speed Dating"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 1. ÉCRAN DE RECHERCHE DE PARTENAIRE */}
        {/* ========================================================= */}
        {phase === 'matchmaking' && (
          <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 text-center">
            <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-pink-500/50"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30"
              >
                <Zap className="w-10 h-10 text-white fill-white" />
              </motion.div>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight mb-2">
              Connexion au Speed Dating...
            </h2>
            <p className="text-xs text-purple-200/80 max-w-[280px] leading-relaxed mb-6">
              Recherche d'un célibataire en ligne disponible pour un échange intense de 3 minutes.
            </p>

            <div className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-white/90 text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Attribution instantanée du partenaire</span>
            </div>
          </main>
        )}

        {/* ========================================================= */}
        {/* 2. CHAT DU SPEED DATING AVEC DÉFLOUTAGE PROGRESSIF */}
        {/* ========================================================= */}
        {phase === 'chatting' && session && (
          <main className="flex-1 w-full max-w-md flex flex-col overflow-hidden relative">
            {/* Zone Blind Date : Photo floutée qui se révèle */}
            <section className="px-4 pt-2.5 pb-2 border-b border-purple-500/20 bg-gradient-to-b from-[#1b0833] to-[#120424] flex items-center space-x-3.5 shrink-0">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-pink-500/40 shadow-md shrink-0 bg-slate-900">
                <img
                  src={session.partner.photoUrl}
                  alt="Partner Blind Date"
                  className="w-full h-full object-cover transition-all duration-700 pointer-events-none"
                  style={{
                    filter: `blur(${session.blurLevel}px) saturate(1.2)`,
                    transform: 'scale(1.1)'
                  }}
                />
                {session.blurLevel > 0 && (
                  <div className="absolute inset-0 bg-purple-950/20 flex items-center justify-center pointer-events-none">
                    <Eye className="w-5 h-5 text-white/60 drop-shadow" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white truncate">
                    {session.partner.name}, {session.partner.age} ans
                  </h3>
                  <span className="text-[11px] font-black text-pink-300 tabular-nums">
                    {session.unblurProgress}% net
                  </span>
                </div>

                <p className="text-[11px] text-purple-200/70 truncate mb-1.5">
                  {session.partner.city || 'À proximité'}
                </p>

                {/* Barre de progression du défloutage */}
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 h-full rounded-full"
                    animate={{ width: `${session.unblurProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </section>

            {/* Flux des messages */}
            <section className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
              {session.messages.map((msg) => {
                const isMe = msg.senderId.toLowerCase() === cleanUserId.toLowerCase();
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="inline-block px-3 py-1.5 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-200 text-[11px] font-medium max-w-[90%] leading-snug">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-br-xs'
                          : 'bg-[#250e42] border border-purple-500/30 text-purple-100 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </section>

            {/* Suggestions Brise-Glace */}
            <section className="px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center space-x-2 shrink-0 bg-[#120424]">
              {icebreakers.slice(0, 4).map((icebreaker, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(icebreaker)}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-200 text-[11.5px] font-medium whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                >
                  ✨ {icebreaker}
                </button>
              ))}
            </section>

            {/* Champ de saisie mobile (16px) */}
            <footer className="p-3 bg-[#17062e] border-t border-purple-500/20 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Écrivez vite, le chrono tourne..."
                  className="flex-1 bg-white/10 border border-purple-500/30 rounded-full px-4 py-2.5 text-white text-[16px] outline-none placeholder:text-purple-300/40 focus:border-pink-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center active:scale-90 transition-transform cursor-pointer disabled:opacity-50"
                  aria-label="Envoyer le message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </footer>
          </main>
        )}

        {/* ========================================================= */}
        {/* 3. DÉCISION FINALE (Fin des 3 minutes) */}
        {/* ========================================================= */}
        {phase === 'decision' && session && (
          <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xs bg-[#1f093a] border border-purple-500/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center"
            >
              {/* Photo partenaire entièrement défloutée */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-400 mb-4 shadow-lg">
                <img
                  src={session.partner.photoUrl}
                  alt={session.partner.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-lg font-black text-white mb-1">
                Le temps est écoulé ! ⏱️
              </h2>
              <p className="text-xs text-purple-200/80 mb-6">
                Avez-vous eu un coup de cœur pour <strong className="text-white">{session.partner.name}</strong> ?
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => handleDecision('like')}
                  disabled={decisionPending}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-pink-500/30 active:scale-95 transition-transform cursor-pointer"
                >
                  <Heart className="w-5 h-5 fill-white text-white" />
                  <span>Coup de Cœur (Match)</span>
                </button>

                <button
                  onClick={() => handleDecision('pass')}
                  disabled={decisionPending}
                  className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-xs active:scale-95 transition-transform cursor-pointer"
                >
                  Au suivant
                </button>
              </div>
            </motion.div>
          </main>
        )}

        {/* ========================================================= */}
        {/* 4. RÉSULTAT MUTUAL MATCH (CÉLÉBRATION) */}
        {/* ========================================================= */}
        {phase === 'matched' && session && (
          <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-1 mb-4 shadow-xl shadow-pink-500/40">
                <img
                  src={session.partner.photoUrl}
                  alt={session.partner.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400 text-pink-300 text-xs font-black uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Coup de foudre mutuel !</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-2">
                C'est un Match ! 🎉
              </h2>
              <p className="text-xs text-purple-200/80 max-w-[280px] leading-relaxed mb-6">
                Vous et {session.partner.name} avez validé votre Speed Dating. La discussion complète est désormais débloquée !
              </p>

              <button
                onClick={onClose}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform cursor-pointer"
              >
                Poursuivre la discussion
              </button>
            </motion.div>
          </main>
        )}

        {/* ========================================================= */}
        {/* 5. FIN DE DATE SANS MATCH */}
        {/* ========================================================= */}
        {phase === 'passed' && (
          <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/70 mb-4">
              <RefreshCw className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-black text-white mb-2">
              Merci pour ce Speed Dating !
            </h2>
            <p className="text-xs text-purple-200/80 max-w-[280px] leading-relaxed mb-6">
              Chaque rencontre est une nouvelle opportunité. Vous pouvez relancer une nouvelle session dès que vous le souhaitez !
            </p>

            <button
              onClick={onClose}
              className="w-full max-w-xs py-3 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs active:scale-95 transition-transform cursor-pointer"
            >
              Retour aux Rencontres
            </button>
          </main>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

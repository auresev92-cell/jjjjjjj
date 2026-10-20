import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Coins, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  Flame,
  X,
  Share2,
  Copy,
  ShieldCheck,
  Award,
  Check
} from 'lucide-react';
import { 
  gamificationService 
} from '../../services/gamificationService';
import { UserQuest } from '../../types';
import { useUX } from '../../context/UXContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { monetizationService } from '../../services/monetizationService';

interface QuestsAndRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (actionKey: UserQuest['actionKey']) => void;
}

export const QuestsAndRewardsModal: React.FC<QuestsAndRewardsModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  const { triggerFeedback } = useUX();
  const [activeTab, setActiveTab] = useState<'quests' | 'referral' | 'badges'>('quests');
  const [quests, setQuests] = useState<UserQuest[]>(gamificationService.getQuests());
  const [completionPercent, setCompletionPercent] = useState(
    gamificationService.getProfileCompletenessPercent()
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const referralLink = "https://badoo-pulse.app/invite?ref=USER_7749_VIP";

  useEffect(() => {
    const unsub = gamificationService.subscribe(() => {
      setQuests(gamificationService.getQuests());
      setCompletionPercent(gamificationService.getProfileCompletenessPercent());
    });
    return unsub;
  }, []);

  const getQuestIcon = (actionKey: UserQuest['actionKey']) => {
    switch (actionKey) {
      case 'selfie_verify':
        return Camera;
      case 'photos_3':
        return ImageIcon;
      case 'bio':
        return FileText;
      case 'location':
        return MapPin;
      case 'first_swipe':
        return Flame;
      default:
        return Sparkles;
    }
  };

  const handleQuestClick = (quest: UserQuest) => {
    triggerFeedback('medium');
    if (!quest.isCompleted) {
      onTriggerAction?.(quest.actionKey);
    }
  };

  const handleCopyReferral = () => {
    triggerFeedback('light');
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    monetizationService.addCredits(100);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-neutral-900 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-neutral-800 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">Récompenses & Quêtes</h3>
                <p className="text-[11px] sm:text-xs text-neutral-400">Boostez votre profil et gagnez des crédits</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs */}
          <div className="flex bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mb-4 shrink-0">
            <button
              onClick={() => { setActiveTab('quests'); triggerFeedback('light'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'quests' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Quêtes
            </button>
            <button
              onClick={() => { setActiveTab('referral'); triggerFeedback('light'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'referral' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Parrainage
            </button>
            <button
              onClick={() => { setActiveTab('badges'); triggerFeedback('light'); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'badges' ? 'bg-amber-500 text-neutral-950 shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Badges ZK
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {activeTab === 'quests' && (
              <>
                {/* Profile Completion Progress Bar */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-neutral-300">Complétion du Profil</span>
                    <span className="font-black text-amber-400">{completionPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-neutral-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-2">
                    Un profil complété à 100% multiplie vos chances de match par 3.
                  </p>
                </div>

                {/* Quests List */}
                <div className="space-y-2.5">
                  {quests.map((quest) => {
                    const Icon = getQuestIcon(quest.actionKey);
                    return (
                      <div
                        key={quest.id}
                        onClick={() => handleQuestClick(quest)}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                          quest.isCompleted
                            ? 'bg-neutral-950/60 border-neutral-800/80 opacity-75'
                            : 'bg-neutral-800/80 border-neutral-700/80 hover:bg-neutral-800 hover:border-amber-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              quest.isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {quest.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Icon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <h4
                              className={`text-xs font-bold ${
                                quest.isCompleted ? 'text-neutral-400 line-through' : 'text-white'
                              }`}
                            >
                              {quest.title}
                            </h4>
                            <p className="text-[10px] text-neutral-400 line-clamp-1">{quest.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <Badge
                            className={`text-[10px] font-black ${
                              quest.isCompleted
                                ? 'bg-neutral-800 text-neutral-400'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}
                          >
                            <Coins className="w-3 h-3 mr-1" />+{quest.rewardCredits}
                          </Badge>
                          {!quest.isCompleted && <ChevronRight className="w-4 h-4 text-neutral-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'referral' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/30 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-lg">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-white mb-1">Parrainez vos amis & gagnez</h4>
                  <p className="text-xs text-purple-200/80 mb-4">
                    Recevez <span className="font-bold text-amber-400">+500 Crédits</span> pour chaque ami qui s'inscrit via votre lien exclusif.
                  </p>

                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-neutral-300 truncate mr-2">{referralLink}</span>
                    <Button
                      onClick={handleCopyReferral}
                      className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 flex items-center space-x-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    2 amis parrainés ce mois-ci • 1 000 Crédits accumulés
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Score de Fiabilité ZK-Proof</h4>
                      <p className="text-[10px] text-cyan-400 font-bold">Certifié Blockchain (99.8% Sécurité)</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Vos interactions et votre identité sont cryptographiquement garanties sans compromettre votre vie privée.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                    <h5 className="text-xs font-bold text-white mb-0.5">Top Répondeur</h5>
                    <p className="text-[10px] text-neutral-400">Taux de réponse &gt; 95%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-center">
                    <Sparkles className="w-6 h-6 mx-auto mb-2 text-rose-400" />
                    <h5 className="text-xs font-bold text-white mb-0.5">Vérifié IA</h5>
                    <p className="text-[10px] text-neutral-400">Photos & bio authentiques</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close CTA */}
          <div className="pt-4 shrink-0">
            <Button
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
            >
              Fermer
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { ChevronRight, Search, X, BookOpen, Send } from 'lucide-react';

export interface HelpCenterMenuProps {
  onClose: () => void;
}

export function HelpCenterMenu({ onClose }: HelpCenterMenuProps) {
  const [tab, setTab] = useState<'aide' | 'notifications'>('aide');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; content: string[] } | null>(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'Bonjour ! Je suis l\'assistant support Bavel. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [articleFeedback, setArticleFeedback] = useState<boolean | null>(null);

  const articlesData: Record<string, { title: string; content: string[] }> = {
    'Utiliser Bavel': {
      title: 'Guide d\'utilisation de Bavel',
      content: [
        'Bienvenue sur Bavel ! Bavel est l\'application de rencontre n°1 en Côte d\'Ivoire.',
        '1. **Découvrir des profils** : Allez dans l\'onglet Découvrir et balayez les profils ou utilisez les filtres par critères (âge, localisation, intention).',
        '2. **Liker & Matcher** : Cliquez sur le cœur ou le bouton Like. Si la personne vous like en retour, c\'est un Match !',
        '3. **Messagerie instantanée** : Discutez en temps réel, envoyez des messages vocaux, des photos ou passez un appel audio/vidéo.',
        '4. **Moods & Intention** : Définissez votre humeur du jour et ce que vous recherchez (Relation sérieuse, Discuter, etc.).'
      ]
    },
    'Votre profil': {
      title: 'Optimiser votre profil Bavel',
      content: [
        'Un profil complet attire jusqu\'à 5x plus de matchs !',
        '• Ajoutez au moins 3 photos récentes et souriantes.',
        '• Remplissez votre biographie avec des détails authentiques.',
        '• Renseignez votre profession, ville et passions.',
        '• Faites vérifier vos photos pour obtenir le badge Bleu vérifié de sécurité !'
      ]
    },
    'Confidentialité et sécurité': {
      title: 'Conseils de sécurité & Confidentialité',
      content: [
        'Votre sécurité est notre priorité absolue :',
        '• Ne partagez jamais vos coordonnées bancaires ou mots de passe.',
        '• Utilisez la messagerie Bavel avant de partager votre numéro de téléphone personnel.',
        '• Bloquez et signalez tout comportement suspect ou inapproprié.',
        '• Pour vos premières rencontres en réel, choisissez toujours un lieu public (café, restaurant, centre commercial) et prévenez un ami.'
      ]
    },
    'Rencontrer un match en personne': {
      title: 'Préparer un premier rendez-vous en sécurité',
      content: [
        'Voici les règles d\'or pour votre premier rendez-vous :',
        '1. Rendez-vous dans un endroit public très fréquenté.',
        '2. Assurez votre propre moyen de transport pour aller et revenir.',
        '3. Partagez votre position en direct avec une personne de confiance.',
        '4. Écoutez votre instinct. Si vous ne vous sentez pas à l\'aise, n\'hésitez pas à écourter le rendez-vous.'
      ]
    },
    'Signaler une personne': {
      title: 'Comment signaler un profil ou un message ?',
      content: [
        'Si un utilisateur enfreint nos règles de communauté :',
        '1. Allez sur son profil ou dans votre conversation.',
        '2. Cliquez sur les 3 petits points (...) ou sur l\'icône Bouclier.',
        '3. Sélectionnez "Signaler un abus" et choisissez le motif.',
        '4. Notre équipe de modération 24/7 examinera immédiatement votre signalement et prendra les mesures nécessaires.'
      ]
    },
    'Vérifier vos photos': {
      title: 'Obtenir le badge vérifié',
      content: [
        'La vérification de photo confirme que vous êtes bien la personne sur vos photos.',
        '1. Allez dans Profil > Éditer > Vérification.',
        '2. Prenez un selfie en reproduisant la pose affichée à l\'écran.',
        '3. Notre système vérifie la correspondance biométrique en quelques secondes.',
        '4. Le badge bleu de vérification apparaîtra sur votre profil !'
      ]
    }
  };

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Merci pour votre message. Un agent de support Bavel a bien reçu votre demande et vous répondra très rapidement.";
      const lower = userText.toLowerCase();
      if (lower.includes('match') || lower.includes('like')) {
        reply = "Pour optimiser vos matchs et likes, assurez-vous d'avoir au moins 3 belles photos et d'activer la géolocalisation !";
      } else if (lower.includes('compte') || lower.includes('mot de passe')) {
        reply = "Vous pouvez modifier votre mot de passe et gérer les options de votre compte dans Paramètres > Compte.";
      } else if (lower.includes('paiement') || lower.includes('abonnement') || lower.includes('crédit')) {
        reply = "Pour vos achats de crédits ou d'abonnements, les transactions sont sécurisées par Orange Money, Wave et carte bancaire.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 1000);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="flex flex-col pt-9 shrink-0 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 relative">
        <div className="flex items-center justify-between px-4 pt-2 pb-3 relative">
          <div className="w-6" />
          <h2 className="text-[17px] font-extrabold text-white tracking-tight text-center">Centre d'aide</h2>
          <button 
            onClick={onClose} 
            className="p-1 -mr-1 text-white hover:text-purple-300 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" strokeWidth={2.2} />
          </button>
        </div>

        {/* Tabs: Obtenir de l'aide / Notifications */}
        <div className="flex border-t border-purple-500/15 bg-transparent">
          <button 
            onClick={() => setTab('aide')}
            className={`flex-1 py-3 text-[14.5px] font-bold transition-all cursor-pointer text-center relative ${
              tab === 'aide' ? 'text-white' : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Obtenir de l'aide
            {tab === 'aide' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2dd4bf] to-[#ec4899]" />
            )}
          </button>
          
          <button 
            onClick={() => setTab('notifications')}
            className={`flex-1 py-3 text-[14.5px] font-bold transition-all cursor-pointer text-center relative ${
              tab === 'notifications' ? 'text-white' : 'text-purple-300/60 hover:text-white'
            }`}
          >
            Notifications
            {tab === 'notifications' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2dd4bf] to-[#ec4899]" />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative pb-2">
        {tab === 'aide' ? (
          <div className="p-4 space-y-5 pb-4 max-w-lg mx-auto">
            {/* Search Header */}
            <div>
              <h3 className="text-[15.5px] font-bold text-white tracking-tight mb-2.5">
                Que pouvons-nous faire pour vous aider ?
              </h3>
              <div className="bg-[#220a3b] border border-purple-500/30 rounded-full h-[46px] flex items-center px-4 shadow-inner">
                <Search className="w-5 h-5 text-purple-300/70 mr-2.5 shrink-0" strokeWidth={2} />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Rechercher" 
                  className="bg-transparent border-none outline-none w-full text-[14.5px] text-white placeholder-purple-300/40 font-normal"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-purple-300 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Section 1: Parcourir par sujet */}
            <div>
              <h3 className="text-[15.5px] font-bold text-white tracking-tight mb-3">
                Parcourir par sujet
              </h3>
              <div className="flex flex-col space-y-3">
                {[
                  { 
                    key: 'Utiliser Bavel', 
                    title: 'Utiliser Bavel', 
                    desc: 'Votre guide pour matcher, discuter et faire des rencontres.' 
                  },
                  { 
                    key: 'Votre profil', 
                    title: 'Votre profil', 
                    desc: 'Pour vous aider à vous montrer sous votre meilleur jour.' 
                  },
                  { 
                    key: 'Confidentialité et sécurité', 
                    title: 'Confidentialité et sécurité', 
                    desc: 'Articles d\'aide pour assurer votre sécurité et celle de notre communauté.' 
                  }
                ]
                .filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <button 
                    key={item.key}
                    onClick={() => {
                      setArticleFeedback(null);
                      setSelectedArticle(articlesData[item.key] || { title: item.title, content: [item.desc] });
                    }}
                    className="bg-[#200a38]/85 border border-purple-500/20 rounded-[20px] p-4 flex items-center justify-between text-left hover:bg-purple-900/30 transition-all cursor-pointer active:scale-[0.99] shadow-md shadow-purple-950/30"
                  >
                    <div className="pr-3">
                      <h4 className="text-[15.5px] font-bold text-white">{item.title}</h4>
                      <p className="text-[13px] text-purple-200/70 leading-snug mt-1">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-400/60 shrink-0" strokeWidth={2.2} />
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Sujets fréquents */}
            <div>
              <h3 className="text-[15.5px] font-bold text-white tracking-tight mb-3">
                Sujets fréquents
              </h3>
              <div className="bg-[#200a38]/85 border border-purple-500/20 rounded-[20px] overflow-hidden divide-y divide-purple-500/15 shadow-md shadow-purple-950/30">
                {[
                  'Rencontrer un match en personne',
                  'Signaler une personne',
                  'Vérifier vos photos'
                ]
                .filter(title => !searchQuery || title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((title) => (
                  <button 
                    key={title}
                    onClick={() => {
                      setArticleFeedback(null);
                      setSelectedArticle(articlesData[title] || { title, content: ['Informations détaillées concernant ' + title] });
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-purple-900/30 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-purple-300 shrink-0" strokeWidth={1.8} />
                      <span className="text-[14.5px] font-bold text-white tracking-tight">
                        {title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400/60 shrink-0" strokeWidth={2} />
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Card: Vous avez encore une question ? */}
            <div className="bg-gradient-to-r from-purple-900/60 via-[#260c44]/80 to-pink-900/40 border border-purple-500/25 rounded-[22px] p-4 flex items-center justify-between mt-6 mb-6 shadow-lg shadow-purple-950/40">
              <div className="pr-3">
                <h4 className="text-[15px] font-bold text-white">
                  Vous avez encore une question ?
                </h4>
                <p className="text-[12.5px] text-purple-200/80 leading-snug mt-0.5">
                  Discutez avec le service d'aide par chat
                </p>
              </div>
              <button 
                onClick={() => setShowLiveChat(true)}
                className="bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white px-4 py-2 rounded-full font-bold text-[13px] shrink-0 transition-all cursor-pointer active:scale-95 shadow-md shadow-pink-900/40"
              >
                Discuter
              </button>
            </div>
          </div>
        ) : (
          /* Tab 2: Notifications */
          <div className="flex flex-col items-center justify-center min-h-[55vh] px-6 text-center">
            <h3 className="text-[17px] font-bold text-white tracking-tight mb-2">
              L'évolution de nos échanges est ici
            </h3>
            <p className="text-[13.5px] sm:text-[14px] text-purple-200/70 leading-relaxed max-w-[340px]">
              L'état d'avancement ou le récapitulatif de vos signalements ou de vos échanges avec le service d'aide est disponible ici.
            </p>
          </div>
        )}
      </div>

      {/* Modal Article d'aide */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[140] flex items-center justify-center p-4">
          <div className="bg-[#1f093a] border border-purple-500/30 rounded-2xl w-full max-w-sm max-h-[85vh] flex flex-col p-5 shadow-2xl relative text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 mb-3 shrink-0">
              <h3 className="font-bold text-[15px] text-white pr-2 line-clamp-1">{selectedArticle.title}</h3>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded-full text-purple-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-purple-200/90 leading-relaxed">
              {selectedArticle.content.map((paragraph, i) => (
                <p key={i} className="text-[13px] leading-relaxed text-purple-200/90">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-3 border-t border-purple-500/20 mt-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-purple-300/80 font-medium">Cet article vous a aidé ?</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setArticleFeedback(true)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      articleFeedback === true ? 'bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white border-transparent' : 'bg-purple-900/40 text-purple-200 border-purple-500/30'
                    }`}
                  >
                    Oui
                  </button>
                  <button 
                    onClick={() => setArticleFeedback(false)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                      articleFeedback === false ? 'bg-gradient-to-r from-[#2dd4bf] to-[#ec4899] text-white border-transparent' : 'bg-purple-900/40 text-purple-200 border-purple-500/30'
                    }`}
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Live Chat */}
      {showLiveChat && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[140] flex items-center justify-center p-4">
          <div className="bg-[#1f093a] border border-purple-500/30 rounded-2xl w-full max-w-sm h-[75vh] flex flex-col shadow-2xl overflow-hidden relative text-white">
            <div className="p-4 bg-[#18052e] border-b border-purple-500/20 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#ec4899] flex items-center justify-center text-white text-xs font-black shadow-md">
                  B
                </div>
                <div>
                  <h3 className="font-bold text-[13.5px] text-white">Support Bavel</h3>
                  <span className="text-[10.5px] text-emerald-400 font-semibold block">● En ligne</span>
                </div>
              </div>
              <button onClick={() => setShowLiveChat(false)} className="p-1 text-purple-300 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#130324]">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-snug ${
                    msg.sender === 'user' ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-br-none shadow-md' : 'bg-[#250b44] border border-purple-500/20 text-purple-100 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#18052e] border-t border-purple-500/20 flex items-center space-x-2">
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    handleSendChatMessage();
                  }
                }}
                placeholder="Votre message..."
                className="flex-1 bg-[#240a44] border border-purple-500/30 rounded-full px-4 py-2 text-white text-[13px] placeholder-purple-300/40 outline-none"
              />
              <button 
                onClick={handleSendChatMessage}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#ec4899] flex items-center justify-center text-white shrink-0 active:scale-95 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

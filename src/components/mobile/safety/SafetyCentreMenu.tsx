import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  SlidersHorizontal, MapPin, Heart, MessageCircle, MessageCircleMore, User as UserIcon, 
  Settings, HelpCircle, Camera, Zap, Search, Bell, Gauge, Edit3, Mail,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Smile, Plus, Copy, MoreHorizontal, Lock, CheckCircle, Check, X, Star, Shield, Eye, EyeOff, FileText, RotateCcw,
  Navigation, Baby, Target, Ruler, Languages, Wine, Sparkles, Dog, Brain, Flame, Cigarette, GraduationCap, BookOpen, Coffee, Clapperboard, ChevronsUp, Megaphone, Battery, Send,
  Radio, Locate, LocateFixed, RefreshCw, Map, Compass, Image as ImageIcon, Briefcase,
  Phone, Video, Mic, CheckCheck, Gift, Ban, ThumbsUp, ArrowUp, Coins, Volume2, VolumeX, UserX, PhoneOff, MicOff, VideoOff, Play, Pause, Trash2, Hand, Users, Pencil
} from 'lucide-react';
import { User } from '../../../types';
import { SafetyIllustrationRenderer } from '../../shared/SafetyIllustrationRenderer';

const guideAttitude3D = '';
const guideRencontres3D = '';
const guideConseils3D = '';
const guideBienetre3D = '';
const wellbeingStart3D = '';
const wellbeingRejected3D = '';
const wellbeingTrust3D = '';
const wellbeingBurnout3D = '';
const datePrep3D = '';
const dateSafety3D = '';
const dateCovid3D = '';
const conseilsDates3D = '';
const conseilsChat3D = '';
const conseilsConsent3D = '';
const conseilsScam3D = '';
const conseilsVerify3D = '';
const harmAbusive3D = '';
const harmHarass3D = '';
const harmFake3D = '';
const harmObscene3D = '';
const harmReport3D = '';

export function SafetyCentreMenu({ 
  onClose, 
  userName = 'Steven',
  onOpenVerification,
  onOpenConfidentiality,
  onOpenInvisibleMode
}: { 
  onClose: () => void; 
  userName?: string;
  onOpenVerification?: () => void;
  onOpenConfidentiality?: () => void;
  onOpenInvisibleMode?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'guides' | 'outils' | 'contacts'>('guides');
  const [selectedGuideDetail, setSelectedGuideDetail] = useState<{
    title: string;
    subtitle: string;
    content: string[];
    bg: string;
    textColor: string;
    image: string;
  } | null>(null);

  const [showWellbeingGrid, setShowWellbeingGrid] = useState(false);
  const [selectedWellbeingCard, setSelectedWellbeingCard] = useState<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  } | null>(null);

  const [showRencontresGrid, setShowRencontresGrid] = useState(false);
  const [selectedRencontresCard, setSelectedRencontresCard] = useState<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  } | null>(null);

  const [showHarmGrid, setShowHarmGrid] = useState(false);
  const [selectedHarmCard, setSelectedHarmCard] = useState<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  } | null>(null);

  const harmCards = [
    {
      id: 'abusive',
      title: "J'ai reçu un message abusif",
      subtitle: "Voici ce que vous pouvez faire.",
      image: harmAbusive3D,
    },
    {
      id: 'harass',
      title: "Je suis victime de harcèlement",
      subtitle: "Quelqu'un vous met mal à l'aise ? Nous sommes là.",
      image: harmHarass3D,
    },
    {
      id: 'fake',
      title: "Je pense avoir trouvé un faux profil",
      subtitle: "Comment repérer des tentatives de catfishing",
      image: harmFake3D,
    },
    {
      id: 'obscene',
      title: "J'ai reçu une photo obscène",
      subtitle: "Que faire si vous n'avez pas sollicité cette photo",
      image: harmObscene3D,
    },
    {
      id: 'report',
      title: "Que se passe-t-il après un signalement ?",
      subtitle: "Vous avez signalé un profil... et maintenant ?",
      image: harmReport3D,
    }
  ];

  const [showConseilsGrid, setShowConseilsGrid] = useState(false);
  const [selectedConseilsCard, setSelectedConseilsCard] = useState<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
  } | null>(null);

  const conseilsCards = [
    {
      id: 'dates',
      title: 'Nos conseils pour des dates sans risque',
      subtitle: 'Voici les règles de base à respecter.',
      image: conseilsDates3D,
    },
    {
      id: 'chat',
      title: 'Engagez la conversation de la meilleure façon',
      subtitle: 'Voici quelques petits conseils',
      image: conseilsChat3D,
    },
    {
      id: 'consent',
      title: 'Votre consentement et celui des autres',
      subtitle: 'Quand le donner et quand le demander',
      image: conseilsConsent3D,
    },
    {
      id: 'scam',
      title: 'Évitez les scams',
      subtitle: 'Comment les repérer pour mieux vous protéger',
      image: conseilsScam3D,
    },
    {
      id: 'verify',
      title: 'La vérification : comment ça marche ?',
      subtitle: 'Découvrez comment cela assure votre sécurité sur Bavel',
      image: conseilsVerify3D,
    }
  ];

  const rencontresCards = [
    {
      id: 'prep',
      title: 'Comment se préparer pour un date',
      subtitle: 'Ce que vous pouvez faire pour rester en sécurité',
      image: datePrep3D,
    },
    {
      id: 'safety',
      title: "Comment être en sécurité lors d'un date",
      subtitle: 'Conseils pour des dates relax en toute sécurité',
      image: dateSafety3D,
    },
    {
      id: 'covid',
      title: 'On va peut-être se voir pendant la Covid',
      subtitle: 'Les conseils à garder en tête avant de se décider',
      image: dateCovid3D,
    }
  ];

  const wellbeingCards = [
    {
      id: 'start',
      title: 'Je ne sais pas par où commencer',
      subtitle: 'Ne vous inquiétez pas, nous allons vous aider.',
      image: wellbeingStart3D,
    },
    {
      id: 'rejected',
      title: 'Je me sens rejeté(e)',
      subtitle: "Que faire quand on n'a pas beaucoup de Matchs ou de réponses ?",
      image: wellbeingRejected3D,
    },
    {
      id: 'trust',
      title: 'Quelqu’un a abusé de ma confiance',
      subtitle: 'Ce que cela signifie et comment s’en remettre',
      image: wellbeingTrust3D,
    },
    {
      id: 'burnout',
      title: 'Je fais un burnout à cause du dating',
      subtitle: 'Voici ce que vous pouvez faire pour le surmonter',
      image: wellbeingBurnout3D,
    }
  ];

  const guideCards = [
    {
      id: 'attitude',
      title: 'Attitude nuisible',
      subtitle: "Comment gérer l'abus, le catfishing, etc.",
      bg: '#dcd3ff',
      textColor: '#1e1147',
      image: guideAttitude3D,
      content: [
        "Chez Bavel, nous prenons la sécurité très au sérieux. Les comportements irrespectueux ou abusifs ne sont pas tolérés.",
        "Si vous suspectez qu'un profil utilise de fausses photos (catfishing), ou si une personne tient des propos inappropriés, vous pouvez la bloquer et la signaler instantanément.",
        "Notre équipe de modération analyse les signalements 24h/24 pour préserver la bienveillance au sein de la communauté."
      ]
    },
    {
      id: 'rencontres',
      title: 'Rencontres en vrai',
      subtitle: 'Découvrez tous nos conseils pour des rencontres sans risque.',
      bg: '#fbcfe8',
      textColor: '#831843',
      image: guideRencontres3D,
      content: [
        "Planifiez toujours vos premiers rendez-vous dans un lieu public fréquenté (café, restaurant, parc animé).",
        "Informez un proche ou un ami de votre rendez-vous, de l'endroit et de l'heure prévus.",
        "Organisez votre propre moyen de transport pour aller au rendez-vous et en revenir.",
        "Ne vous sentez jamais forcé(e) de rester si vous ne vous sentez pas à l'aise."
      ]
    },
    {
      id: 'conseils',
      title: 'Conseils de sécurité',
      subtitle: 'À faire et à éviter quand on fait des rencontres en ligne',
      bg: '#fef08a',
      textColor: '#713f12',
      image: guideConseils3D,
      content: [
        "À FAIRE : Vérifiez votre profil avec la certification photo pour rassurer vos interlocuteurs.",
        "À FAIRE : Prenez le temps de discuter via l'application avant de partager vos coordonnées personnelles.",
        "À ÉVITER : Ne partagez jamais d'informations financières ou bancaires.",
        "À ÉVITER : N'envoyez jamais d'argent à une personne rencontrée en ligne, quelles que soient ses explications."
      ]
    },
    {
      id: 'bienetre',
      title: 'Bien-être mental',
      subtitle: "Trouvez de l'aide en cas d'anxiété, de burnout, etc.",
      bg: '#e0e7ff',
      textColor: '#1e1b4b',
      image: guideBienetre3D,
      content: []
    }
  ];

  const handleGuideClick = (card: typeof guideCards[0]) => {
    if (card.id === 'bienetre') {
      setShowWellbeingGrid(true);
    } else if (card.id === 'rencontres') {
      setShowRencontresGrid(true);
    } else if (card.id === 'conseils') {
      setShowConseilsGrid(true);
    } else if (card.id === 'attitude') {
      setShowHarmGrid(true);
    } else {
      setSelectedGuideDetail(card);
    }
  };

  const handleHeaderBack = () => {
    if (selectedWellbeingCard) {
      setSelectedWellbeingCard(null);
    } else if (showWellbeingGrid) {
      setShowWellbeingGrid(false);
    } else if (selectedRencontresCard) {
      setSelectedRencontresCard(null);
    } else if (showRencontresGrid) {
      setShowRencontresGrid(false);
    } else if (selectedConseilsCard) {
      setSelectedConseilsCard(null);
    } else if (showConseilsGrid) {
      setShowConseilsGrid(false);
    } else if (selectedHarmCard) {
      setSelectedHarmCard(null);
    } else if (showHarmGrid) {
      setShowHarmGrid(false);
    } else if (selectedGuideDetail) {
      setSelectedGuideDetail(null);
    } else {
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-purple-500/20 shrink-0 bg-[#18052e]/95 backdrop-blur-xl z-10">
        <button 
          onClick={handleHeaderBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-purple-300 hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.2} />
        </button>

        <h1 className="text-[17px] font-extrabold text-white tracking-tight">
          Centre de sécurité
        </h1>

        <div className="w-10 h-10" />
      </div>

      {/* Tabs Bar */}
      {!selectedGuideDetail && !showWellbeingGrid && !selectedWellbeingCard && !showRencontresGrid && !selectedRencontresCard && !showConseilsGrid && !selectedConseilsCard && !showHarmGrid && !selectedHarmCard && (
        <div className="flex border-b border-purple-500/15 bg-transparent shrink-0">
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex-1 py-3 text-[14.5px] font-bold transition-colors relative cursor-pointer ${activeTab === 'guides' ? 'text-white' : 'text-purple-300/60 hover:text-white'}`}
          >
            Guides
            {activeTab === 'guides' && (
              <motion.div 
                layoutId="safetyTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2dd4bf] to-[#ec4899]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('outils')}
            className={`flex-1 py-3 text-[14.5px] font-bold transition-colors relative cursor-pointer ${activeTab === 'outils' ? 'text-white' : 'text-purple-300/60 hover:text-white'}`}
          >
            Outils
            {activeTab === 'outils' && (
              <motion.div 
                layoutId="safetyTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2dd4bf] to-[#ec4899]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-3 text-[14.5px] font-bold transition-colors relative cursor-pointer ${activeTab === 'contacts' ? 'text-white' : 'text-purple-300/60 hover:text-white'}`}
          >
            Contacts
            {activeTab === 'contacts' && (
              <motion.div 
                layoutId="safetyTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#2dd4bf] to-[#ec4899]"
              />
            )}
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-hide pb-24">
        {selectedWellbeingCard ? (
          /* Wellbeing Single Card Detail View */
          <div className="bg-[#1f093a]/90 border border-purple-500/20 rounded-2xl p-5 pb-12 text-white shadow-xl mb-6">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white mb-1.5 leading-snug">
              {selectedWellbeingCard.title}
            </h2>
            <p className="text-[15px] text-purple-200/80 font-normal leading-relaxed mb-6">
              {selectedWellbeingCard.subtitle}
            </p>

            <div className="w-full h-48 sm:h-52 bg-[#130324] border border-purple-500/25 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
              <img 
                src={selectedWellbeingCard.image} 
                alt={selectedWellbeingCard.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article 1: Je ne sais pas par où commencer */}
            {selectedWellbeingCard.id === 'start' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Tout d'abord, nous tenons à vous dire que nous sommes vraiment très heureux que vous nous ayez rejoints ! Nous savons que se lancer (ou revenir après une pause) peut être difficile, mais nous sommes là pour vous.
                </p>
                <p>
                  Voici quelques conseils pour vous aider :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Soyez vous-même</h3>
                <p>
                  Pour faire des rencontres en toute honnêteté, vous dois vous montrer comme vous êtes sans filtre. Alors, n'ayez pas peur de montrer qui vous êtes, ce que vous aimez et ce que vous voulez.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Remplissez votre profil</h3>
                <p>
                  Les gens n'aiment pas les profils vides. Alors, passez un peu de temps sur le vôtre afin de mettre en valeur votre personnalité.
                </p>
                <ul className="space-y-2.5 my-3 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Ajoutez différentes photos montrant votre visage et votre sourire. Six est le nombre idéal.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Écrivez une description courte, mais de qualité. Pourquoi ne pas ajouter une anecdote à votre sujet pour susciter la conversation ?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Ajoutez vos centres d'intérêt pour que les gens sachent ce que vous aimez. Vous pourriez avoir beaucoup de choses en commun.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>
                      <span onClick={() => { onClose(); onOpenVerification?.(); }} className="underline font-medium text-black cursor-pointer hover:text-purple-600">Fais vérifier ton profil</span> pour montrer à tout le monde que tu n'es pas un fake.
                    </span>
                  </li>
                </ul>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Parcours les profils</h3>
                <p>
                  C'est là que ça devient intéressant ! Une fois que votre profil est prêt, vous pouvez commencer à parcourir Bavel pour rencontrer des personnes intéressantes et <span onClick={onClose} className="underline font-medium text-black cursor-pointer hover:text-purple-600">engager la conversation</span>.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Prenez votre temps</h3>
                <p>
                  Allez à votre rythme et ne vous mettez pas la pression. Prenez votre temps et amusez-vous bien.
                </p>
              </div>
            )}

            {/* Article 2: Je me sens rejeté(e) */}
            {selectedWellbeingCard.id === 'rejected' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  C'est décevant de ne pas avoir autant de Matchs ou de réponse qu'on l'espérait, mais cela ne doit pas ébranler votre confiance en vous. Ce n'est en aucun cas une indication de votre valeur.
                </p>
                <p>
                  Si vous vous sentez rejeté(e), consultez notre liste de choses à ne jamais oublier.
                </p>

                <ul className="space-y-3 my-3 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Si vous vous sentez indigne de trouver un Match, rappelez-vous que ce n'est pas vrai. Vous êtes formidable, et quelqu'un finira par le remarquer.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Les gens ne voient qu'une toute petite partie de qui vous êtes. Ils ne savent pas encore qui vous êtes vraiment.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Les rencontres ne devraient jamais vous faire vous sentir mal dans votre peau. Si c'est le cas, il est normal de faire une pause. Passez du temps à faire des choses que vous aimez.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Beaucoup de gens ont d'autres obligations et peuvent être occupés.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Il arrive souvent que nos membres désactivent les notifications ou ne consultent Bavel qu'à certains moments.</span>
                  </li>
                </ul>

                <p className="pt-2">
                  Il y a aussi pas mal de choses que vous pouvez faire pour améliorer vos chances.
                </p>

                <ul className="space-y-3 my-3 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Faites <span onClick={() => { onClose(); onOpenVerification?.(); }} className="underline font-medium text-black cursor-pointer hover:text-purple-600">vérifier votre profil</span> pour montrer que vous n'êtes pas fake.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Donnez vie à votre profil en y ajoutant une description de qualité, vos centres d'intérêt et des photos variées.</span>
                  </li>
                </ul>

                <p className="pt-2">
                  Quand vous trouvez un profil qui vous intéresse, posez une question ouverte ou utilisez des détails du profil pour <span onClick={onClose} className="underline font-medium text-black cursor-pointer hover:text-purple-600">engager la conversation</span>.
                </p>
              </div>
            )}

            {/* Article 3: Quelqu’un a abusé de ma confiance */}
            {selectedWellbeingCard.id === 'trust' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Lorsque quelqu'un abuse de votre confiance, vous pouvez vous sentir blessé(e) ou trahi(e). Nous savons que c'est difficile, c'est pourquoi nous sommes là pour vous aider.
                </p>
                <p>
                  L'abus de confiance peut prendre plusieurs formes. Par exemple, un utilisateur pourrait :
                </p>

                <ul className="space-y-3 my-3 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Vous voler. Cela peut être de l'argent ou, dans les cas les plus graves, votre identité.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Vous mentir au sujet de certaines parties de sa vie, comme sa situation amoureuse ou son travail.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Faire semblant d'être quelqu'un d'autre en utilisant un <span onClick={() => { onClose(); onOpenVerification?.(); }} className="underline font-medium text-black cursor-pointer hover:text-purple-600">profil fake</span>.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Partager vos photos intimes sans votre consentement pour vous faire souffrir. C'est ce qu'on appelle « revenge porn ».</span>
                  </li>
                </ul>

                <p className="pt-2">
                  Si quelqu'un a abusé de votre confiance, nous vous invitons à suivre les conseils ci-dessous.
                </p>

                <ul className="space-y-3 my-3 pl-1">
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Tout d'abord, vous pouvez <span onClick={onClose} className="underline font-medium text-black cursor-pointer hover:text-purple-600">Supprimer le Match</span> ou <span onClick={onClose} className="underline font-medium text-black cursor-pointer hover:text-purple-600">bloquer et signaler</span> l'utilisateur. De cette manière, il ne pourra plus vous envoyer de messages.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Ne vous en voulez pas, ce n'est pas votre faute.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>Faites une pause si vous en avez besoin, et revenez quand vous voulez.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[20px] text-gray-800 leading-none mt-0.5">•</span>
                    <span>N'abandonnez pas. Il y a plein de personnes géniales qui ont de bonnes intentions.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Article 4: Je fais un burnout à cause du dating */}
            {selectedWellbeingCard.id === 'burnout' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  On peut vite se sentir épuisé quand on fait des rencontres, surtout si les choses ne se passent pas aussi bien qu'on l'espérait. Le dating est source de burnout pour de nombreuses personnes.
                </p>
                <p>
                  Voici ce que vous pouvez pour vous sentir mieux.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Faites une pause</h3>
                <p>
                  Si vous ne vous sentez pas bien, il est normal de prendre un peu de recul. Il n'y a rien de mal à recommencer à zéro chaque fois que vous en avez besoin.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Prenez votre temps</h3>
                <p>
                  Si vous parcourez les profils sans trop réfléchir, vous risquez fortement de faire un burnout. Pensez aux types de personnes et de relations que vous recherchez et prenez votre temps pour les trouver.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-3">Prenez soin de vous</h3>
                <p>
                  Nous savons que les rencontres peuvent prendre beaucoup de temps. Bien que faire des rencontres soit excitant et puisse être vraiment très chouette, il est important que vous fassiez régulièrement un petit bilan personnel. Concentrez-vous sur d'autres choses que vous aimez faire et passez du temps avec vos amis et vos proches pour recharger vos batteries.
                </p>
              </div>
            )}
          </div>
        ) : showWellbeingGrid ? (
          /* WELLBEING 2x2 GRID VIEW */
          <div className="grid grid-cols-2 gap-3.5 pt-1">
            {wellbeingCards.map((card) => (
              <div 
                key={card.id}
                onClick={() => setSelectedWellbeingCard(card)}
                className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
              >
                <div className="h-36 bg-[#130324] relative overflow-hidden flex items-center justify-center p-2">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-t-[16px]"
                  />
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                  <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : selectedRencontresCard ? (
          /* Rencontres Single Card Detail View */
          <div className="bg-[#1f093a]/90 border border-purple-500/20 rounded-2xl p-5 pb-12 text-white shadow-xl mb-6">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white mb-1.5 leading-snug">
              {selectedRencontresCard.title}
            </h2>
            <p className="text-[15px] text-purple-200/80 font-normal leading-relaxed mb-6">
              {selectedRencontresCard.subtitle}
            </p>

            <div className="w-full h-48 sm:h-52 bg-[#130324] border border-purple-500/25 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
              <img 
                src={selectedRencontresCard.image} 
                alt={selectedRencontresCard.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Article 1: Comment se préparer pour un date */}
            {selectedRencontresCard.id === 'prep' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Organiser un premier rendez-vous est une étape excitante ! Voici nos conseils clés pour vous préparer sereinement et en toute sécurité.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">1. Choisissez un lieu public et animé</h3>
                <p>
                  Pour votre premier rendez-vous, privilégiez toujours un endroit fréquenté : un café, un restaurant, un musée ou un parc très animé. Évitez les endroits isolés ou le domicile de l'un ou de l'autre.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">2. Prévenez un ami ou un proche</h3>
                <p>
                  Partagez les détails de votre rendez-vous (lieu, heure et prénom de la personne) avec une personne de confiance. N'hésitez pas à lui envoyer un petit message pendant la soirée pour lui indiquer que tout va bien.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">3. Prenez votre propre moyen de transport</h3>
                <p>
                  Soyez autonome pour l'aller et le retour. Cela vous permet d'avoir un contrôle total sur l'heure à laquelle vous souhaitez repartir.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">4. Gardez le contrôle de votre consommation</h3>
                <p>
                  Gardez un œil sur votre verre à tout moment et ne consommez pas plus d'alcool que vous ne le souhaitez pour garder les idées claires.
                </p>
              </div>
            )}

            {/* Article 2: Comment être en sécurité lors d'un date */}
            {selectedRencontresCard.id === 'safety' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Pendant le rendez-vous, l'essentiel est de passer un bon moment tout en restant à l'écoute de votre ressenti.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Écoutez votre instinct</h3>
                <p>
                  Si quelque chose ne vous semble pas naturel ou vous met mal à l'aise, faites confiance à votre intuition. Vous n'avez aucune obligation de rester si vous ne le sentez pas.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Gardez vos affaires personnelles près de vous</h3>
                <p>
                  Conservez votre téléphone, votre portefeuille et vos clés en sécurité. Assurez-vous que votre téléphone est bien chargé avant de partir.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Ne vous précipitez pas</h3>
                <p>
                  Prenez le temps d'apprendre à connaître l'autre personne à votre propre rythme. N'ayez pas peur de poser des limites claires et respectueuses.
                </p>
              </div>
            )}

            {/* Article 3: On va peut-être se voir pendant la Covid */}
            {selectedRencontresCard.id === 'covid' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Rencontrer des personnes en période de précaution sanitaire demande un peu d'organisation supplémentaire pour que chacun se sente en confiance.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Communiquez en amont</h3>
                <p>
                  Discutez ensemble de votre niveau de confort respectif concernant les gestes barrières et les endroits choisis avant de fixer le rendez-vous.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Optez pour des activités en extérieur</h3>
                <p>
                  Une promenade dans un parc ou un verre en terrasse sont d'excellentes options pour se voir dans un cadre ouvert et plus aéré.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Essayez un premier rendez-vous virtuel</h3>
                <p>
                  Si vous avez le moindre doute ou si l'un de vous ne se sent pas bien, proposez un appel vidéo préalable. C'est une super étape intermédiaire pour briser la glace !
                </p>
              </div>
            )}
          </div>
        ) : showRencontresGrid ? (
          /* RENCONTRES EN VRAI GRID VIEW (REPRODUCING SCREENSHOT 100%) */
          <div className="pt-1 pb-12">
            {/* Top Row: 2 cards side-by-side */}
            <div className="grid grid-cols-2 gap-3.5">
              {rencontresCards.slice(0, 2).map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedRencontresCard(card)}
                  className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
                >
                  <div className="h-36 sm:h-40 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                    <img 
                      src={card.image} 
                      alt={card.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                    <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: 1 Full-Width Card */}
            <div 
              onClick={() => setSelectedRencontresCard(rencontresCards[2])}
              className="mt-3.5 flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
            >
              <div className="h-44 sm:h-48 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                <img 
                  src={rencontresCards[2].image} 
                  alt={rencontresCards[2].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-start bg-transparent">
                <h3 className="text-[17px] font-black text-white leading-tight tracking-tight mb-1">
                  {rencontresCards[2].title}
                </h3>
                <p className="text-[13px] text-purple-200/70 font-normal leading-snug">
                  {rencontresCards[2].subtitle}
                </p>
              </div>
            </div>
          </div>
        ) : selectedConseilsCard ? (
          /* Conseils de Securite Single Card Detail View */
          <div className="bg-[#1f093a]/90 border border-purple-500/20 rounded-2xl p-5 pb-12 text-white shadow-xl mb-6">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white mb-1.5 leading-snug">
              {selectedConseilsCard.title}
            </h2>
            <p className="text-[15px] text-purple-200/80 font-normal leading-relaxed mb-6">
              {selectedConseilsCard.subtitle}
            </p>

            <div className="w-full h-48 sm:h-52 bg-[#130324] border border-purple-500/25 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
              <SafetyIllustrationRenderer id={selectedConseilsCard.id} fallbackImage={selectedConseilsCard.image} />
            </div>

            {/* Article 1: Nos conseils pour des dates sans risque */}
            {selectedConseilsCard.id === 'dates' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Votre sécurité est notre priorité absolue. Lorsque vous faites des rencontres sur Bavel, voici les règles d'or à toujours garder à l'esprit :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Restez sur l'application au début</h3>
                <p>
                  Échangez via le chat de Bavel ou passez des appels vidéo directement dans l'application avant de donner votre numéro de téléphone ou vos réseaux sociaux.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Rendez-vous dans des lieux publics</h3>
                <p>
                  Pour vos premières rencontres physiques, choisissez toujours des lieux animés comme des cafés, bars ou restaurants. Ne donnez pas votre adresse personnelle.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Informez un proche</h3>
                <p>
                  Prévenez toujours un ami ou un membre de votre famille de l'endroit où vous allez et de la personne que vous rencontrez.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Gardez vos informations personnelles privées</h3>
                <p>
                  Ne partagez jamais vos documents d'identité, votre lieu de travail exact ou vos informations financières.
                </p>
              </div>
            )}

            {/* Article 2: Engagez la conversation de la meilleure façon */}
            {selectedConseilsCard.id === 'chat' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Engager la conversation avec un nouveau Match peut parfois sembler difficile. Voici quelques règles simples pour des échanges agréables et respectueux :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Personnalisez votre premier message</h3>
                <p>
                  Lisez la bio de votre Match et posez une question sur l'un de ses centres d'intérêt ou une de ses photos. Les messages personnalisés reçoivent beaucoup plus de réponses.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Soyez poli(e) et courtois(e)</h3>
                <p>
                  Un simple « Salut ! Comment vas-tu ? » suivi d'une touche d'humour ou d'une remarque sympa est toujours apprécié.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Respectez le rythme de chacun</h3>
                <p>
                  Chaque membre a son propre emploi du temps. Si votre Match met un peu de temps à répondre, ne vous inquiétez pas et laissez-lui le temps de vous répondre.
                </p>
              </div>
            )}

            {/* Article 3: Votre consentement et celui des autres */}
            {selectedConseilsCard.id === 'consent' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Le respect mutuel et le consentement clair sont la base de toute relation saine et épanouie.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Le consentement doit être enthousiaste et libre</h3>
                <p>
                  Un oui hésitant ou l'absence de réponse ne constitue pas un consentement. Chaque geste ou étape doit être accepté de bon cœur par les deux personnes.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Vous avez le droit de changer d'avis à tout moment</h3>
                <p>
                  Même si vous avez dit oui auparavant, vous pouvez choisir de dire non ou de vous arrêter dès que vous le souhaitez, sans aucune justification nécessaire.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Respectez les limites de votre partenaire</h3>
                <p>
                  Écoutez attentivement ce que votre interlocuteur exprime. Le respect de ses limites est essentiel pour instaurer un climat de confiance.
                </p>
              </div>
            )}

            {/* Article 4: Évitez les scams */}
            {selectedConseilsCard.id === 'scam' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Malheureusement, certains individus malveillants essaient d'abuser de la gentillesse des autres. Soyez vigilant(e) face aux tentatives d'escroquerie :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">N'envoyez JAMAIS d'argent</h3>
                <p>
                  Ne virez jamais d'argent et ne partagez jamais vos coordonnées bancaires, peu importe l'urgence ou la situation dramatique invoquée par votre interlocuteur.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Attention aux opportunités d'investissement suspectes</h3>
                <p>
                  Méfiez-vous des personnes qui vous proposent d'investir dans la cryptomonnaie, des placements financiers ou qui vous promettent des gains rapides.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Signalez immédiatement</h3>
                <p>
                  Si quelqu'un vous demande de l'argent ou vous semble suspect, utilisez le bouton <span onClick={onClose} className="underline font-medium text-black cursor-pointer hover:text-purple-600">Bloquer et Signaler</span>.
                </p>
              </div>
            )}

            {/* Article 5: La vérification : comment ça marche ? */}
            {selectedConseilsCard.id === 'verify' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  La vérification de profil garantit que la personne derrière l'écran est bien celle qu'elle prétend être.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Comment se faire vérifier ?</h3>
                <p>
                  C'est simple et ultra rapide ! Il vous suffit d'imiter une pose spécifique devant votre caméra frontale. Notre équipe compare ensuite votre photo avec votre profil.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Le badge bleu de confiance</h3>
                <p>
                  Une fois vérifié(e), un petit badge bleu apparaît sur votre profil. Cela augmente significativement le nombre de Matchs et rassure vos interlocuteurs.
                </p>

                <div className="pt-2">
                  <button 
                    onClick={() => { onClose(); onOpenVerification?.(); }}
                    className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-full text-[15px] active:scale-98 transition-transform shadow-xs"
                  >
                    Vérifier mon profil maintenant
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : showConseilsGrid ? (
          /* CONSEILS DE SECURITE GRID VIEW (100% FAITHFUL TO SCREENSHOTS) */
          <div className="pt-1 pb-12">
            {/* Row 1: Cards 0 and 1 */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {conseilsCards.slice(0, 2).map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedConseilsCard(card)}
                  className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
                >
                  <div className="h-36 sm:h-40 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                    <SafetyIllustrationRenderer id={card.id} fallbackImage={card.image} />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                    <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Cards 2 and 3 */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {conseilsCards.slice(2, 4).map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedConseilsCard(card)}
                  className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
                >
                  <div className="h-36 sm:h-40 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                    <SafetyIllustrationRenderer id={card.id} fallbackImage={card.image} />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                    <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3: Card 4 (Full Width) */}
            <div 
              onClick={() => setSelectedConseilsCard(conseilsCards[4])}
              className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
            >
              <div className="h-48 sm:h-52 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                <SafetyIllustrationRenderer id={conseilsCards[4].id} fallbackImage={conseilsCards[4].image} />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-start bg-transparent">
                <h3 className="text-[17px] font-black text-white leading-tight tracking-tight mb-1">
                  {conseilsCards[4].title}
                </h3>
                <p className="text-[13px] text-purple-200/70 font-normal leading-snug">
                  {conseilsCards[4].subtitle}
                </p>
              </div>
            </div>
          </div>
        ) : selectedHarmCard ? (
          /* Harmful Attitudes Single Card Detail View */
          <div className="bg-[#1f093a]/90 border border-purple-500/20 rounded-2xl p-5 pb-12 text-white shadow-xl mb-6">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white mb-1.5 leading-snug">
              {selectedHarmCard.title}
            </h2>
            <p className="text-[15px] text-purple-200/80 font-normal leading-relaxed mb-6">
              {selectedHarmCard.subtitle}
            </p>

            <div className="w-full h-48 sm:h-52 bg-[#130324] border border-purple-500/25 rounded-2xl flex items-center justify-center overflow-hidden mb-6">
              <SafetyIllustrationRenderer id={selectedHarmCard.id} fallbackImage={selectedHarmCard.image} />
            </div>

            {/* Article 1: J'ai reçu un message abusif */}
            {selectedHarmCard.id === 'abusive' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Les insultes, menaces ou propos haineux sont strictement interdits sur Bavel. Voici les démarches simples pour vous protéger immédiatement :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">1. Bloquez et signalez le membre</h3>
                <p>
                  Appuyez sur les trois petits points en haut à droite de la conversation et sélectionnez « Bloquer et Signaler ». La personne ne pourra plus jamais vous contacter ni voir votre profil.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">2. Ne répondez pas aux provocations</h3>
                <p>
                  Ne gaspillez pas votre énergie. Nos équipes de modération analysent automatiquement les signalements et prennent les mesures appropriées (avertissement ou bannissement définitif).
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">3. Utilisez les filtres de messages</h3>
                <p>
                  Activer la vérification de profil dans vos paramètres vous permet d'interagir en priorité avec des membres certifiés et bienveillants.
                </p>
              </div>
            )}

            {/* Article 2: Je suis victime de harcèlement */}
            {selectedHarmCard.id === 'harass' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Personne ne devrait subir d'insistance abusive ou de harcèlement. Nous sommes à vos côtés pour stopper ce comportement.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Zero tolérance contre le harcèlement</h3>
                <p>
                  Si quelqu'un insiste malgré votre refus ou vous suit sur d'autres plateformes, signalez-le nous immédiatement avec toutes les informations possibles.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Prenez des captures d'écran</h3>
                <p>
                  Conservez des preuves des messages si nécessaire. Cela aide notre équipe de sécurité à agir plus rapidement.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Besoin d'aide extérieure ?</h3>
                <p>
                  Consultez notre onglet « Contacts d'urgence » dans le Safety Centre pour contacter des lignes d'écoute gratuites et confidentielles.
                </p>
              </div>
            )}

            {/* Article 3: Je pense avoir trouvé un faux profil */}
            {selectedHarmCard.id === 'fake' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Le catfishing consiste à utiliser les photos d'une autre personne pour tromper les membres. Voici comment le repérer :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Indices d'un faux profil</h3>
                <p>
                  - Une seule photo disponible ou des images de qualité professionnelle irréelle.<br />
                  - Refus catégorique de faire un appel vidéo ou de se rencontrer en vrai.<br />
                  - Demande rapide de passer sur WhatsApp ou Telegram.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Demandez la vérification photo</h3>
                <p>
                  Proposez à votre Match de faire vérifier son profil grâce au badge bleu de Bavel. C'est le moyen le plus simple d'être sûr(e) de son identité !
                </p>
              </div>
            )}

            {/* Article 4: J'ai reçu une photo obscène */}
            {selectedHarmCard.id === 'obscene' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  L'envoi d'images à caractère sexuel non sollicitées est inacceptable. Bavel utilise une technologie de détection intelligente pour vous protéger.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Le Détecteur Privé de Bavel</h3>
                <p>
                  Notre outil floute automatiquement les images potentiellement explicites et vous demande votre accord avant de les afficher.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">Que faire si vous en recevez une ?</h3>
                <p>
                  N'ouvrez pas la photo, appuyez sur « Signaler la photo » directement depuis l'écran de floutage. L'expéditeur fera l'objet d'un examen disciplinaire immédiat.
                </p>
              </div>
            )}

            {/* Article 5: Que se passe-t-il après un signalement ? */}
            {selectedHarmCard.id === 'report' && (
              <div className="space-y-4 text-gray-700 text-[15px] leading-relaxed font-normal">
                <p>
                  Vous vous demandez ce qui se passe une fois que vous avez appuyé sur le bouton de signalement ? Voici les coulisses :
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">1. Signalement 100% anonyme</h3>
                <p>
                  La personne signalée ne saura jamais qui est à l'origine du signalement. Votre identité et votre sécurité sont préservées.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">2. Examen par nos équipes de modération</h3>
                <p>
                  Notre équipe de sécurité 24/7 analyse l'historique et le contenu incriminé dans les plus brefs délais.
                </p>

                <h3 className="text-[17px] font-extrabold text-black pt-2">3. Sanctions adaptées</h3>
                <p>
                  En fonction de la gravité : avertissement, suspension temporaire ou suppression définitive du compte avec bannissement de l'appareil.
                </p>
              </div>
            )}
          </div>
        ) : showHarmGrid ? (
          /* HARMFUL ATTITUDES (ATTITUDE NUISIBLE) GRID VIEW (100% FAITHFUL TO SCREENSHOTS) */
          <div className="pt-1 pb-12">
            {/* Row 1: Cards 0 and 1 */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {harmCards.slice(0, 2).map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedHarmCard(card)}
                  className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
                >
                  <div className="h-36 sm:h-40 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                    <SafetyIllustrationRenderer id={card.id} fallbackImage={card.image} />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                    <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Cards 2 and 3 */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
              {harmCards.slice(2, 4).map((card) => (
                <div 
                  key={card.id}
                  onClick={() => setSelectedHarmCard(card)}
                  className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
                >
                  <div className="h-36 sm:h-40 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                    <SafetyIllustrationRenderer id={card.id} fallbackImage={card.image} />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-start bg-transparent">
                    <h3 className="text-[15px] font-black text-white leading-tight tracking-tight mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-[12px] text-purple-200/70 font-normal leading-snug">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 3: Card 4 (Full Width) */}
            <div 
              onClick={() => setSelectedHarmCard(harmCards[4])}
              className="flex flex-col bg-[#1f093a]/90 border border-purple-500/25 rounded-[22px] overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50 shadow-md shadow-purple-950/40"
            >
              <div className="h-48 sm:h-52 bg-[#130324] relative overflow-hidden flex items-center justify-center">
                <SafetyIllustrationRenderer id={harmCards[4].id} fallbackImage={harmCards[4].image} />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-start bg-transparent">
                <h3 className="text-[17px] font-black text-white leading-tight tracking-tight mb-1">
                  {harmCards[4].title}
                </h3>
                <p className="text-[13px] text-purple-200/70 font-normal leading-snug">
                  {harmCards[4].subtitle}
                </p>
              </div>
            </div>
          </div>
        ) : selectedGuideDetail ? (
          /* Standard Guide Detail View */
          <div className="space-y-6">
            <div className="h-52 rounded-[22px] relative overflow-hidden shadow-sm">
              <img 
                src={selectedGuideDetail.image} 
                alt={selectedGuideDetail.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <h2 className="text-[22px] font-black tracking-tight text-white mb-1">{selectedGuideDetail.title}</h2>
                <p className="text-[13px] text-white/90 font-medium leading-snug">{selectedGuideDetail.subtitle}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {selectedGuideDetail.content.map((paragraph, idx) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <p className="text-[14px] text-gray-800 leading-relaxed font-normal">{paragraph}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedGuideDetail(null)}
              className="w-full bg-black text-white font-bold py-3.5 rounded-full text-[15px] active:scale-98 transition-transform shadow-xs"
            >
              Compris
            </button>
          </div>
        ) : activeTab === 'guides' ? (
          /* TAB 1: GUIDES MAIN LIST */
          <div className="space-y-6">
            <div className="text-center pt-2 pb-1">
              <h2 className="text-[22px] font-black text-black tracking-tight flex items-center justify-center gap-1.5">
                Bienvenue, {userName} <span className="inline-block">👋</span>
              </h2>
              <p className="text-[13.5px] text-gray-500 font-normal mt-1 max-w-[280px] mx-auto leading-snug">
                Suivez nos conseils pour faire des rencontres en toute sécurité
              </p>
            </div>

            <div className="space-y-5">
              {guideCards.map((card) => (
                <div 
                  key={card.id}
                  onClick={() => handleGuideClick(card)}
                  className="group rounded-[22px] border border-purple-500/25 bg-[#1f093a]/90 shadow-lg shadow-purple-950/40 overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:border-purple-400/50"
                >
                  <div className="h-48 relative overflow-hidden bg-[#130324] flex items-center justify-center">
                    <SafetyIllustrationRenderer id={card.id} fallbackImage={card.image} />
                  </div>
                  <div className="p-4 bg-transparent text-white">
                    <h3 className="text-[17px] font-extrabold text-white mb-0.5">{card.title}</h3>
                    <p className="text-[13px] text-purple-200/80 leading-snug">{card.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'outils' ? (
          /* TAB 2: OUTILS */
          <div className="space-y-6">
            <div>
              <h2 className="text-[20px] font-black text-white tracking-tight mb-4">
                Comment rester en sécurité
              </h2>

              <div className="space-y-2.5">
                <button 
                  onClick={() => alert("Pour bloquer ou signaler un profil, rendez-vous sur le profil ou la conversation concernée et appuyez sur les 3 points en haut à droite.")}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Bloquer et signaler un profil</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>

                <button 
                  onClick={() => alert("Pour supprimer un match, ouvrez la discussion, appuyez sur le menu des options et choisissez 'Supprimer des matchs'.")}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Supprimer quelqu'un de vos Matchs</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>

                <button 
                  onClick={() => {
                    onClose();
                    onOpenVerification?.();
                  }}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Faire vérifier votre profil</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>

                <button 
                  onClick={() => {
                    onClose();
                    onOpenConfidentiality?.();
                  }}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Gérer votre confidentialité</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>

                <button 
                  onClick={() => {
                    onClose();
                    onOpenInvisibleMode?.();
                  }}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Activer le mode Invisible</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-[20px] font-black text-white tracking-tight mb-4">
                Nous sommes là pour vous
              </h2>

              <div className="space-y-2.5">
                <button 
                  onClick={() => alert("Masquage des images non sollicitées")}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Masquage des images non sollicitées</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>

                <button 
                  onClick={() => alert("Détection des messages insultants")}
                  className="w-full bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] px-5 py-4 text-left font-bold text-[14.5px] text-white flex items-center justify-between hover:bg-purple-900/40 hover:border-purple-500/40 active:scale-[0.99] transition-all"
                >
                  <span>Détection des messages insultants</span>
                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 3: CONTACTS */
          <div className="space-y-6">
            <div>
              <h2 className="text-[20px] font-black text-white tracking-tight mb-4">
                Santé mentale
              </h2>

              <div 
                onClick={() => window.open('https://www.sos-amitie.org/', '_blank')}
                className="bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] p-5 flex items-center justify-between cursor-pointer hover:bg-purple-900/40 hover:border-purple-500/40 transition-colors active:scale-[0.99]"
              >
                <div className="pr-2">
                  <h3 className="text-[16px] font-bold text-white mb-1">SOS Amitié</h3>
                  <p className="text-[12.5px] text-purple-200/80 leading-snug">
                    Service d'écoute 24h/24, 7 jours sur 7, pour ceux qui traversent une mauvaise période
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-400 shrink-0 ml-2" />
              </div>
            </div>

            <div>
              <h2 className="text-[20px] font-black text-white tracking-tight mb-4">
                Sécurité physique
              </h2>

              <div className="space-y-3">
                <div 
                  onClick={() => window.open('https://www.pre-plainte-en-ligne.gouv.fr/', '_blank')}
                  className="bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] p-5 flex items-center justify-between cursor-pointer hover:bg-purple-900/40 hover:border-purple-500/40 transition-colors active:scale-[0.99]"
                >
                  <div className="pr-2">
                    <h3 className="text-[16px] font-bold text-white mb-1">Pré-plainte En Ligne</h3>
                    <p className="text-[12.5px] text-purple-200/80 leading-snug">
                      Contactez les services d'urgence pour tout type de violence, de vol ou d'agression
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 shrink-0 ml-2" />
                </div>

                <div 
                  onClick={() => window.open('https://www.allo119.gouv.fr/', '_blank')}
                  className="bg-[#1f093a]/80 border border-purple-500/20 rounded-[20px] p-5 flex items-center justify-between cursor-pointer hover:bg-purple-900/40 hover:border-purple-500/40 transition-colors active:scale-[0.99]"
                >
                  <div className="pr-2">
                    <h3 className="text-[16px] font-bold text-white mb-1">Enfance En Danger</h3>
                    <p className="text-[12.5px] text-purple-200/80 leading-snug">
                      Service gratuit, 24h/24, 7j/7, pour les jeunes confrontés au danger ou à la violence
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 shrink-0 ml-2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface CommunityCharterMenuProps {
  onClose: () => void;
}

export function CommunityCharterMenu({ onClose }: CommunityCharterMenuProps) {
  const [showConsentSheet, setShowConsentSheet] = useState(true);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans"
    >
      {/* Top bar close button */}
      <div className="flex items-center justify-end p-4 pt-10 shrink-0 z-20">
        <button 
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-white" strokeWidth={2.2} />
        </button>
      </div>

      {/* Main Document Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-1 pb-36 scrollbar-hide text-purple-200/90">
        <h1 className="text-[26px] font-black text-white leading-[1.2] mb-5 tracking-tight">
          Bavel Lignes directrices communautaires
        </h1>

        <p className="text-[14px] text-purple-200/80 leading-[1.5] mb-4 font-normal">
          Le site Bavel est un espace où l'on peut nouer des relations bienveillantes en toute sécurité, de manière inclusive et respectueuse. Afin de favoriser des relations saines et équitables, nous tenons nos membres responsables de la manière dont ils se traitent les uns les autres.
        </p>

        <p className="text-[14px] text-purple-200/80 leading-[1.5] mb-8 font-normal">
          Notre Charte de la communauté contribue à la sécurité de nos membres. Elle indique clairement quels contenus et quels comportements ne sont pas acceptables (sur notre plateforme et en dehors).
        </p>

        {/* SECTION: Directives pour le profil */}
        <h2 className="text-[19px] font-extrabold text-white mb-4 tracking-tight border-b border-purple-500/20 pb-2">
          Directives pour le profil
        </h2>

        <div className="space-y-5 mb-8">
          <div>
            <p className="text-[14px] text-purple-200/90 leading-relaxed">
              <strong className="font-extrabold text-white">Âge.</strong> Vous devez avoir au moins 18 ans pour vous inscrire sur Bavel. Il est interdit de créer un profil qui vous présente intentionnellement comme une personne âgée de moins de 18 ans. Nous nous réservons le droit de vous demander une pièce d'identité pour vérifier votre âge, et nous vous bloquerons sur la plateforme si vous n'avez pas l'âge requis.
            </p>
          </div>

          <div>
            <p className="text-[14px] text-purple-200/90 leading-relaxed mb-2">
              <strong className="font-extrabold text-white">Photos de profil.</strong> Nous voulons que votre profil mette en valeur votre personnalité authentique ! C'est pourquoi nous exigeons qu'au moins une de vos photos de profil ne représente que vous et montre clairement votre visage en entier. Nous n'autorisons pas :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] text-purple-300/80 leading-snug">
              <li>Les photos de profil fortement déformées ou contenant des effets numériques exagérés ou non naturels au point qu'il n'est pas possible de déterminer clairement que vous êtes la personne figurant sur les photos</li>
              <li>Les symboles, icônes, cadres ou autocollants superposés qui ne proviennent pas de Bavel sur vos photos de profil</li>
              <li>Les mèmes ou photos comportant uniquement - ou principalement - du texte comme photo de profil</li>
              <li>Les photos de profil d'enfants seuls</li>
              <li>Les photos de profil avec des enfants non vêtus</li>
            </ul>
          </div>

          <div>
            <p className="text-[14px] text-purple-200/90 leading-relaxed mb-2">
              <strong className="font-extrabold text-white">Nom d'utilisateur.</strong> Les membres sont autorisés à utiliser des initiales, des abréviations, des versions contractées ou abrégées de leur nom, des surnoms, des noms complets et des seconds prénoms. Les membres ne sont pas obligés d'utiliser leur nom légal ou leur nom complet, mais les noms d'utilisateur doivent être une représentation authentique du nom que vous utilisez dans la vie de tous les jours. Nous n'autorisons pas :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13.5px] text-purple-300/80 leading-snug">
              <li>Tout mot ou phrase qui enfreint nos directives communautaires</li>
              <li>L'utilisation du nom d'une célébrité ou d'un personnage fictif</li>
              <li>Des mots ou des caractères (autres qu'un nom valide), y compris des mots descriptifs, des symboles ($, *, @, etc.), émojis, chiffres ou ponctuation</li>
              <li>Des informations issues de réseaux sociaux ou de plateformes de messagerie</li>
            </ul>
          </div>
        </div>

        {/* SECTION: Contenu et règles de conduite */}
        <h2 className="text-[20px] font-black text-white mb-5 tracking-tight border-b border-purple-500/20 pb-2">
          Contenu et règles de conduite
        </h2>

        <div className="space-y-6 mb-8">
          <div>
            <h3 className="text-[16px] font-extrabold text-white mb-1">Nudité et activité sexuelle chez les adultes</h3>
            <p className="text-[13.5px] text-purple-200/90 leading-relaxed">
              Nous n'autorisons pas le contenu de profils nus, sexuellement explicites ou sexuellement vulgaires. Nous n'autorisons pas non plus l'échange commercial d'activités, de contenus ou de services à caractère romantique ou sexuel.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-extrabold text-white mb-1">Brimades et comportements abusifs</h3>
            <p className="text-[13.5px] text-purple-200/90 leading-relaxed">
              Notre communauté a pour but de créer des liens amicaux. Nous n'autorisons pas les contenus ou les comportements qui font qu'une personne ou un groupe se sent harcelé, intimidé ou pris pour cible.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-extrabold text-white mb-1">Exploitation et abus sexuels des enfants</h3>
            <p className="text-[13.5px] text-purple-200/90 leading-relaxed">
              Nous appliquons une politique de tolérance zéro à l'égard de toute forme d'exploitation et d'abus sexuels des enfants.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-extrabold text-white mb-1">Activité commerciale et promotionnelle</h3>
            <p className="text-[13.5px] text-purple-200/90 leading-relaxed">
              Notre plateforme n'est pas une place de marché. Nous n'autorisons pas l'utilisation de Bavel à des fins commerciales ou promotionnelles non sollicitées.
            </p>
          </div>

          <div>
            <h3 className="text-[16px] font-extrabold text-white mb-1">La haine identitaire</h3>
            <p className="text-[13.5px] text-purple-200/90 leading-relaxed">
              Nous souhaitons favoriser une communauté diversifiée et inclusive sur Bavel. Nous interdisons tout contenu ou comportement haineux ou dégradant.
            </p>
          </div>
        </div>

        {/* SECTION: Rapports de sécurité */}
        <h2 className="text-[20px] font-black text-white mb-3 tracking-tight border-b border-purple-500/20 pb-2">
          Rapports de sécurité
        </h2>
        <div className="space-y-3 mb-8 text-[13.5px] text-purple-200/90 leading-relaxed">
          <p>
            La sécurité est une priorité absolue sur Bavel. Nous utilisons une combinaison de modérateurs humains et de systèmes automatisés pour surveiller et examiner les comptes.
          </p>
          <p>
            Nos membres jouent un rôle essentiel dans la sécurité de Bavel en signalant le contenu ou le comportement suspect.
          </p>
        </div>
      </div>

      {/* Confidentiality choices overlay sheet */}
      <AnimatePresence>
        {showConsentSheet && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 bg-[#1e0735] text-white rounded-t-[28px] shadow-[0_-12px_45px_rgba(0,0,0,0.6)] border-t border-purple-500/30 px-6 pt-6 pb-8 z-30 flex flex-col"
          >
            {/* Logo */}
            <div className="mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2dd4bf] via-[#ec4899] to-[#8b5cf6] text-[28px] font-black tracking-tight block pb-1">
                Bavel
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[19px] font-extrabold text-white mb-3 leading-snug">
              Vos choix en matière de confidentialité
            </h3>

            {/* Body Text */}
            <div className="space-y-3 text-[12.5px] text-purple-200/80 leading-snug mb-6">
              <p>
                Nous utilisons des services qui nous permettent de vous proposer des fonctionnalités ciblées et d'optimiser votre expérience mobile.
              </p>
              <p>
                Vos données personnelles et photos sont protégées selon les normes de chiffrement et de sécurité les plus strictes.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowConsentSheet(false)}
              className="w-full bg-gradient-to-r from-[#2dd4bf] via-[#ec4899] to-[#8b5cf6] text-white font-bold text-[15px] py-3.5 rounded-full shadow-lg shadow-purple-950/40 active:scale-98 transition-all text-center cursor-pointer"
            >
              Continuer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

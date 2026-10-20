import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface TermsOfServiceMenuProps {
  onClose: () => void;
}

export function TermsOfServiceMenu({ onClose }: TermsOfServiceMenuProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-[#16042c] via-[#1f093a] to-[#0d021a] text-white z-[120] flex flex-col h-full overflow-hidden select-none font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pt-10 pb-3 px-4 bg-[#18052e]/95 backdrop-blur-xl border-b border-purple-500/20 shrink-0 relative">
        <button 
          onClick={onClose} 
          className="p-1 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer z-10"
          aria-label="Retour"
        >
          <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
        </button>
        <h2 className="text-[16px] font-bold text-white tracking-tight absolute left-1/2 -translate-x-1/2 max-w-[220px] truncate">
          Conditions d'utilisation
        </h2>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-purple-200/90 text-[13.5px] leading-relaxed scrollbar-hide pb-2">
        <div>
          <h1 className="text-[20px] font-black text-white mb-1">Conditions d'utilisation de Bavel</h1>
          <p className="text-[12px] text-purple-300/70 font-medium">
            Si vous habitez en dehors des États-Unis, les présentes Conditions d'utilisation s'appliquent à vous. Si vous habitez aux États-Unis, les conditions générales de Bavel s'appliquent à vous.
          </p>
        </div>

        {/* Résumé */}
        <div className="bg-[#200a38]/85 border border-purple-500/25 rounded-2xl p-4 space-y-2.5 text-purple-100 shadow-md">
          <h2 className="text-[15px] font-black text-white">Résumé</h2>
          <p className="text-[12.5px] text-purple-200/80">
            Merci de bien vouloir lire attentivement l'intégralité des présentes Conditions générales d'utilisation car elles s'appliquent lors de chaque connexion au site Bavel et dès que vous y utilisez l'une de ses fonctionnalités. Voici un résumé des points essentiels abordés :
          </p>
          <ul className="space-y-2 text-[12px] text-gray-700 list-disc pl-4">
            <li>L'accès à Bavel est interdit aux personnes physiques de moins de 18 ans car c'est un réseau social réservé aux adultes.</li>
            <li>La société Bavel ne peut être tenue pour responsable de l'ensemble des publications ou déclarations faites sur le site. Nous ne surveillons pas le contenu publié sur le site. Toutefois, si nous remarquons ou si un utilisateur nous signale du contenu que nous jugeons inapproprié, nous nous réservons le droit de le supprimer.</li>
            <li>Si vous publiez du contenu ne vous appartenant pas, sans l'aval de son propriétaire et que ce dernier s'y oppose (ou fait appel à un avocat), notre responsabilité ne saurait être engagée. Vous devez assumer l'entière responsabilité de ce que vous publiez.</li>
            <li>Veuillez également consulter notre charte de la communauté et nos conseils sur la sécurité pour de plus amples informations sur la protection de votre vie privée.</li>
            <li>Pour savoir comment Bavel utilise vos données personnelles, veuillez consulter notre Politique de confidentialité. Vous y trouverez des informations sur la manière dont nous traitons vos données personnelles et protégeons votre confidentialité lorsque vous utilisez Bavel.</li>
          </ul>
        </div>

        {/* Mentions légales complètes */}
        <div className="space-y-5 pt-2">
          <h2 className="text-[17px] font-black text-black border-b border-gray-100 pb-2">Mentions légales complètes</h2>
          
          <p className="text-gray-700">
            Le site et l'application Bavel sont un réseau social conçu comme un forum où vous pouvez rencontrer de nouvelles personnes, discuter et partager des photos, des nouvelles et des informations. Il est destiné à être un endroit sympathique à visiter et il est important pour nous (et pour vous) qu'il reste un environnement sûr et convivial.
          </p>

          <p className="text-gray-700">
            Les Conditions constituent un accord juridique contraignant entre vous en tant qu'utilisateur (« vous ») et le groupe Bavel (« nous »). Le groupe Bavel comprend, mais sans s'y limiter, Bavel Trading Limited (1 Blossom Yard, Fourth Floor, London E1 6RS), Social Online Payments Limited et Social Online Payments, Inc.
          </p>

          <div className="bg-red-50/50 border border-red-100 p-3 rounded-xl text-[12px] text-red-900 font-medium">
            SI VOUS N'ÊTES PAS D'ACCORD ET N'ACCEPTEZ PAS LES CONDITIONS, VOUS NE DEVEZ PAS ACCÉDER OU UTILISER L'APPLICATION OU LE SITE.
          </div>

          {/* 1. Utilisation */}
          <div className="space-y-2">
            <h3 className="text-[14.5px] font-bold text-black">1. Utilisation du site et de l'application, et règles relatives au contenu</h3>
            <p className="font-semibold text-[13px] text-gray-900">Qui peut utiliser Bavel ?</p>
            <p className="text-gray-700">
              Bavel est un lieu de rencontre pour les adultes. Vous pouvez utiliser Bavel et ses fonctionnalités, ou vous y inscrire, uniquement si vous avez 18 ans ou plus.
            </p>
            <p className="font-semibold text-[13px] text-gray-900 pt-1">Quel genre de contenu est-ce que je peux publier ou télécharger sur Bavel ?</p>
            <p className="text-gray-700">
              Vous pouvez publier ou télécharger toutes sortes de choses sur Bavel, y compris des photos, des e-mails, des messages et autres contenus (« Contenus »). Vous ne pouvez pas publier de contenu illégal, diffamatoire, obscène, haineux, commercial ou portant atteinte aux droits de tiers.
            </p>
            <p className="font-semibold text-[13px] text-gray-900 pt-1">Puis-je utiliser les données personnelles d'autres utilisateurs ?</p>
            <p className="text-gray-700">
              Vous pouvez uniquement utiliser les informations personnelles d'autres utilisateurs de Bavel dans le but de faire de nouvelles connaissances. Il vous est strictement interdit d'utiliser leurs informations à des fins commerciales, de spam ou de harcèlement.
            </p>
          </div>

          {/* 2. Propriété */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">2. Propriété du Contenu</h3>
            <p className="text-gray-700">
              Vous restez propriétaire du Contenu que vous soumettez sur Bavel. En publiant du Contenu, vous nous accordez une licence non exclusive, libre de droits, mondiale pour l'utiliser et le diffuser dans le cadre du fonctionnement du service.
            </p>
          </div>

          {/* 3. Services payants */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">3. Services payants</h3>
            <p className="text-gray-700">
              Bavel vous offre la possibilité d'acheter des Services Premium ou des Crédits. Si vous souscrivez un abonnement à renouvellement automatique, il sera automatiquement reconduit à moins de l'annuler au moins 24 heures avant la fin de la période en cours.
            </p>
            <p className="text-gray-700 text-[12.5px] bg-gray-50 p-2.5 rounded-lg">
              Les crédits inutilisés expirent 6 mois après la date d'achat.
            </p>
          </div>

          {/* 4. Accès */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">4. Accès au site et à l'application</h3>
            <p className="text-gray-700">
              Bavel est fourni « en l'état ». Nous ne pouvons garantir un fonctionnement ininterrompu en raison des nécessités de maintenance et des événements hors de notre contrôle.
            </p>
          </div>

          {/* 5. Résiliation */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">5. Résiliation du profil par l'utilisateur</h3>
            <p className="text-gray-700">
              Vous pouvez à tout moment résilier votre inscription en allant dans vos « Paramètres », et en cliquant sur « Supprimer mon profil ». Vous disposez de 28 jours pour réactiver votre compte s'il a été désactivé temporairement.
            </p>
          </div>

          {/* 6. Abus */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">6. Abus et plaintes</h3>
            <p className="text-gray-700">
              Vous pouvez signaler tout abus ou toute plainte en cliquant sur « Signaler un abus » sur le profil concerné ou en contactant notre équipe Bavel.
            </p>
          </div>

          {/* 7 - 12 */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">7. Politique de Confidentialité</h3>
            <p className="text-gray-700">
              Nous traitons vos données conformément à notre Politique de confidentialité.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">8. Liens & 9. Limitation de responsabilité</h3>
            <p className="text-gray-700">
              Vous êtes seul responsable de vos agissements sur notre site et de leurs conséquences vis-à-vis des autres utilisateurs.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h3 className="text-[14.5px] font-bold text-black">10. Dédommagement & 11. Programmes Bêta</h3>
            <p className="text-gray-700">
              Les Conditions, ainsi que tout litige en rapport avec elles, sont régies par la loi anglaise.
            </p>
          </div>

          {/* À propos & Entrée en vigueur */}
          <div className="bg-gray-50 p-4 rounded-2xl space-y-2 border border-gray-100 mt-4">
            <p className="font-bold text-[13px] text-black">À propos de nous</p>
            <p className="text-[12px] text-gray-600">
              www.lovel.com est un site et une application détenus et exploités par Bavel Trading Limited. Enregistré en Angleterre sous le numéro 07540255. Siège social : 1 Blossom Yard, Fourth Floor, London E1 6RS.
            </p>
            <p className="font-extrabold text-[11.5px] text-gray-500 pt-2">
              Dernière mise à jour des Conditions générales d'utilisation : 28 octobre 2025.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

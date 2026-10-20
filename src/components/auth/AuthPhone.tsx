import React from 'react';
import { motion } from 'motion/react';
import { Phone, ArrowRight } from 'lucide-react';
import { AuthError } from './shared/AuthError';

interface AuthPhoneProps {
  countryCode: string;
  setCountryCode: (code: string) => void;
  phoneNumber: string;
  setPhoneNumber: (num: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

const COUNTRY_CODES = [
  { code: '+33', label: '🇫🇷 France (+33)' },
  { code: '+1', label: '🇺🇸 USA/Canada (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
  { code: '+49', label: '🇩🇪 Allemagne (+49)' },
  { code: '+34', label: '🇪🇸 Espagne (+34)' },
  { code: '+39', label: '🇮🇹 Italie (+39)' },
  { code: '+32', label: '🇧🇪 Belgique (+32)' },
  { code: '+41', label: '🇨🇭 Suisse (+41)' },
];

export const AuthPhone: React.FC<AuthPhoneProps> = ({
  countryCode,
  setCountryCode,
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  isLoading,
  error,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col space-y-4 max-w-sm mx-auto w-full my-auto"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Votre numéro de téléphone</h2>
        <p className="text-xs text-white/70">
          Nous vous enverrons un code de vérification par SMS.
        </p>
      </div>

      <AuthError message={error} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-4 pt-2"
      >
        <div className="flex space-x-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-2 py-3 text-xs text-white focus:outline-none focus:border-[#e20030]"
          >
            {COUNTRY_CODES.map((c, idx) => (
              <option key={`${c.code}-${idx}`} value={c.code} className="bg-gray-900 text-white">
                {c.label}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="06 12 34 56 78"
              required
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e20030]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#e20030] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 hover:bg-[#c10028] transition-all cursor-pointer shadow-lg text-sm"
        >
          <span>Envoyer le code SMS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
};

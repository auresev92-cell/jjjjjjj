import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { AuthError } from './shared/AuthError';

interface AuthOTPProps {
  digits: string[];
  setDigit: (index: number, val: string) => void;
  onVerify: (code?: string) => void;
  onResend: () => void;
  isLoading: boolean;
  error: string | null;
  resendCooldown: number;
  phoneNumber: string;
  countryCode: string;
}

export const AuthOTP: React.FC<AuthOTPProps> = ({
  digits,
  setDigit,
  onVerify,
  onResend,
  isLoading,
  error,
  resendCooldown,
  phoneNumber,
  countryCode,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const codeDigits = value.slice(0, 6).split('');
      codeDigits.forEach((d, i) => setDigit(i, d));
      if (codeDigits.length === 6) {
        onVerify(codeDigits.join(''));
      }
      return;
    }

    setDigit(index, value);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto verify if last digit filled
    const nextDigits = [...digits];
    nextDigits[index] = value;
    if (nextDigits.every((d) => d !== '')) {
      onVerify(nextDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col space-y-4 max-w-sm mx-auto w-full my-auto"
    >
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-white">Code de vérification</h2>
        <p className="text-xs text-white/70">
          Entrez le code envoyé au {countryCode} {phoneNumber}
        </p>
      </div>

      <AuthError message={error} />

      <div className="flex justify-center space-x-2 py-4">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-13 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-[#e20030]"
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onResend}
          disabled={resendCooldown > 0 || isLoading}
          className="text-xs text-white/70 hover:text-white flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {resendCooldown > 0
              ? `Renvoyer (${resendCooldown}s)`
              : 'Renvoyer le code'}
          </span>
        </button>

        <button
          onClick={() => onVerify()}
          disabled={isLoading || digits.some((d) => !d)}
          className="bg-[#e20030] text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-2 disabled:opacity-40 cursor-pointer shadow"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Valider</span>
        </button>
      </div>
    </motion.div>
  );
};

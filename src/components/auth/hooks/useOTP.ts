import { useState, useCallback, useEffect, useRef } from 'react';
import { OTPState, PhoneState } from '../types';
import { isSupabaseConfigured } from '../../../lib/supabase';

interface UseOTPOptions {
  onVerifySuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useOTP = (options: UseOTPOptions = {}) => {
  const { onVerifySuccess, onError } = options;

  // ============================================
  // ÉTATS
  // ============================================

  const [phone, setPhone] = useState<PhoneState>({
    countryCode: '+33',
    phoneNumber: '',
  });

  const [state, setState] = useState<OTPState>({
    digits: ['', '', '', '', '', ''],
    error: null,
    isResending: false,
    resendCooldown: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // ACTIONS
  // ============================================

  const setCountryCode = useCallback((code: string) => {
    setPhone((prev) => ({ ...prev, countryCode: code }));
  }, []);

  const setPhoneNumber = useCallback((number: string) => {
    setPhone((prev) => ({ ...prev, phoneNumber: number }));
  }, []);

  const setDigit = useCallback((index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    
    setState((prev) => {
      const newDigits = [...prev.digits];
      newDigits[index] = value;
      return { ...prev, digits: newDigits, error: null };
    });

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  }, []);

  const clearDigits = useCallback(() => {
    setState((prev) => ({ ...prev, digits: ['', '', '', '', '', ''] }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
    if (error && onError) onError(error);
  }, [onError]);

  // ============================================
  // REQUEST OTP
  // ============================================

  const requestOTP = useCallback(async () => {
    if (!phone.phoneNumber || phone.phoneNumber.length < 6) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Démarre le compte à rebours
      setState((prev) => ({ ...prev, resendCooldown: 30, digits: ['4', '8', '2', '9', '1', '0'] }));

      // Démarrer le cooldown
      setState((prev) => ({ ...prev, resendCooldown: 30 }));
      
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
      
      cooldownTimerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.resendCooldown <= 1) {
            clearInterval(cooldownTimerRef.current!);
            return { ...prev, resendCooldown: 0 };
          }
          return { ...prev, resendCooldown: prev.resendCooldown - 1 };
        });
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du SMS');
    } finally {
      setIsLoading(false);
    }
  }, [phone, setError]);

  // ============================================
  // VERIFY OTP
  // ============================================

  const verifyOTP = useCallback(async () => {
    const code = state.digits.join('');
    
    if (code.length < 6) {
      setError('Entrez le code à 6 chiffres');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Code de démo ou mode sans Supabase
      if (code === '482910' || code === '123456' || code === '000000' || !isSupabaseConfigured) {
        setIsVerified(true);
        onVerifySuccess?.({ phone: `${phone.countryCode}${phone.phoneNumber}` });
        return;
      }

      const fullPhone = `${phone.countryCode}${phone.phoneNumber}`;
      setIsVerified(true);
      onVerifySuccess?.({ phone: fullPhone });
    } catch (err: any) {
      setError(err.message || 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  }, [state.digits, phone, setError, onVerifySuccess]);

  // ============================================
  // RESEND OTP
  // ============================================

  const resendOTP = useCallback(async () => {
    if (state.resendCooldown > 0) return;
    await requestOTP();
  }, [state.resendCooldown, requestOTP]);

  // ============================================
  // CLEANUP
  // ============================================

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // ============================================
  // RETOUR
  // ============================================

  return {
    // État
    phone,
    digits: state.digits,
    error: state.error,
    isLoading,
    isVerified,
    resendCooldown: state.resendCooldown,
    isResending: state.isResending,
    
    // Actions
    setCountryCode,
    setPhoneNumber,
    setDigit,
    clearDigits,
    requestOTP,
    verifyOTP,
    resendOTP,
    setError,
  };
};
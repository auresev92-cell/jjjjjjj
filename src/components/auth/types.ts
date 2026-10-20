export type AuthMode = 'main' | 'email' | 'phone' | 'otp';
export type EmailTab = 'login' | 'signup';

export interface AuthState {
  mode: AuthMode;
  emailTab: EmailTab;
  isLoading: boolean;
  error: string | null;
}

export interface PhoneState {
  countryCode: string;
  phoneNumber: string;
}

export interface OTPState {
  digits: string[];
  error: string | null;
  isResending: boolean;
  resendCooldown: number;
}

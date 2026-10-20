import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, ShieldCheck, CreditCard, Smartphone, Sparkles, CheckCircle2, Lock, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { playSynthAudio, triggerHaptic } from '../../utils/audio';

export interface PaymentItem {
  type: 'credits' | 'subscription';
  title: string;
  amount: string; // e.g. "59,99 €" or "3 500 FCFA"
  creditsToAdd?: number;
  creditsAmount?: number;
  subscriptionPlan?: 'extra' | 'premium';
  description?: string;
}

interface PaymentCheckoutModalProps {
  item: PaymentItem;
  onClose: () => void;
  onSuccess: (item: PaymentItem) => void;
}

export function PaymentCheckoutModal({ item, onClose, onSuccess }: PaymentCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange' | 'mtn' | 'moov' | 'card' | 'apple_pay'>('wave');
  const [phoneNumber, setPhoneNumber] = useState('07 00 11 22 33');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const paymentMethods = [
    {
      id: 'wave',
      name: 'Wave Côte d\'Ivoire',
      tag: '0% de frais',
      color: 'bg-[#1dc8fe]',
      textColor: 'text-black',
      icon: '🌊',
      desc: 'Paiement instantané via votre compte Wave'
    },
    {
      id: 'orange',
      name: 'Orange Money',
      tag: '#144#',
      color: 'bg-[#ff7900]',
      textColor: 'text-white',
      icon: '🍊',
      desc: 'Code OTP reçu par SMS sur votre numéro'
    },
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      tag: '*133#',
      color: 'bg-[#ffcc00]',
      textColor: 'text-black',
      icon: '💛',
      desc: 'Validation directe sur votre téléphone'
    },
    {
      id: 'moov',
      name: 'Moov Money',
      tag: '*155#',
      color: 'bg-[#005ba9]',
      textColor: 'text-white',
      icon: '💙',
      desc: 'Paiement sécurisé Flooz'
    },
    {
      id: 'card',
      name: 'Carte Bancaire (Visa / Mastercard)',
      tag: '3D Secure',
      color: 'bg-[#111]',
      textColor: 'text-white',
      icon: '💳',
      desc: 'Chiffrement bancaire AES-256'
    }
  ];

  const handlePay = () => {
    setIsProcessing(true);
    triggerHaptic('medium');

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      const generatedTxId = `TX-LOVEL-${Math.floor(100000 + Math.random() * 900000)}`;
      setTransactionId(generatedTxId);
      playSynthAudio('credit_purchase');
      triggerHaptic('success');

      setTimeout(() => {
        onSuccess(item);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none font-sans">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        onClick={isProcessing ? undefined : onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="relative bg-white rounded-t-[28px] max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl z-10"
      >
        {/* Top Handle */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-black text-black tracking-tight">Finaliser votre commande</h2>
            <p className="text-[12px] text-gray-500 font-medium">Paiement 100% sécurisé et instantané</p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-black disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
          {/* Order Summary Card */}
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#480A2B] text-white flex items-center justify-center text-[18px] shadow-xs">
                {item.type === 'credits' ? '🪙' : '👑'}
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-black">{item.title}</h3>
                <p className="text-[12px] text-gray-600">
                  {item.description || (item.creditsToAdd ? `+${item.creditsToAdd} crédits ajoutés immédiatement` : 'Activation immédiate des fonctionnalités')}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[17px] font-black text-[#480A2B]">{item.amount}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 block mb-2 px-0.5">
              Choisissez votre mode de paiement
            </label>

            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => {
                      setSelectedMethod(method.id as any);
                      triggerHaptic('light');
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-black bg-gray-50 shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[20px]">{method.icon}</span>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-[14px] font-bold text-black">{method.name}</span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-gray-200/70 text-gray-700 rounded-md">
                            {method.tag}
                          </span>
                        </div>
                        <span className="text-[11.5px] text-gray-500 mt-0.5">{method.desc}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic input depending on method */}
          {selectedMethod !== 'card' ? (
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-1.5">
              <label className="text-[12px] font-bold text-gray-700">Numéro Mobile Money (Côte d'Ivoire)</label>
              <div className="flex items-center bg-white rounded-xl border border-gray-300 px-3 py-2.5 space-x-2">
                <span className="text-[13px] font-extrabold text-gray-500">+225</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="07 XX XX XX XX"
                  className="w-full text-[14px] font-bold text-black outline-none bg-transparent"
                />
              </div>
              <p className="text-[11px] text-gray-500">Un message de confirmation instantané sera envoyé sur ce numéro.</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-200/80 space-y-2.5">
              <div>
                <label className="text-[11.5px] font-bold text-gray-700">Numéro de carte</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full mt-1 bg-white rounded-xl border border-gray-300 px-3 py-2 text-[13.5px] font-bold text-black outline-none"
                />
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="text-[11.5px] font-bold text-gray-700">Expiration</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/AA"
                    className="w-full mt-1 bg-white rounded-xl border border-gray-300 px-3 py-2 text-[13.5px] font-bold text-black outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11.5px] font-bold text-gray-700">CVC</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    className="w-full mt-1 bg-white rounded-xl border border-gray-300 px-3 py-2 text-[13.5px] font-bold text-black outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Assurance Guarantee */}
          <div className="flex items-center space-x-2 py-1 text-gray-500 text-[11.5px] justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Paiement crypté SSL 256 bits • Reçu par email et SMS</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <button
            onClick={handlePay}
            disabled={isProcessing || isCompleted}
            className="w-full py-4 rounded-full bg-[#111] hover:bg-black text-white font-extrabold text-[15px] flex items-center justify-center space-x-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Sécurisation et débit en cours...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Paiement validé avec succès !</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Payer {item.amount}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

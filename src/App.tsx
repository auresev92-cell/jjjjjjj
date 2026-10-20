import React, { useEffect, useState } from 'react';
import { MobileApp } from './components/MobileApp';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { UXProvider } from './context/UXContext';
import { ToastProvider } from './components/ui';
import { NetworkStatusBanner, ActionSheet, ConfirmDialog } from './components/ux';
import { OfflineSyncStatus } from './features/offline';
import { prefetchFeatureChunks } from './routes';
import { logSupabaseDiagnosticReport } from './lib/supabase';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { IPhoneStatusBar, IPhoneHomeIndicator } from './components/shared/IPhoneSimulationBar';
import { Smartphone, Maximize2 } from 'lucide-react';

// using standard html div

function AppContent() {
  const { user } = useAuth();
  const activeUserId = user?.id || 'guest_user';
  const [simulationMode, setSimulationMode] = useState<boolean>(true);

  const appUser = user ? {
    id: user.id,
    name: user.name || 'Steven',
    email: user.email || 'steven@bavel.app',
    age: (user as any).age || 34,
    gender: ((user as any).gender as 'male' | 'female') || 'male',
    city: (user as any).city || 'Abidjan',
    bio: (user as any).bio || 'Passionné de musique et de voyages',
    avatarUrl: (user as any).avatarUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
    verified: true,
  } : undefined;

  return (
    <NotificationProvider userId={activeUserId}>
      <UXProvider>
        <ToastProvider>
          <div className="bg-[#f8fafc] sm:bg-gradient-to-br sm:from-slate-100 sm:via-rose-50/30 sm:to-purple-50/20 text-slate-900 antialiased min-h-[100dvh] w-full flex items-center justify-center p-0 sm:p-4 selection:bg-[#f43f5e] selection:text-white overflow-hidden relative">
            <NetworkStatusBanner />
            <ActionSheet />
            <ConfirmDialog />
            <OfflineSyncStatus />

            {/* Bouton de contrôle Mode Simulation / Plein écran (visible sur desktop/tablette) */}
            <div className="hidden sm:flex fixed top-4 right-4 z-50 items-center gap-2 bg-white/95 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-slate-700">
              <button
                onClick={() => setSimulationMode(!simulationMode)}
                className="flex items-center gap-1.5 hover:text-rose-600 transition-colors cursor-pointer"
                title="Basculer le cadre de simulation iPhone"
              >
                {simulationMode ? (
                  <>
                    <Smartphone className="w-4 h-4 text-rose-500" />
                    <span>Mode iPhone 16 Pro</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 text-purple-600" />
                    <span>Mode Plein écran</span>
                  </>
                )}
              </button>
            </div>

            {/* Cadre de Simulation iPhone 16 Pro - Thème Clair & Lumineux */}
            <main
              data-mobile-root="true"
              className={`relative w-full @container mobile-app-root ${
                simulationMode
                  ? 'h-[100dvh] sm:h-[94dvh] sm:max-h-[920px] sm:max-w-[430px] sm:rounded-[48px] sm:border-[8px] sm:border-slate-300 sm:shadow-[0_25px_70px_rgba(15,23,42,0.15),0_0_0_1px_rgba(0,0,0,0.06)]'
                  : 'h-[100dvh] sm:max-w-md sm:rounded-2xl sm:shadow-xl sm:border sm:border-slate-200'
              } bg-white text-slate-900 overflow-hidden flex flex-col justify-between mx-auto transition-all duration-300`}
            >
              {/* Boutons matériels simulés sur les tranches (iPhone 16 Pro sur desktop/tablette uniquement) */}
              {simulationMode && (
                <>
                  {/* Action button & Volume */}
                  <div className="hidden sm:block absolute -left-[11px] top-[105px] w-[3px] h-[26px] bg-slate-300 rounded-l-xs pointer-events-none" />
                  <div className="hidden sm:block absolute -left-[11px] top-[148px] w-[3px] h-[50px] bg-slate-300 rounded-l-xs pointer-events-none" />
                  <div className="hidden sm:block absolute -left-[11px] top-[208px] w-[3px] h-[50px] bg-slate-300 rounded-l-xs pointer-events-none" />
                  {/* Power button */}
                  <div className="hidden sm:block absolute -right-[11px] top-[160px] w-[3px] h-[75px] bg-slate-300 rounded-r-xs pointer-events-none" />
                </>
              )}

              {/* Barre d'état iPhone & Dynamic Island (Affichée sur desktop pour simulation, masquée sur mobile réel pour éviter les icônes en double) */}
              {simulationMode && (
                <div className="hidden sm:block">
                  <IPhoneStatusBar />
                </div>
              )}

              {/* Atmospheric Glows clairs */}
              <div className="absolute -top-16 -left-16 w-72 h-72 bg-purple-100/50 rounded-full blur-[90px] pointer-events-none" />
              <div className="absolute top-1/3 -right-20 w-80 h-80 bg-rose-100/40 rounded-full blur-[90px] pointer-events-none" />

              {/* App Viewport Inner Container - Typographie et hauteur ajustées */}
              <div
                className={`relative flex-1 w-full h-full overflow-hidden flex flex-col z-10 ${
                  simulationMode
                    ? 'sm:pt-11 sm:pb-2 pt-[env(safe-area-inset-top,0px)]'
                    : 'pt-[env(safe-area-inset-top,0px)]'
                }`}
              >
                <MobileApp user={appUser as any} />
              </div>

              {/* Indicateur Home iOS (Affiché sur desktop pour simulation, géré nativement sur mobile réel) */}
              {simulationMode && (
                <div className="hidden sm:block">
                  <IPhoneHomeIndicator />
                </div>
              )}
            </main>
          </div>
        </ToastProvider>
      </UXProvider>
    </NotificationProvider>
  );
}

export default function App() {
  useEffect(() => {
    logSupabaseDiagnosticReport();
    prefetchFeatureChunks();
  }, []);

  return (
    <ErrorBoundary fallbackTitle="Interruption temporaire de Bavel">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}




import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Activity, 
  Database, 
  KeyRound, 
  Globe, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { 
  getSupabaseDiagnostics, 
  testSupabaseConnection, 
  SupabaseDiagnosticReport, 
  SupabaseConnectionTestResult 
} from '../../lib/supabase';

export function SupabaseConnectionTest() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnosticReport | null>(null);
  const [tableName, setTableName] = useState('_bavel_dummy_check_');
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<SupabaseConnectionTestResult | null>(null);

  // Refresh diagnostic report when opened
  useEffect(() => {
    if (isOpen) {
      setDiagnostics(getSupabaseDiagnostics());
    }
  }, [isOpen]);

  const runTest = async (overrideTable?: string) => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const targetTable = overrideTable || tableName || '_bavel_dummy_check_';
      const result = await testSupabaseConnection(targetTable);
      setTestResult(result);
      // Also update diagnostics in case client changed
      setDiagnostics(getSupabaseDiagnostics());
    } catch (err: any) {
      setTestResult({
        success: false,
        networkReachable: false,
        status: 'EXCEPTION',
        latencyMs: 0,
        message: err?.message || 'Erreur inattendue lors de l\'exécution du test',
        category: 'network_unreachable',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      {/* Discreet floating trigger adapted for mobile (does not obstruct primary navigation) */}
      <div className="fixed bottom-3 right-3 z-50 select-none">
        {!isOpen ? (
          <button
            id="supabase-connection-test-trigger"
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/85 hover:bg-slate-900 active:scale-95 text-white/90 hover:text-white rounded-full shadow-lg backdrop-blur-md border border-slate-700/60 transition-all text-xs font-medium cursor-pointer"
            title="Ouvrir le test de connexion Supabase"
            aria-label="Ouvrir le test de diagnostic Supabase"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] tracking-tight">Test Supabase</span>
          </button>
        ) : null}
      </div>

      {/* Test Modal / Bottom Drawer for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slideUp sm:animate-scaleIn"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-white">
                    Diagnostic Réseau Supabase
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Validation client &amp; test de passerelle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 active:scale-90 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-slate-800">
              {/* Environment Status Pills */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Configuration Client Locale
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* URL Status */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-500" />
                      Hôte URL
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 truncate" title={diagnostics?.urlHost}>
                      {diagnostics?.urlHost || 'Chargement...'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {diagnostics?.hasUrl ? '✅ Chargée' : '❌ Manquante'}
                    </span>
                  </div>

                  {/* Anon Key Status */}
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-amber-500" />
                      Clé Anon
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-700 truncate">
                      {diagnostics?.anonKeyPrefix ? `${diagnostics.anonKeyPrefix}` : 'Aucune'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {diagnostics?.anonKeyLength ? `${diagnostics.anonKeyLength} octets` : '0 car.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Source détectée:</span>
                  <span className="font-mono text-[10px] bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded">
                    {diagnostics?.urlSource || 'auto'}
                  </span>
                </div>
              </div>

              {/* Table selector & Trigger Button */}
              <div className="space-y-2">
                <label 
                  htmlFor="supabase-test-table-input"
                  className="block text-xs font-medium text-slate-700"
                >
                  Table cible à sonder (SELECT limit 1) :
                </label>
                <div className="flex gap-2">
                  <input
                    id="supabase-test-table-input"
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="_bavel_dummy_check_"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setTableName('_bavel_dummy_check_')}
                    className="px-2 py-1 text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg active:scale-95 transition-colors"
                    title="Utiliser une table fictive"
                  >
                    Fictive
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableName('profiles')}
                    className="px-2 py-1 text-[11px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg active:scale-95 transition-colors font-medium"
                    title="Tester la table des profils"
                  >
                    profiles
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => runTest()}
                disabled={isRunning}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-sm transition-all min-h-[44px] cursor-pointer ${
                  isRunning 
                    ? 'bg-slate-700 opacity-80 cursor-wait' 
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                }`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Requête réseau vers Supabase en cours...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>Exécuter le test de connexion</span>
                  </>
                )}
              </button>

              {/* Test Result Card */}
              {testResult && (
                <div 
                  className={`rounded-xl p-3.5 border transition-all text-xs space-y-2 ${
                    testResult.success
                      ? testResult.category === 'success'
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : 'bg-blue-50/90 border-blue-300 text-blue-950'
                      : testResult.category === 'auth_error'
                        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                        : 'bg-rose-50/90 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-[13px]">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : testResult.category === 'auth_error' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {testResult.category === 'success' && 'Connexion & Table Validées'}
                        {testResult.category === 'table_not_found_but_connected' && 'Réseau Supabase 100% OK'}
                        {testResult.category === 'auth_error' && 'Serveur joint mais clé invalide'}
                        {testResult.category === 'network_unreachable' && 'Échec Réseau'}
                        {testResult.category === 'unknown' && 'Réponse reçue'}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/80 shadow-xs border border-current">
                      ⚡ {testResult.latencyMs} ms
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed font-normal">
                    {testResult.message}
                  </p>

                  {testResult.errorDetails && (
                    <div className="mt-2 p-2 bg-white/70 rounded-lg font-mono text-[10px] text-slate-700 break-words border border-slate-200/60">
                      <strong>Détails:</strong> {testResult.errorDetails}
                    </div>
                  )}

                  {/* Clarification guide */}
                  <div className="pt-1.5 text-[11px] opacity-85 border-t border-current/20 leading-snug">
                    {testResult.category === 'table_not_found_but_connected' && (
                      <span>
                        💡 <strong>Conclusion :</strong> Vos paramètres client sont valides et votre navigateur communique sans entrave avec le serveur Supabase.
                      </span>
                    )}
                    {testResult.category === 'network_unreachable' && (
                      <span>
                        ⚠️ <strong>Conclusion :</strong> La requête n'a pas pu quitter le navigateur (blocage d'accès réseau, DNS ou CORS).
                      </span>
                    )}
                    {testResult.category === 'auth_error' && (
                      <span>
                        ⚠️ <strong>Conclusion :</strong> Le réseau fonctionne mais la clé anonyme doit être vérifiée dans vos réglages Supabase.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">Rapport console actif au démarrage</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 active:scale-95 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default SupabaseConnectionTest;

'use client';

import { useEffect, useState } from 'react';

export default function SynchronisationButtons() {
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncLog, setSyncLog] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (syncLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 5) + 2; // Avance entre 2 et 6%
        });
      }, 250);
    }

    return () => clearInterval(interval);
  }, [syncLoading]);

  const sync = async (direction: 'remote_to_local' | 'local_to_remote') => {
    const confirmationMessage =
      direction === 'remote_to_local'
        ? 'Confirmez-vous la synchronisation de Render vers Local ?'
        : 'Confirmez-vous la synchronisation de Local vers Render ?';

    const confirmed = window.confirm(confirmationMessage);
    if (!confirmed) return;

    setSyncLoading(true);
    setSyncLog(null);
    setProgress(0);

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, debug: true }),
      });

      const data = await res.json();
      setProgress(100);

      if (data.success) {
        setSyncLog(`✅ ${data.message || 'Synchronisation terminée avec succès.'}`);
      } else {
        setSyncLog(`❌ ${data.error || 'Erreur inconnue.'}`);
      }
    } catch (err) {
      setProgress(100);
      setSyncLog('❌ Erreur lors de la synchronisation.');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-xl space-y-4 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800">Synchronisation des données</h2>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={() => sync('remote_to_local')}
          disabled={syncLoading}
        >
          🔄 Render ➝ Local
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={() => sync('local_to_remote')}
          disabled={syncLoading}
        >
          🔼 Local ➝ Render
        </button>
      </div>

      {/* Barre de progression et messages */}
      {(syncLoading || syncLog) && (
        <div className="space-y-2 mt-2">
          <div className="relative w-full h-6 rounded-full overflow-hidden bg-gray-200 shadow-inner">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background: progress === 100 && syncLog?.startsWith('✅')
                  ? 'linear-gradient(to right, #00c851, #007e33)'
                  : progress === 100 && syncLog?.startsWith('❌')
                  ? 'linear-gradient(to right, #ff4444, #cc0000)'
                  : 'linear-gradient(to right, #00c6ff, #0072ff)',
              }}
            ></div>
            <div className="absolute w-full h-full flex items-center justify-center font-medium text-gray-800">
              {progress}%
            </div>
          </div>

          <div className="text-center text-sm text-gray-700 italic">
            {syncLoading
              ? 'Veuillez patienter pendant la synchronisation...'
              : syncLog}
          </div>

          {progress === 100 && syncLog && (
            <div className="flex justify-center">
              <button
                className="mt-2 px-4 py-1 text-sm bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setSyncLog(null);
                  setProgress(0);
                }}
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

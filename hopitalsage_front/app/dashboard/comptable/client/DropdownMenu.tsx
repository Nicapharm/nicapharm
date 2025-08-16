// DropdownMenu.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DropdownMenu({ clientId }: { clientId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(`/dashboard/comptable/client/${clientId}/${path}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button onClick={() => setIsOpen((prev) => !prev)} className="p-2 hover:bg-gray-100 rounded-full transition">
        <ChevronDown size={20} />
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1 text-sm text-gray-700">
              <button onClick={() => handleNavigation('examen')} className="w-full text-left px-4 py-2 hover:bg-blue-50">
                🩺 Examen
              </button>
              <button onClick={() => handleNavigation('ordonnance')} className="w-full text-left px-4 py-2 hover:bg-blue-50">
                💊 Ordonnance
              </button>
              <button onClick={() => handleNavigation('rendez-vous')} className="w-full text-left px-4 py-2 hover:bg-blue-50">
                📅 Rendez-vous
              </button>
              <button onClick={() => handleNavigation('dossier-medical')} className="w-full text-left px-4 py-2 hover:bg-blue-50">
                📁 Dossier
              </button>
            </div>
          </div>
          <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}

export { DropdownMenu };
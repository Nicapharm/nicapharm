// DropdownMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

type Props = { clientId: number };

export default function DropdownMenu({ clientId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // pour l'anim d'apparition
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();

  const MENU_WIDTH = 176; // correspond à Tailwind w-44 (44 * 4)

  const handleNavigation = (path: string) => {
    router.push(`/dashboard/pharmacie/client/${clientId}/${path}`);
    setIsOpen(false);
  };

  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    // Positionner le menu sous le bouton, aligné à droite (comme un vrai dropdown)
    let left = r.right - MENU_WIDTH; // align right
    if (left < 8) left = 8; // padding de sécurité à gauche
    const top = r.bottom + 8; // 8px de marge sous le bouton

    // Empêcher de sortir de l'écran à droite
    const maxLeft = window.innerWidth - MENU_WIDTH - 8;
    if (left > maxLeft) left = maxLeft;

    setPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;

    // Position initiale
    updatePosition();
    // Animation (lancer à la frame suivante pour éviter le flash)
    const id = requestAnimationFrame(() => setMounted(true));

    const onResizeScroll = () => updatePosition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('resize', onResizeScroll, { passive: true });
    window.addEventListener('scroll', onResizeScroll, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', onResizeScroll);
      window.removeEventListener('scroll', onResizeScroll);
      window.removeEventListener('keydown', onKey);
      setMounted(false);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        onClick={() => setIsOpen((v) => !v)}
        className="p-2 hover:bg-gray-100 rounded-full transition"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <ChevronDown size={20} />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Overlay pour click extérieur */}
            <div
              className="fixed inset-0 z-[999] cursor-default"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu positionné en fixed, ancré au bouton */}
            <div
              role="menu"
              className="z-[1000] fixed w-44 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/10 focus:outline-none"
              style={{
                top: pos.top,
                left: pos.left,
                // Petite anim d'apparition
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.98)',
                transition: 'opacity 120ms ease-out, transform 120ms ease-out',
              }}
            >
              <div className="py-1 text-sm text-gray-700">
                <button
                  onClick={() => handleNavigation('examen')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50"
                  role="menuitem"
                >
                  🩺 Examen
                </button>
                <button
                  onClick={() => handleNavigation('ordonnance')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50"
                  role="menuitem"
                >
                  💊 Ordonnance
                </button>
                <button
                  onClick={() => handleNavigation('rendez-vous')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50"
                  role="menuitem"
                >
                  📅 Rendez-vous
                </button>
                <button
                  onClick={() => handleNavigation('dossier-medical')}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50"
                  role="menuitem"
                >
                  📁 Dossier
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

export { DropdownMenu };

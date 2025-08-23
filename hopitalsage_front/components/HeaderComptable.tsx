'use client';

import { LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';

interface Pharmacie {
  id: number;
  nom_pharm: string;
  adresse_pharm: string;
  telephone: string | null;
  date_expiration?: string;
  est_expiree: boolean;
}

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string | null;
  role: string;
  pharmacie: number;
}

interface HeaderPharmacieProps {
  pharmacie: Pharmacie;
  user: User;
}

const HeaderPharmacie = ({ pharmacie, user }: HeaderPharmacieProps) => {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [openMenu, setOpenMenu] = useState<null | 'main' | 'clientUser'>(null);
  const router = useRouter();

  const menuRefs = {
    main: useRef<HTMLDivElement>(null),
    clientUser: useRef<HTMLDivElement>(null),
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout/`, {
          refresh: refreshToken,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });
      }
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const toggleExpand = (label: string) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  type MenuItem = {
    href?: string;
    label: string;
    icon: React.ReactNode;
    isTitle?: boolean;
    submenu?: {
      href: string;
      label: string;
      icon: React.ReactNode;
    }[];
  };

  const renderSubmenu = (submenu: MenuItem["submenu"], parentKey: string, isOpen: boolean) => (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key={parentKey}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {submenu?.map((item, index) => (
            <Link href={item.href} key={index}>
              <div className="flex items-center gap-3 px-6 py-2 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-sm text-gray-700 dark:text-white transition cursor-pointer">
                <span>{item.icon}</span>
                <span className="ml-2">{item.label}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderMenu = (items: MenuItem[], refKey: 'main' | 'clientUser') => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute left-0 mt-2 w-72 bg-white dark:bg-emerald-900 rounded-xl shadow-xl z-50 overflow-hidden"
      ref={menuRefs[refKey]}
    >
      {items.map((item, index) => (
        <div key={index}>
          {!item.isTitle ? (
            <Link href={item.href!} onClick={() => setOpenMenu(null)}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-sm font-medium cursor-pointer">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          ) : (
            <div>
              <div
                className="flex items-center justify-between px-4 py-3 font-semibold cursor-pointer bg-emerald-200 dark:bg-emerald-800 text-gray-800 dark:text-white"
                onClick={() => toggleExpand(item.label)}
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${expandedMenus[item.label] ? 'rotate-180' : ''}`}
                  />
                )}
              </div>
              {item.submenu && renderSubmenu(item.submenu, item.label, !!expandedMenus[item.label])}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !menuRefs.main.current?.contains(event.target as Node) &&
        !menuRefs.clientUser.current?.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainMenuItems: MenuItem[] = [
    {
      label: 'Produits',
      icon: '💊',
      submenu: [
        { href: '/dashboard/pharmacie/nouvel-medicament-pharmacie/afficher-medicament', label: 'Liste des produits', icon: '📦' },
        { href: '/dashboard/pharmacie/nouveau-lot/', label: 'Liste de Lots des produits', icon: '📦' },
        { href: '/dashboard/pharmacie/produit-perimer/', label: 'Gestion de Peremption', icon: '📦' },
      ],
      isTitle: true,
    },
    {
      label: 'Approvisionnement',
      icon: '📦',
      submenu: [
        { href: '/dashboard/pharmacie/commade-chez-fournisseur', label: 'Nouvelle commande', icon: '🛒' },
        { href: '/dashboard/pharmacie/commade-chez-fournisseur/reception', label: 'Confirmer réception', icon: '📩' },
        { href: '/dashboard/directeur/historique-commande-reception', label: 'Historique commandes', icon: '📜' },
      ],
      isTitle: true,
    },
    {
      label: 'Vente',
      icon: '🛍️',
      submenu: [
        { href: '/dashboard/pharmacie/vente', label: 'Faite la vente ici', icon: '🛒' },
        { href: '/dashboard/pharmacie/client/ajouter-client', label: 'Creer Nouveau Client', icon: '👨⚕️' },
        { href: '/dashboard/directeur/historique-vente', label: 'Rapport Cloture', icon: '⏳' },
        { href: '/dashboard/directeur/historique-user-vente', label: 'Historique de vente Percepteur', icon: '📊' },
      ],
      isTitle: true,
    },
    {
      label: 'Gestion de Stock',
      icon: '🧮',
      submenu: [
        { href: '/dashboard/directeur/rapport', label: 'Rapport global', icon: '🔍' },
        { href: '/dashboard/directeur/requisition', label: 'Requisition', icon: '🔄' },
        { href: '/dashboard/pharmacie/alertstock', label: 'Alertes rupture', icon: '🚨' },
        { href: '/dashboard/pharmacie/depense', label: 'Gestion de Depense', icon: '📅' },
      ],
      isTitle: true,
    },
  ];

  const clientUserMenuItems: MenuItem[] = [
    {
      label: 'Utilisateurs',
      icon: '👤',
      submenu: [
        { href: '/dashboard/directeur/create-comptable', label: 'Ajouter un utilisateur', icon: '➕' },
      ],
      isTitle: true,
    },
    {
      label: 'Clients',
      icon: '🧑‍🤝‍🧑',
      submenu: [
        { href: '/dashboard/pharmacie/client/afficher-client', label: 'Liste des clients', icon: '📁' },
        { href: '/dashboard/pharmacie/client/ajouter-client', label: 'Ajouter un client', icon: '➕' },
        { href: '/dashboard/directeur/taux-echange', label: 'Modifier Taux Echange', icon: '$' },
      ],
      isTitle: true,
    },
  ];

  // ✅ Calculer les jours restants dynamiquement
  const joursRestants = (() => {
    if (!pharmacie.date_expiration) return null;

    const expirationDate = new Date(pharmacie.date_expiration);
    const today = new Date();

    expirationDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = expirationDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="sticky top-0 z-40 flex justify-between items-center px-8 py-5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 dark:from-emerald-900 dark:via-emerald-800 dark:to-emerald-700 shadow-md backdrop-blur-md"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'main' ? null : 'main')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100/30 hover:bg-emerald-200/40 text-white rounded-xl text-sm"
          >
            🧭 Menu Principal
          </button>
          <AnimatePresence>
            {openMenu === 'main' && renderMenu(mainMenuItems, 'main')}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'clientUser' ? null : 'clientUser')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100/30 hover:bg-emerald-200/40 text-white rounded-xl text-sm"
          >
            👥 Gestion utilisateurs
          </button>
          <AnimatePresence>
            {openMenu === 'clientUser' && renderMenu(clientUserMenuItems, 'clientUser')}
          </AnimatePresence>
        </div>

        {/* ✅ Affichage des jours restants */}
      
        {pharmacie.est_expiree && (
          <div className="text-sm text-red-100 bg-red-600 px-3 py-1 rounded-lg ml-4">
            ❌ Abonnement expiré
          </div>
        )}
      </div>

      {/* User + profil */}
      <div className="flex items-center gap-4 text-white">
        {user.profile_picture && (
          <Image
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${user.profile_picture}`}
            alt="Photo de profil"
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <Link href="#" className="hover:text-yellow-300">
          <UserCircle size={22} />
        </Link>
        <div className="text-sm font-medium">{user.first_name} {user.last_name}</div>
        <button onClick={handleLogout} className="hover:text-red-300">
          <LogOut size={20} />
        </button>
      </div>
    </motion.header>
  );
};

export default HeaderPharmacie;

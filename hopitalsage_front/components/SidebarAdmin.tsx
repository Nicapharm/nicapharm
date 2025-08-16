'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FaChartLine,
  FaHospital,
  FaUserTie,
  FaCog,
  FaBoxOpen,
  FaIndustry,
  FaDollarSign,
  FaMapMarkedAlt,
  FaBullhorn,
  FaChevronDown,
  FaChevronRight,
  FaSignOutAlt,
} from 'react-icons/fa'

interface SidebarProps {
  userRole: string // superuser, admin, directeur, comptable
}

const SidebarAdmin = ({ userRole }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const sections = [
    {
      title: 'Pharmacie',
      icon: <FaHospital />,
      items: [
        {
          label: 'Ajouter PHARMACIE',
          icon: <FaHospital />,
          path: '/dashboard/superadmin/create_pharmacie',
        },
        {
          label: 'Ajouter Directeur',
          icon: <FaUserTie />,
          path: '/dashboard/superadmin/create-directeur',
        },
        {
          label: 'Gérer Taux Echange',
          icon: <FaDollarSign />,
          path: '/dashboard/superadmin/taux-echange',
        },
        {
          label: 'Carte Pharmacies',
          icon: <FaMapMarkedAlt />,
          path: '/dashboard/superadmin/carte',
        },
        {
          label: 'Creer mon Agent Admin',
          icon: <FaMapMarkedAlt />,
          path: '/dashboard/superadmin/creer-admin',
        },
         {
          label: 'Liste de Mes Admin',
          icon: <FaMapMarkedAlt />,
          path: '/dashboard/superadmin/afficherAdmin',
        },
      ],
      roles: ['superuser', 'admin'],
    },
    {
      title: 'Fournisseur',
      icon: <FaIndustry />,
      items: [
        {
          label: 'Créer Fournisseur',
          icon: <FaIndustry />,
          path: '/dashboard/superadmin/fabricant',
        },
        {
          label: 'Créer Médicament Fournisseur',
          icon: <FaBoxOpen />,
          path: '/dashboard/superadmin/produit-fabricant',
        },
        {
          label: 'Créer Depot du Fournisseur',
          icon: <FaBoxOpen />,
          path: '/dashboard/superadmin/creer-depot',
        },
        {
          label: 'Modifier Prix Achat du Fournisseur',
          icon: <FaDollarSign />,
          path: '/dashboard/superadmin/modifier-prixachat-fourni',
        },
      ],
      roles: ['superuser', 'admin'],
    },
    {
      title: 'Publicité',
      icon: <FaBullhorn />,
      items: [
        {
          label: 'Publicité',
          icon: <FaBullhorn />,
          path: '/dashboard/superadmin/publicite',
        },
      ],
      roles: ['superuser', 'admin'],
    },
  ]

  return (
    <aside
      className={`bg-white dark:bg-gray-900 h-screen p-4 shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-6 cursor-pointer">
        {!isCollapsed && (
          <span className="text-2xl font-extrabold text-[#007BFF] tracking-wide">NicaTech</span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-600 dark:text-gray-300 text-xl"
        >
          {isCollapsed ? '☰' : '×'}
        </button>
      </div>

      {/* Tableau de bord */}
      <nav className="space-y-1 mb-4">
        <Link
          href="/dashboard/superadmin"
          className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 hover:bg-[#007BFF] hover:text-white ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FaChartLine />
          {!isCollapsed && <span>Tableau de Bord</span>}
        </Link>
      </nav>

      {/* Sections dynamiques */}
      <div className="space-y-4">
        {sections.map(
          (section) =>
            section.roles.includes(userRole) && (
              <div key={section.title}>
                {/* Titre section */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`flex items-center justify-between w-full py-2 px-4 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
                >
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    {section.icon}
                    {!isCollapsed && <span>{section.title}</span>}
                  </div>
                  {!isCollapsed &&
                    (openSection === section.title ? (
                      <FaChevronDown className="text-sm" />
                    ) : (
                      <FaChevronRight className="text-sm" />
                    ))}
                </button>

                {/* Sous-menu */}
                {!isCollapsed && openSection === section.title && (
                  <div className="ml-6 mt-2 space-y-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-[#007BFF] hover:text-white transition"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
        )}
      </div>

      {/* Déconnexion */}
      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/login"
          className={`flex items-center gap-3 py-3 px-4 rounded-lg transition hover:bg-red-500 hover:text-white ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Déconnexion</span>}
        </Link>
        {!isCollapsed && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Améliorons NicaTech ensemble</p>
            <p className="italic text-sm text-gray-400 dark:text-gray-500">"Quoi Chef ?"</p>
            <div className="text-sm font-bold text-[#007BFF] mt-2">NicaTech © 2025</div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default SidebarAdmin

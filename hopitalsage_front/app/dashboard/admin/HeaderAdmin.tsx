'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import axios from 'axios'

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  photo: string | null
  role: string
}

type SubMenuItem = {
  label: string
  href: string
  icon: string
}

type MenuItem = {
  label: string
  icon: string
  href?: string
  submenu?: SubMenuItem[]
}

const HeaderAdmin = ({ user }: { user: User }) => {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({})

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    try {
      if (refreshToken) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/logout/`,
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        )
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error)
    }

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  const toggleSubMenu = (label: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const mainMenuItems: MenuItem[] = [
    {
      label: 'Produits Fabricant',
      icon: '💊',
      submenu: [
        { label: 'Ajouter Fabricant', href: '/dashboard/admin/fabricant', icon: '➕' },
        { label: 'Ajouter Produit', href: '/dashboard/admin/produit-fabricant', icon: '➕' },
        { label: 'Liste et Modification', href: '/dashboard/admin/modifier-prixachat-fourni', icon: '📦' },
      ],
    },
    {
      label: 'Pharmacie Liste',
      icon: '📊',
      submenu: [
        { label: 'Liste des pharmacie', href: '/dashboard/admin/liste_pharmacie', icon: '📈' },
        { label: 'Rapport', href: '#', icon: '📅' },
      ],
    },
    {
      label: 'Historique',
      icon: '📊',
      submenu: [
        { label: 'Historique', href: '#', icon: '📈' },
        { label: 'Rapport', href: '#', icon: '📅' },
      ],
    },
  ]

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-blue-600 text-white shadow-md">
      {/* Gauche : Accueil + Menu Admin */}
      <div className="relative flex items-center gap-6">
        <Link
          href="/dashboard/admin"
          className="text-white hover:text-gray-200 font-medium flex items-center gap-1"
        >
          🔙 Accueil
        </Link>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded transition"
        >
          🧭 Menu Admin
        </button>

        {/* Menu déroulant vers le bas */}
        {isMenuOpen && (
          <div className="absolute top-full mt-2 w-64 bg-white text-gray-800 rounded shadow-xl z-50 overflow-y-auto max-h-96">
            {mainMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => item.submenu && toggleSubMenu(item.label)}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.submenu && (
                    <span className="text-sm">
                      {expandedMenus[item.label] ? '▼' : '▶'}
                    </span>
                  )}
                </div>

                {item.submenu && expandedMenus[item.label] && (
                  <div className="pl-6 bg-gray-50">
                    {item.submenu.map((subItem, i) => (
                      <Link
                        key={i}
                        href={subItem.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-200"
                      >
                        {subItem.icon} {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Centre : Titre */}
      <div className="flex-grow text-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">
          NICAPHARM SOFT
        </h1>
      </div>

      {/* Droite : Utilisateur + Déconnexion */}
      <div className="flex items-center gap-4">
        {user.photo && (
          <Image
            src={user.photo}
            alt="Photo de profil"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        )}
        <div className="text-sm font-medium">
          {user.first_name} {user.last_name}
        </div>
        <button
          onClick={handleLogout}
          className="hover:text-red-300 p-2 rounded-full hover:bg-blue-700 transition"
          aria-label="Déconnexion"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

export default HeaderAdmin

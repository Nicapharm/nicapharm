'use client'

import React, { useEffect, useState } from 'react'

interface AdminUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  date_joined: string
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const Page = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<Message | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setAccessToken(token)
    if (token) {
      fetchAdmins(token)
    }
  }, [])

  const fetchAdmins = (token: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setAdmins(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const desactiverAdmin = (adminId: number) => {
    if (!accessToken) return

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/${adminId}/desactiver/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage({ type: 'success', text: data.message })
          setAdmins(prev =>
            prev.map(admin =>
              admin.id === adminId ? { ...admin, is_active: false } : admin
            )
          )
        } else {
          setMessage({ type: 'error', text: data.error || 'Erreur inconnue' })
        }
        setTimeout(() => setMessage(null), 5000)
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Erreur lors de la requête' })
        setTimeout(() => setMessage(null), 5000)
      })
  }

  const reactiverAdmin = (adminId: number) => {
    if (!accessToken) return

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admins/${adminId}/reactiver/`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage({ type: 'success', text: data.message })
          setAdmins(prev =>
            prev.map(admin =>
              admin.id === adminId ? { ...admin, is_active: true } : admin
            )
          )
        } else {
          setMessage({ type: 'error', text: data.error || 'Erreur inconnue' })
        }
        setTimeout(() => setMessage(null), 5000)
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Erreur lors de la requête' })
        setTimeout(() => setMessage(null), 5000)
      })
  }

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Chargement des administrateurs...</div>
  }

  return (
    <main className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Liste des utilisateurs admin</h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Nom</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-2 text-sm">
                    {admin.first_name} {admin.last_name} ({admin.username})
                  </td>
                  <td className="px-4 py-2 text-sm">{admin.email}</td>
                  <td className="px-4 py-2 text-sm">
                    {admin.is_active ? (
                      <span className="text-green-600 font-medium">Actif</span>
                    ) : (
                      <span className="text-red-600 font-medium">Désactivé</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {admin.is_active ? (
                      <button
                        onClick={() => desactiverAdmin(admin.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Désactiver
                      </button>
                    ) : (
                      <button
                        onClick={() => reactiverAdmin(admin.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Réactiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default Page

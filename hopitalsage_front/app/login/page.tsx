'use client';

import { useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Tentative de connexion avec', username, password);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login/`, {
        username,
        password,
      });

      const { token, refresh, user } = response.data;

      console.log('Connexion réussie, réponse API :', response.data);

      localStorage.setItem('accessToken', token);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      Cookies.set('token', token);

      console.log('User connecté :', user);

      // ✅ Redirection dans startTransition
      switch (user.role) {
        case 'superuser':
          startTransition(() => router.push('/dashboard/superadmin'));
          break;
        case 'directeur':
          startTransition(() => router.push('/dashboard/directeur'));
          break;
        case 'admin':
          startTransition(() => router.push('/dashboard/admin'));
          break;
        case 'comptable':
          startTransition(() => router.push('/dashboard/comptable'));
          break;
        default:
          startTransition(() => router.push('/'));
      }
    } catch (err: any) {
      console.error('Erreur lors de la connexion :', err.response?.data || err.message);
      setError('Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-5 border border-blue-100"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600">Connexion</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-xl transition hover:bg-blue-700 shadow-md ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </button>
      </form>
    </div>
  );
}

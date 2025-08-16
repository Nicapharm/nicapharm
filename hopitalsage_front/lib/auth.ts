// lib/auth.ts

export async function getAccessToken(): Promise<string | null> {
  let token = localStorage.getItem('token');
  const refresh = localStorage.getItem('refresh');

  // Si pas de token mais on a un refresh token → essayer de générer un nouveau
  if (!token && refresh) {
    try {
      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access); // met à jour le token
        token = data.access;
      } else {
        // Le refresh token est invalide ou expiré → déconnecte l'utilisateur
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        console.log('🔐 Refresh token invalide. Déconnexion.');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du refresh token:', error);
      return null;
    }
  }

  return token;
}

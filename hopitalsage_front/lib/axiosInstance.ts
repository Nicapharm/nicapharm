import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// ✅ Injecte le token dans chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepte les erreurs de réponse (ex: token expiré)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) throw new Error('No refresh token');

        // 🔁 Tente de rafraîchir le token
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh,
        });

        const newToken = response.data.access;
        localStorage.setItem('token', newToken);

        // 🔁 Réessaie la requête avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 🔒 Si le refresh échoue, déconnexion
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login'; // Redirige vers login
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

import axios from 'axios';

export class ApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let handlingUnauthorized = false;

function shouldSkipGlobalUnauthorizedHandler(requestUrl: string): boolean {
  return (
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/register') ||
    requestUrl.includes('/auth/me') ||
    requestUrl.includes('/auth/logout')
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !shouldSkipGlobalUnauthorizedHandler(requestUrl) &&
      !handlingUnauthorized
    ) {
      handlingUnauthorized = true;
      localStorage.removeItem('token');

      const { useAuthStore } = await import('@/stores/authStore');
      useAuthStore.setState({
        usuario: null,
        isAuthenticated: false,
        sessionChecked: true,
        isLoading: false,
        error: null,
      });

      const isPublicRoute = ['/login', '/registro'].some((route) =>
        window.location.pathname.startsWith(route)
      );
      if (!isPublicRoute) {
        window.location.href = '/login';
      }

      handlingUnauthorized = false;
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      'Erro inesperado. Tente novamente.';
    return Promise.reject(new ApiError(message, error.response?.status));
  }
);

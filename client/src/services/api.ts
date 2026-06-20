import axios from 'axios';

// Define a URL da API:
// - Se VITE_API_URL estiver preenchida, usa ela (produção / caso especial).
// - Senão, deriva do host atual. Assim, acessando por localhost OU pelo IP da
//   rede (ex.: celular em http://192.168.x.x:5173), a API aponta para o mesmo
//   host na porta 3000 — funciona em qualquer dispositivo sem reconfigurar.
const envUrl = import.meta.env.VITE_API_URL?.trim();
const baseURL =
  envUrl && envUrl.length > 0
    ? envUrl
    : `${window.location.protocol}//${window.location.hostname}:3000/api`;

const api = axios.create({ baseURL });

const TOKEN_KEY = 'agenda_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Anexa o token JWT em toda requisição.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Em 401, encerra a sessão e volta ao login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

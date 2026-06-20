import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api, { setToken, clearToken, getToken } from '@/services/api';
import type { Usuario } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(null);
  const carregando = ref(false);

  const autenticado = computed(() => !!getToken());

  async function login(senha: string) {
    carregando.value = true;
    try {
      const { data } = await api.post('/auth/login', { senha });
      setToken(data.access_token);
      usuario.value = data.usuario;
      return data.usuario as Usuario;
    } finally {
      carregando.value = false;
    }
  }

  async function carregarPerfil() {
    if (!getToken()) return;
    try {
      const { data } = await api.get('/auth/me');
      usuario.value = data;
    } catch {
      logout();
    }
  }

  function logout() {
    clearToken();
    usuario.value = null;
  }

  return { usuario, carregando, autenticado, login, carregarPerfil, logout };
});

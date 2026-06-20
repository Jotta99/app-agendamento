import { createRouter, createWebHistory } from 'vue-router';
import { getToken } from '@/services/api';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { publico: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/agenda',
      name: 'agenda',
      component: () => import('@/views/AgendaView.vue'),
    },
    {
      path: '/clientes',
      name: 'clientes',
      component: () => import('@/views/ClienteView.vue'),
    },
    {
      path: '/servicos',
      name: 'servicos',
      component: () => import('@/views/ServicoView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
  ],
});

// Guarda de rota: bloqueia páginas privadas sem token.
router.beforeEach((to) => {
  const autenticado = !!getToken();
  if (!to.meta.publico && !autenticado) {
    return { name: 'login' };
  }
  if (to.name === 'login' && autenticado) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;

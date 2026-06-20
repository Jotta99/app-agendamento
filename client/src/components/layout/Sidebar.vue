<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { navItems } from './navItems';

const auth = useAuthStore();
const router = useRouter();

function sair() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <aside
    class="sticky top-0 z-[2] hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-card px-4 py-7 lg:flex"
  >
    <!-- Marca -->
    <div class="mb-9 flex items-center gap-3 px-2">
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep font-display text-xl font-semibold text-white shadow-glow"
      >
        A
      </div>
      <div class="leading-tight">
        <p class="font-display text-lg font-semibold text-ink">Agenda</p>
      </div>
    </div>

    <!-- Navegação -->
    <nav class="flex flex-1 flex-col gap-1.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.rota"
        :to="item.rota"
        class="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-transparent before:transition-colors hover:bg-primary-soft/50 hover:text-primary-deep"
        active-class="!text-primary-deep bg-primary-soft before:!bg-primary"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            :d="item.icone"
          />
        </svg>
        {{ item.nome }}
      </RouterLink>
    </nav>

    <!-- Usuário / sair -->
    <div class="mt-4 border-t border-line pt-4">
      <button
        class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted transition hover:bg-danger/5 hover:text-danger"
        @click="sair"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Sair
      </button>
    </div>
  </aside>
</template>

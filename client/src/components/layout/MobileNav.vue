<script setup lang="ts">
import { navItems } from './navItems';
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line bg-card px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-6px_24px_-14px_rgba(20,18,26,0.25)] lg:hidden"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.rota"
      :to="item.rota"
      class="group flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted transition-colors"
      active-class="!text-primary-deep"
    >
      <span
        class="flex h-9 w-12 items-center justify-center rounded-full transition-all duration-200 group-[.router-link-active]:bg-primary-soft"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            :d="item.icone"
          />
        </svg>
      </span>
      {{ item.nome }}
    </RouterLink>
  </nav>
</template>

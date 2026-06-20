<script setup lang="ts">
import Sidebar from './Sidebar.vue';
import MobileNav from './MobileNav.vue';
</script>

<template>
  <div class="relative flex min-h-screen">
    <Sidebar />

    <!-- Conteúdo -->
    <main class="relative z-[1] flex-1 overflow-x-hidden pb-28 lg:pb-0">
      <!-- Topo mobile com a marca -->
      <div
        class="flex items-center gap-2.5 px-5 pt-6 lg:hidden"
      >
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-deep font-display text-base font-semibold text-white shadow-glow"
        >
          A
        </div>
        <span class="font-display text-lg font-semibold text-ink">Agenda</span>
      </div>

      <div class="mx-auto w-full max-w-5xl px-5 py-6 sm:px-6 lg:px-12 lg:py-12">
        <slot />
      </div>
    </main>

    <MobileNav />
  </div>
</template>

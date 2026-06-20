<script setup lang="ts">
import { useToast } from '@/composables/useToast';
const { toasts, remover } = useToast();
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
    <TransitionGroup
      enter-active-class="transition duration-200"
      enter-from-class="-translate-y-3 opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-soft"
        @click="remover(t.id)"
      >
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
          :class="t.tipo === 'sucesso' ? 'bg-success' : 'bg-danger'"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              v-if="t.tipo === 'sucesso'"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
        <p class="text-sm text-ink">{{ t.mensagem }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

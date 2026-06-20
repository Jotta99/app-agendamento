<script setup lang="ts">
defineProps<{ titulo: string; descricao?: string }>();
</script>

<template>
  <div class="flex animate-fade-up flex-col items-center justify-center gap-2 py-16 text-center">
    <div
      class="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary-tint text-primary-deep ring-1 ring-inset ring-white/80 shadow-inset"
    >
      <slot name="icon">
        <svg
          class="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 13h6m-3-3v6m-7 5h14a2 2 0 002-2V7a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </slot>
    </div>
    <h3 class="font-display text-xl font-semibold text-ink">{{ titulo }}</h3>
    <p v-if="descricao" class="max-w-xs text-sm leading-relaxed text-muted">
      {{ descricao }}
    </p>
    <div class="mt-3">
      <slot name="action" />
    </div>
  </div>
</template>

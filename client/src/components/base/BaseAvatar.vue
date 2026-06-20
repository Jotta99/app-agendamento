<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ nome?: string; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' },
);

const iniciais = computed(() => {
  if (!props.nome) return '?';
  return props.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
});

const sizes = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-lg' };
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-soft to-primary-light/70 font-display font-semibold text-primary-deep ring-1 ring-inset ring-white/70 shadow-inset"
    :class="sizes[size]"
  >
    {{ iniciais }}
  </div>
</template>

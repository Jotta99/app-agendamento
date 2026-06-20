<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
  }>(),
  { min: 0, max: 99, step: 1 },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

const podeMenos = computed(() => props.modelValue > props.min);
const podeMais = computed(() => props.modelValue < props.max);

function alterar(dir: number) {
  const alvo = (props.modelValue || 0) + dir * props.step;
  emit('update:modelValue', Math.min(props.max, Math.max(props.min, alvo)));
}
</script>

<template>
  <div class="inline-flex items-center rounded-xl border border-line bg-card p-1 shadow-card">
    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition hover:bg-subtle disabled:opacity-25 disabled:hover:bg-transparent"
      :disabled="!podeMenos"
      @click="alterar(-1)"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-width="2.2" d="M5 12h14" />
      </svg>
    </button>

    <div class="flex w-14 items-baseline justify-center gap-0.5">
      <span class="tnum font-display text-lg font-semibold text-ink">{{ modelValue }}</span>
      <span v-if="suffix" class="text-sm text-muted">{{ suffix }}</span>
    </div>

    <button
      type="button"
      class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition hover:bg-subtle disabled:opacity-25 disabled:hover:bg-transparent"
      :disabled="!podeMais"
      @click="alterar(1)"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-width="2.2" d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    readonly?: boolean;
    size?: number;
  }>(),
  { modelValue: 0, readonly: false, size: 28 },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: number): void }>();

const hover = ref(0);
const px = computed(() => `${props.size}px`);

// Preenchimento (0..1) de cada estrela no modo leitura (suporta meia estrela).
function fill(n: number): number {
  return Math.max(0, Math.min(1, props.modelValue - (n - 1)));
}

const STAR =
  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
</script>

<template>
  <!-- Somente leitura: estrelas com preenchimento fracionário -->
  <div v-if="readonly" class="inline-flex items-center gap-0.5">
    <span
      v-for="n in 5"
      :key="n"
      class="relative inline-block shrink-0"
      :style="{ width: px, height: px }"
    >
      <svg class="absolute inset-0 h-full w-full text-line" viewBox="0 0 24 24" fill="currentColor">
        <path :d="STAR" />
      </svg>
      <span
        class="absolute inset-0 overflow-hidden"
        :style="{ width: fill(n) * 100 + '%' }"
      >
        <svg class="text-gold" :style="{ width: px, height: px }" viewBox="0 0 24 24" fill="currentColor">
          <path :d="STAR" />
        </svg>
      </span>
    </span>
  </div>

  <!-- Editável: clique para definir a nota -->
  <div v-else class="inline-flex items-center gap-1" @mouseleave="hover = 0">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      class="transition-transform hover:scale-110"
      @click="emit('update:modelValue', n)"
      @mouseenter="hover = n"
    >
      <svg
        :style="{ width: px, height: px }"
        viewBox="0 0 24 24"
        fill="currentColor"
        :class="(hover || modelValue) >= n ? 'text-gold' : 'text-line'"
      >
        <path :d="STAR" />
      </svg>
    </button>
  </div>
</template>

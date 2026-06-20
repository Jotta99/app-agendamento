<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number | null;
  label?: string;
  required?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

// Exibe o valor formatado (1.234,56). Vazio mostra o placeholder.
const display = computed(() =>
  props.modelValue == null
    ? ''
    : props.modelValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
);

// Máscara por centavos: cada dígito digitado entra pela direita.
function onInput(e: Event) {
  const digitos = (e.target as HTMLInputElement).value.replace(/\D/g, '');
  if (!digitos) {
    emit('update:modelValue', null);
    return;
  }
  // Limita para evitar overflow e mantém 2 casas (centavos).
  const centavos = parseInt(digitos.slice(0, 12), 10);
  emit('update:modelValue', centavos / 100);
}
</script>

<template>
  <label class="block">
    <span
      v-if="label"
      class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
    >
      {{ label }}
      <span v-if="required" class="text-primary">*</span>
    </span>
    <div class="relative">
      <span
        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted"
      >
        R$
      </span>
      <input
        :value="display"
        :placeholder="placeholder ?? '0,00'"
        inputmode="numeric"
        class="tnum w-full rounded-xl border border-line bg-white/70 py-2.5 pl-10 pr-4 text-right text-ink placeholder:text-muted/50 transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
        @input="onInput"
      />
    </div>
  </label>
</template>

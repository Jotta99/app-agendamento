<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

// Formata como (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular).
function formatar(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const display = computed(() => formatar(props.modelValue ?? ''));

function onInput(e: Event) {
  emit('update:modelValue', formatar((e.target as HTMLInputElement).value));
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
    <input
      :value="display"
      :placeholder="placeholder ?? '(00) 00000-0000'"
      inputmode="tel"
      class="tnum w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 text-ink placeholder:text-muted/50 transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
      @input="onInput"
    />
  </label>
</template>

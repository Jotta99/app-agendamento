<script setup lang="ts">
import { computed } from 'vue';
import type { StatusAgendamento } from '@/types';

const props = defineProps<{ status?: StatusAgendamento; tone?: string }>();

const map: Record<
  StatusAgendamento,
  { label: string; cls: string; dot: string }
> = {
  AGENDADO: {
    label: 'Agendado',
    cls: 'bg-primary-soft text-primary-deep',
    dot: 'bg-primary',
  },
  CONCLUIDO: {
    label: 'Concluído',
    cls: 'bg-success/12 text-success',
    dot: 'bg-success',
  },
  CANCELADO: {
    label: 'Cancelado',
    cls: 'bg-danger/10 text-danger',
    dot: 'bg-danger',
  },
  FALTOU: {
    label: 'Faltou',
    cls: 'bg-ink/5 text-muted',
    dot: 'bg-muted',
  },
};

const info = computed(() =>
  props.status ? map[props.status] : { label: '', cls: '', dot: '' },
);
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
    :class="info.cls"
  >
    <span v-if="status" class="h-1.5 w-1.5 rounded-full" :class="info.dot"></span>
    <slot>{{ info.label }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StatusAgendamento } from '@/types';

const props = defineProps<{ contagens: Record<StatusAgendamento, number> }>();

const ORDEM: StatusAgendamento[] = ['AGENDADO', 'CONCLUIDO', 'CANCELADO', 'FALTOU'];

// Mesma paleta usada no BaseBadge, para o donut ficar consistente com o resto do app.
const INFO: Record<StatusAgendamento, { label: string; texto: string; ponto: string }> = {
  AGENDADO: { label: 'Agendado', texto: 'text-primary', ponto: 'bg-primary' },
  CONCLUIDO: { label: 'Concluído', texto: 'text-success', ponto: 'bg-success' },
  CANCELADO: { label: 'Cancelado', texto: 'text-danger', ponto: 'bg-danger' },
  FALTOU: { label: 'Faltou', texto: 'text-muted', ponto: 'bg-muted' },
};

const RAIO = 40;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

const total = computed(() =>
  ORDEM.reduce((s, k) => s + (props.contagens[k] ?? 0), 0),
);

const segmentos = computed(() => {
  if (!total.value) return [];
  let acumulado = 0;
  return ORDEM.filter((k) => (props.contagens[k] ?? 0) > 0).map((k) => {
    const valor = props.contagens[k] ?? 0;
    const fracao = valor / total.value;
    const comprimento = fracao * CIRCUNFERENCIA;
    const seg = {
      status: k,
      ...INFO[k],
      valor,
      pct: Math.round(fracao * 100),
      dasharray: `${comprimento} ${CIRCUNFERENCIA - comprimento}`,
      dashoffset: -acumulado,
    };
    acumulado += comprimento;
    return seg;
  });
});
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          :r="RAIO"
          fill="none"
          stroke-width="12"
          class="text-line"
          stroke="currentColor"
        />
        <circle
          v-for="s in segmentos"
          :key="s.status"
          cx="50"
          cy="50"
          :r="RAIO"
          fill="none"
          stroke-width="12"
          :class="s.texto"
          stroke="currentColor"
          :stroke-dasharray="s.dasharray"
          :stroke-dashoffset="s.dashoffset"
          class="transition-all duration-500"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-display text-2xl font-semibold text-ink">{{ total }}</span>
        <span class="text-[10px] uppercase tracking-wide text-muted">total</span>
      </div>
    </div>
    <ul class="flex-1 space-y-1.5 text-sm">
      <li
        v-for="s in segmentos"
        :key="s.status"
        class="flex items-center justify-between gap-2"
      >
        <span class="flex items-center gap-2">
          <span class="h-2 w-2 shrink-0 rounded-full" :class="s.ponto"></span>
          <span class="text-ink">{{ s.label }}</span>
        </span>
        <span class="tnum shrink-0 text-muted">{{ s.valor }} · {{ s.pct }}%</span>
      </li>
      <li v-if="!total" class="text-muted">Sem dados no período.</li>
    </ul>
  </div>
</template>

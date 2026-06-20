<script setup lang="ts">
import type { Agendamento } from '@/types';
import { formatarHora, formatarMoeda } from '@/utils/format';
import BaseBadge from './base/BaseBadge.vue';

defineProps<{ agendamento: Agendamento }>();
defineEmits<{ (e: 'click'): void }>();
</script>

<template>
  <button
    class="group flex w-full items-stretch gap-3.5 rounded-2xl border border-line bg-card p-3 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-light hover:shadow-soft"
    :class="{ 'opacity-55 grayscale-[30%]': agendamento.status === 'CANCELADO' }"
    @click="$emit('click')"
  >
    <!-- Faixa de horário -->
    <div
      class="tnum flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary-tint px-2 py-1.5 text-primary-deep ring-1 ring-inset ring-white/60"
    >
      <span class="font-display text-base font-semibold leading-none">
        {{ formatarHora(agendamento.hora_inicio) }}
      </span>
      <span class="mt-0.5 text-[11px] text-primary-deep/60">
        {{ formatarHora(agendamento.hora_fim) }}
      </span>
    </div>

    <!-- Conteúdo -->
    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <div class="flex items-center gap-2">
        <p class="truncate font-semibold text-ink">
          {{ agendamento.cliente?.nome ?? 'Cliente' }}
        </p>
        <BaseBadge :status="agendamento.status" />
      </div>
      <p class="truncate text-sm text-muted">
        {{ agendamento.servico?.nome ?? 'Serviço' }}
      </p>
    </div>

    <!-- Valor -->
    <div class="flex flex-col items-end justify-center pr-1">
      <span class="tnum font-display text-base font-semibold text-ink">
        {{ formatarMoeda(agendamento.valor) }}
      </span>
      <span
        class="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide"
        :class="agendamento.pago ? 'text-success' : 'text-muted'"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="agendamento.pago ? 'bg-success' : 'bg-muted/50'"></span>
        {{ agendamento.pago ? 'Pago' : 'A receber' }}
      </span>
    </div>
  </button>
</template>

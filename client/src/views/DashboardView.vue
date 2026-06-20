<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AppointmentCard from '@/components/AppointmentCard.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import AgendamentoFormModal from '@/components/forms/AgendamentoFormModal.vue';
import AgendamentoDetalhesModal from '@/components/forms/AgendamentoDetalhesModal.vue';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import {
  formatarMoeda,
  formatarHora,
  formatarDataExtensa,
  hojeISO,
} from '@/utils/format';
import type { Agendamento, ResumoDia } from '@/types';

// Janela de trabalho padrão para estimar horários livres (08h–20h).
const INICIO_EXPEDIENTE = 8;
const FIM_EXPEDIENTE = 20;

const { erro } = useToast();
const carregando = ref(true);
const resumo = ref<ResumoDia | null>(null);
const hoje = hojeISO();

const novoAberto = ref(false);
const detalhesAberto = ref(false);
const selecionado = ref<Agendamento | null>(null);

async function carregar() {
  carregando.value = true;
  try {
    resumo.value = await agendamentoService.resumoDoDia(hoje);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar o dia.');
  } finally {
    carregando.value = false;
  }
}

// Estimativa de horários de 1h livres dentro do expediente.
const horariosLivres = computed(() => {
  if (!resumo.value) return 0;
  const ocupados = resumo.value.agendamentos.filter(
    (a) => a.status === 'AGENDADO' || a.status === 'CONCLUIDO',
  );
  let livres = 0;
  for (let h = INICIO_EXPEDIENTE; h < FIM_EXPEDIENTE; h++) {
    const slotInicio = h * 60;
    const slotFim = slotInicio + 60;
    const conflita = ocupados.some((a) => {
      const ini = toMin(a.hora_inicio);
      const fim = toMin(a.hora_fim);
      return ini < slotFim && fim > slotInicio;
    });
    if (!conflita) livres++;
  }
  return livres;
});

function toMin(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function abrirDetalhes(a: Agendamento) {
  selecionado.value = a;
  detalhesAberto.value = true;
}

onMounted(carregar);
</script>

<template>
  <AppLayout>
    <!-- Cabeçalho -->
    <header class="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-deep">
          Como está meu dia
        </p>
        <h1 class="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Meu dia
        </h1>
        <p class="mt-1.5 capitalize text-muted">{{ formatarDataExtensa(hoje) }}</p>
      </div>
      <BaseButton variant="primary" @click="novoAberto = true">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo agendamento
      </BaseButton>
    </header>

    <LoadingSpinner v-if="carregando" />

    <template v-else-if="resumo">
      <!-- Cartões de resumo -->
      <div class="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <BaseCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Atendimentos
          </p>
          <p class="mt-2 font-display text-4xl font-semibold text-ink">
            {{ resumo.total_agendamentos }}
          </p>
        </BaseCard>
        <BaseCard>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Horários livres
          </p>
          <p class="mt-2 font-display text-4xl font-semibold text-ink">
            {{ horariosLivres }}
          </p>
        </BaseCard>
        <BaseCard
          class="col-span-2 overflow-hidden !bg-gradient-to-br !from-primary !to-primary-deep !border-primary-deep/30 lg:col-span-1"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-white/75">
            Receita prevista
          </p>
          <p class="tnum mt-2 font-display text-4xl font-semibold text-white">
            {{ formatarMoeda(resumo.receita_prevista) }}
          </p>
        </BaseCard>
      </div>

      <!-- Próximo atendimento -->
      <div v-if="resumo.proximo_atendimento" class="mt-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Próximo atendimento
        </h2>
        <BaseCard class="flex items-center gap-4 border border-primary/20">
          <div
            class="flex flex-col items-center justify-center rounded-xl bg-primary px-4 py-2 text-white"
          >
            <span class="text-lg font-bold">
              {{ formatarHora(resumo.proximo_atendimento.hora_inicio) }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-ink">
              {{ resumo.proximo_atendimento.cliente?.nome }}
            </p>
            <p class="truncate text-sm text-muted">
              {{ resumo.proximo_atendimento.servico?.nome }}
            </p>
          </div>
          <span class="font-semibold text-ink">
            {{ formatarMoeda(resumo.proximo_atendimento.valor) }}
          </span>
        </BaseCard>
      </div>

      <!-- Lista do dia -->
      <div class="mt-6">
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Atendimentos de hoje
        </h2>
        <div v-if="resumo.agendamentos.length" class="stagger space-y-3">
          <AppointmentCard
            v-for="(a, i) in resumo.agendamentos"
            :key="a.id"
            :agendamento="a"
            :style="{ animationDelay: i * 50 + 'ms' }"
            @click="abrirDetalhes(a)"
          />
        </div>
        <EmptyState
          v-else
          titulo="Nenhum atendimento hoje"
          descricao="Aproveite para organizar sua agenda ou criar um novo agendamento."
        >
          <template #action>
            <BaseButton variant="primary" @click="novoAberto = true">
              Novo agendamento
            </BaseButton>
          </template>
        </EmptyState>
      </div>
    </template>

    <AgendamentoFormModal
      v-model="novoAberto"
      :data-inicial="hoje"
      @salvo="carregar"
    />
    <AgendamentoDetalhesModal
      v-model="detalhesAberto"
      :agendamento="selecionado"
      @alterado="carregar"
    />
  </AppLayout>
</template>

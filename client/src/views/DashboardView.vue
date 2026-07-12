<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AppointmentCard from '@/components/AppointmentCard.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import AgendamentoFormModal from '@/components/forms/AgendamentoFormModal.vue';
import AgendamentoDetalhesModal from '@/components/forms/AgendamentoDetalhesModal.vue';
import WeekBarChart from '@/components/dashboard/WeekBarChart.vue';
import StatusDonut from '@/components/dashboard/StatusDonut.vue';
import TopServicos from '@/components/dashboard/TopServicos.vue';
import PagamentoResumo from '@/components/dashboard/PagamentoResumo.vue';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import {
  formatarMoeda,
  formatarHora,
  formatarDataExtensa,
  hojeISO,
  somarDias,
  inicioDoMes,
  dataLocal,
} from '@/utils/format';
import type { Agendamento, ResumoDia, VisaoGeral } from '@/types';

// Janela de trabalho padrão para estimar horários livres (08h–20h).
const INICIO_EXPEDIENTE = 8;
const FIM_EXPEDIENTE = 20;
const DIAS_ABREV = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const PERIODOS: { v: 'semana' | 'mes'; label: string }[] = [
  { v: 'semana', label: 'Últimos 7 dias' },
  { v: 'mes', label: 'Este mês' },
];

const { erro } = useToast();
const carregando = ref(true);
const carregandoVisao = ref(true);
const resumo = ref<ResumoDia | null>(null);
const visao = ref<VisaoGeral | null>(null);
const visaoSemana = ref<VisaoGeral | null>(null);
const pendentes = ref<Agendamento[]>([]);
const periodo = ref<'semana' | 'mes'>('semana');
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

async function carregarSemana() {
  visaoSemana.value = await agendamentoService.visaoGeral(
    somarDias(hoje, -6),
    hoje,
  );
}

// Agendamentos com horário já passado e ainda marcados como "Agendado" —
// precisam ser finalizados (concluir, marcar falta ou cancelar).
async function carregarPendentes() {
  try {
    pendentes.value = await agendamentoService.pendentes();
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar pendências.');
  }
}

// Recarrega tudo que pode ter mudado após criar/editar/concluir um agendamento.
function atualizarTudo() {
  carregar();
  carregarPendentes();
  carregarSemana().then(carregarPeriodo);
}

async function carregarPeriodo() {
  carregandoVisao.value = true;
  try {
    if (periodo.value === 'semana') {
      visao.value = visaoSemana.value;
      return;
    }
    visao.value = await agendamentoService.visaoGeral(inicioDoMes(hoje), hoje);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar a visão geral.');
  } finally {
    carregandoVisao.value = false;
  }
}

watch(periodo, carregarPeriodo);

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

// Receita dos últimos 7 dias para o gráfico de barras (sempre semanal).
const diasGrafico = computed(() => {
  if (!visaoSemana.value) return [];
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const iso = somarDias(hoje, -i);
    const info = visaoSemana.value.por_dia[iso];
    dias.push({
      label: DIAS_ABREV[dataLocal(iso).getDay()],
      valor: info?.receita ?? 0,
      destaque: iso === hoje,
    });
  }
  return dias;
});

function abrirDetalhes(a: Agendamento) {
  selecionado.value = a;
  detalhesAberto.value = true;
}

onMounted(async () => {
  await Promise.all([carregar(), carregarSemana(), carregarPendentes()]);
  await carregarPeriodo();
});
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
      <!-- Pendentes de finalização: horário já passou, status ainda "Agendado" -->
      <div v-if="pendentes.length" class="mb-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 sm:p-5">
        <div class="flex items-start gap-3">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
            <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l2 2m6-2a8 8 0 11-3.3-6.5M20 4v4h-4" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="font-display text-base font-semibold text-ink">
              {{ pendentes.length }} agendamento{{ pendentes.length === 1 ? '' : 's' }} para finalizar
            </h2>
            <p class="mt-0.5 text-sm text-muted">
              O horário já passou e ainda {{ pendentes.length === 1 ? 'consta' : 'constam' }} como
              agendado. Marque como concluído, falta ou cancele.
            </p>
          </div>
        </div>
        <div class="stagger mt-4 space-y-2">
          <AppointmentCard
            v-for="a in pendentes"
            :key="a.id"
            :agendamento="a"
            mostrar-data
            @click="abrirDetalhes(a)"
          />
        </div>
      </div>

      <!-- Cartões de resumo do dia -->
      <div class="stagger grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <BaseCard>
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Atendimentos
              </p>
              <p class="mt-2 font-display text-4xl font-semibold text-ink">
                {{ resumo.total_agendamentos }}
              </p>
            </div>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Horários livres
              </p>
              <p class="mt-2 font-display text-4xl font-semibold text-ink">
                {{ horariosLivres }}
              </p>
            </div>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke-width="1.8" />
                <path stroke-linecap="round" stroke-width="1.8" d="M12 7.5V12l3 1.8" />
              </svg>
            </span>
          </div>
        </BaseCard>
        <BaseCard
          class="col-span-2 overflow-hidden !border-primary-deep/30 !bg-gradient-to-br !from-primary !to-primary-deep lg:col-span-1"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-white/75">
                Receita prevista
              </p>
              <p class="tnum mt-2 font-display text-4xl font-semibold text-white">
                {{ formatarMoeda(resumo.receita_prevista) }}
              </p>
            </div>
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
              <svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3 .9 3 2-1.34 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 2v8m0 0v2m0-2c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </span>
          </div>
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

      <!-- Visão geral: visualizações do negócio -->
      <div class="mt-8">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted">
            Visão geral
          </h2>
          <div class="inline-flex rounded-xl border border-line bg-card p-1 shadow-card">
            <button
              v-for="opt in PERIODOS"
              :key="opt.v"
              class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150"
              :class="
                periodo === opt.v
                  ? 'bg-primary text-white shadow-glow'
                  : 'text-muted hover:text-ink'
              "
              @click="periodo = opt.v"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- KPIs do período -->
        <div v-if="visao" class="mb-4 grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-line bg-card px-3 py-2.5 text-center shadow-card">
            <p class="tnum font-display text-xl font-semibold text-ink">
              {{ visao.totais.atendimentos }}
            </p>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Atendimentos
            </p>
          </div>
          <div class="rounded-xl border border-line bg-card px-3 py-2.5 text-center shadow-card">
            <p class="tnum font-display text-xl font-semibold text-ink">
              {{ formatarMoeda(visao.totais.receita) }}
            </p>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Receita
            </p>
          </div>
          <div class="rounded-xl border border-line bg-card px-3 py-2.5 text-center shadow-card">
            <p class="tnum font-display text-xl font-semibold text-ink">
              {{ formatarMoeda(visao.totais.ticket_medio) }}
            </p>
            <p class="text-[10px] font-semibold uppercase tracking-wide text-muted">
              Ticket médio
            </p>
          </div>
        </div>

        <LoadingSpinner v-if="carregandoVisao && !visao" />

        <div v-else class="grid gap-4 lg:grid-cols-2">
          <!-- Movimento da semana (receita por dia, sempre últimos 7 dias) -->
          <BaseCard>
            <h3 class="mb-4 font-display text-base font-semibold text-ink">
              Movimento · últimos 7 dias
            </h3>
            <WeekBarChart :itens="diasGrafico" :formatar="formatarMoeda" />
          </BaseCard>

          <!-- Status dos atendimentos -->
          <BaseCard>
            <h3 class="mb-4 font-display text-base font-semibold text-ink">
              Status dos atendimentos
            </h3>
            <StatusDonut :contagens="visao?.por_status ?? { AGENDADO: 0, CONCLUIDO: 0, CANCELADO: 0, FALTOU: 0 }" />
          </BaseCard>

          <!-- Serviços mais pedidos -->
          <BaseCard>
            <h3 class="mb-4 font-display text-base font-semibold text-ink">
              Serviços mais pedidos
            </h3>
            <TopServicos :itens="visao?.por_servico ?? []" />
          </BaseCard>

          <!-- Pagamentos -->
          <BaseCard>
            <h3 class="mb-4 font-display text-base font-semibold text-ink">
              Pagamentos
            </h3>
            <PagamentoResumo
              :pago="visao?.pagamento.pago ?? 0"
              :a-receber="visao?.pagamento.a_receber ?? 0"
            />
          </BaseCard>
        </div>
      </div>

      <!-- Lista do dia -->
      <div class="mt-8">
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
      @salvo="atualizarTudo"
    />
    <AgendamentoDetalhesModal
      v-model="detalhesAberto"
      :agendamento="selecionado"
      @alterado="atualizarTudo"
    />
  </AppLayout>
</template>

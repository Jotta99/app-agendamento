<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import AgendamentoFormModal from '@/components/forms/AgendamentoFormModal.vue';
import AgendamentoDetalhesModal from '@/components/forms/AgendamentoDetalhesModal.vue';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import {
  formatarHora,
  formatarMoeda,
  formatarDataExtensa,
  hojeISO,
  somarDias,
  somarMeses,
  inicioDaSemana,
  inicioDoMes,
  nomeMesAno,
  diaDoMes,
  mesmoMes,
} from '@/utils/format';
import type { Agendamento } from '@/types';

type Modo = 'dia' | 'semana' | 'mes';

// Timeline da visão "Dia": faixa de horas e altura por hora (px).
const INICIO_DIA = 7;
const FIM_DIA = 22;
const HORA_PX = 64;
const horasDia = Array.from({ length: FIM_DIA - INICIO_DIA }, (_, i) => INICIO_DIA + i);
const alturaTotal = (FIM_DIA - INICIO_DIA) * HORA_PX;
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MODOS: { v: Modo; label: string }[] = [
  { v: 'dia', label: 'Dia' },
  { v: 'semana', label: 'Semana' },
  { v: 'mes', label: 'Mês' },
];

const { erro } = useToast();
const carregando = ref(true);
const modo = ref<Modo>('dia');
const dataSelecionada = ref(hojeISO());
const agendamentos = ref<Agendamento[]>([]);

const novoAberto = ref(false);
const detalhesAberto = ref(false);
const selecionado = ref<Agendamento | null>(null);
const dataNova = ref(hojeISO());
const horaPreSelecionada = ref<string | undefined>(undefined);

// Intervalo de datas a buscar conforme o modo.
const intervalo = computed(() => {
  const d = dataSelecionada.value;
  if (modo.value === 'dia') return { inicio: d, fim: d };
  if (modo.value === 'semana') {
    const ini = inicioDaSemana(d);
    return { inicio: ini, fim: somarDias(ini, 6) };
  }
  const gridIni = inicioDaSemana(inicioDoMes(d));
  return { inicio: gridIni, fim: somarDias(gridIni, 41) }; // 6 semanas
});

async function carregar() {
  carregando.value = true;
  try {
    agendamentos.value = await agendamentoService.listarPorIntervalo(
      intervalo.value.inicio,
      intervalo.value.fim,
    );
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar a agenda.');
  } finally {
    carregando.value = false;
  }
}

watch([modo, dataSelecionada], carregar);

function toMin(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

// Atendimentos agrupados por data (ignorando cancelados na exibição).
const porData = computed(() => {
  const mapa: Record<string, Agendamento[]> = {};
  for (const a of agendamentos.value) {
    if (a.status === 'CANCELADO') continue;
    (mapa[a.data] ??= []).push(a);
  }
  return mapa;
});

/* ---------- Modo DIA (timeline com blocos posicionados) ---------- */
const blocosDia = computed(() => {
  const doDia = porData.value[dataSelecionada.value] ?? [];
  return doDia.map((a) => {
    const ini = toMin(a.hora_inicio);
    const fim = toMin(a.hora_fim);
    const top = ((ini - INICIO_DIA * 60) / 60) * HORA_PX;
    const altura = Math.max(((fim - ini) / 60) * HORA_PX, 34);
    return { a, top, altura };
  });
});

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

/* ---------- Modo SEMANA ---------- */
const diasSemana = computed(() => {
  const ini = inicioDaSemana(dataSelecionada.value);
  return Array.from({ length: 7 }, (_, i) => {
    const iso = somarDias(ini, i);
    return {
      iso,
      nome: SEMANA[i],
      numero: diaDoMes(iso),
      ehHoje: iso === hojeISO(),
      itens: porData.value[iso] ?? [],
    };
  });
});

/* ---------- Modo MÊS ---------- */
const gridMes = computed(() => {
  const gridIni = intervalo.value.inicio;
  return Array.from({ length: 42 }, (_, i) => {
    const iso = somarDias(gridIni, i);
    return {
      iso,
      numero: diaDoMes(iso),
      noMes: mesmoMes(iso, dataSelecionada.value),
      ehHoje: iso === hojeISO(),
      total: (porData.value[iso] ?? []).length,
    };
  });
});

/* ---------- Navegação ---------- */
const rotulo = computed(() => {
  if (modo.value === 'dia') return formatarDataExtensa(dataSelecionada.value);
  if (modo.value === 'mes') return nomeMesAno(dataSelecionada.value);
  const { inicio, fim } = intervalo.value;
  return `${diaDoMes(inicio)} – ${diaDoMes(fim)} · ${nomeMesAno(inicio)}`;
});

function navegar(dir: number) {
  if (modo.value === 'dia') dataSelecionada.value = somarDias(dataSelecionada.value, dir);
  else if (modo.value === 'semana') dataSelecionada.value = somarDias(dataSelecionada.value, dir * 7);
  else dataSelecionada.value = somarMeses(dataSelecionada.value, dir);
}

function irParaHoje() {
  dataSelecionada.value = hojeISO();
}

function abrirDia(iso: string) {
  dataSelecionada.value = iso;
  modo.value = 'dia';
}

function abrirNovo(data: string, hora?: string) {
  dataNova.value = data;
  horaPreSelecionada.value = hora;
  novoAberto.value = true;
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
    <header class="mb-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-deep">
            Sua agenda
          </p>
          <h1 class="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Agenda
          </h1>
        </div>
        <BaseButton variant="primary" @click="abrirNovo(dataSelecionada)">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Novo
        </BaseButton>
      </div>

      <!-- Seletor de modo + navegação -->
      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="inline-flex w-full rounded-xl border border-line bg-card p-1 shadow-card sm:w-auto">
          <button
            v-for="opt in MODOS"
            :key="opt.v"
            class="flex-1 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-150 sm:flex-none"
            :class="
              modo === opt.v
                ? 'bg-primary text-white shadow-glow'
                : 'text-muted hover:text-ink'
            "
            @click="modo = opt.v"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="flex items-center gap-1 rounded-xl border border-line bg-card p-1 shadow-card">
          <button
            class="rounded-lg p-2 text-muted transition hover:bg-subtle hover:text-ink"
            @click="navegar(-1)"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p class="min-w-[10rem] text-center text-sm font-semibold capitalize text-ink">
            {{ rotulo }}
          </p>
          <button
            class="rounded-lg p-2 text-muted transition hover:bg-subtle hover:text-ink"
            @click="navegar(1)"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mt-2 flex justify-end">
        <button
          v-if="dataSelecionada !== hojeISO()"
          class="text-xs font-semibold text-primary-deep hover:underline"
          @click="irParaHoje"
        >
          Voltar para hoje
        </button>
      </div>
    </header>

    <LoadingSpinner v-if="carregando" />

    <template v-else>
      <!-- ===== DIA (timeline) ===== -->
      <div v-if="modo === 'dia'" class="relative" :style="{ height: alturaTotal + 'px' }">
        <!-- Grade de horas (linha + área livre clicável) -->
        <div
          v-for="h in horasDia"
          :key="h"
          class="absolute inset-x-0 flex"
          :style="{ top: (h - INICIO_DIA) * HORA_PX + 'px', height: HORA_PX + 'px' }"
        >
          <span class="tnum w-12 shrink-0 -translate-y-2 pr-2 text-right text-xs font-semibold text-muted">
            {{ pad2(h) }}:00
          </span>
          <button
            class="group flex-1 border-t border-line/70 transition hover:bg-primary-tint/40"
            @click="abrirNovo(dataSelecionada, pad2(h) + ':00')"
          >
            <span
              class="pointer-events-none float-right mr-2 mt-1 hidden text-xs font-semibold text-primary-deep group-hover:block"
            >
              + agendar
            </span>
          </button>
        </div>

        <!-- Blocos de atendimento (ocupam toda a duração) -->
        <button
          v-for="b in blocosDia"
          :key="b.a.id"
          class="absolute left-12 right-0 flex overflow-hidden rounded-xl border border-line bg-card text-left shadow-card transition hover:border-primary-light hover:shadow-soft"
          :class="{ 'opacity-60': b.a.status === 'FALTOU' }"
          :style="{ top: b.top + 'px', height: b.altura - 4 + 'px' }"
          @click="abrirDetalhes(b.a)"
        >
          <span class="w-1.5 shrink-0 bg-gradient-to-b from-primary to-primary-deep"></span>
          <span class="flex min-w-0 flex-1 flex-col justify-center px-3 py-1">
            <span class="flex items-center gap-2">
              <span class="truncate text-sm font-semibold text-ink">{{ b.a.cliente?.nome }}</span>
              <BaseBadge :status="b.a.status" />
            </span>
            <span class="tnum block truncate text-xs text-muted">
              {{ formatarHora(b.a.hora_inicio) }}–{{ formatarHora(b.a.hora_fim) }} ·
              {{ b.a.servico?.nome }}
            </span>
          </span>
          <span class="tnum shrink-0 self-center px-3 font-display text-sm font-semibold text-ink">
            {{ formatarMoeda(b.a.valor) }}
          </span>
        </button>
      </div>

      <!-- ===== SEMANA ===== -->
      <div v-else-if="modo === 'semana'" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="dia in diasSemana"
          :key="dia.iso"
          class="flex flex-col rounded-2xl border border-line bg-card p-3 shadow-card"
          :class="dia.ehHoje ? 'ring-1 ring-primary/40' : ''"
        >
          <button
            class="mb-2 flex items-center justify-between rounded-lg px-1 py-1 text-left transition hover:text-primary-deep"
            @click="abrirDia(dia.iso)"
          >
            <span class="text-sm font-semibold capitalize text-ink">
              {{ dia.nome }}
              <span class="tnum ml-1 text-muted">{{ dia.numero }}</span>
            </span>
            <span
              v-if="dia.ehHoje"
              class="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-deep"
            >
              Hoje
            </span>
          </button>

          <div class="flex-1 space-y-1.5">
            <button
              v-for="a in dia.itens"
              :key="a.id"
              class="flex w-full items-center gap-2 rounded-xl border border-line bg-surface/60 px-2.5 py-2 text-left transition hover:border-primary-light hover:bg-primary-tint"
              @click="abrirDetalhes(a)"
            >
              <span class="tnum w-10 shrink-0 font-display text-xs font-semibold text-primary-deep">
                {{ formatarHora(a.hora_inicio) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium text-ink">{{ a.cliente?.nome }}</span>
                <span class="block truncate text-xs text-muted">{{ a.servico?.nome }}</span>
              </span>
            </button>

            <button
              v-if="!dia.itens.length"
              class="w-full rounded-xl border border-dashed border-line py-2 text-xs text-muted/70 transition hover:border-primary-light hover:text-primary-deep"
              @click="abrirNovo(dia.iso)"
            >
              + Agendar
            </button>
          </div>
        </div>
      </div>

      <!-- ===== MÊS ===== -->
      <div v-else class="rounded-2xl border border-line bg-card p-3 shadow-card sm:p-4">
        <div class="mb-2 grid grid-cols-7 gap-1">
          <div
            v-for="d in SEMANA"
            :key="d"
            class="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted"
          >
            {{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="cel in gridMes"
            :key="cel.iso"
            class="flex aspect-square flex-col items-center justify-start rounded-xl border p-1.5 text-left transition sm:p-2"
            :class="[
              cel.noMes ? 'border-line bg-surface/40' : 'border-transparent text-muted/50',
              cel.ehHoje ? '!border-primary bg-primary-soft' : 'hover:border-primary-light hover:bg-primary-tint',
            ]"
            @click="abrirDia(cel.iso)"
          >
            <span
              class="tnum text-sm font-semibold"
              :class="cel.ehHoje ? 'text-primary-deep' : cel.noMes ? 'text-ink' : 'text-muted/50'"
            >
              {{ cel.numero }}
            </span>
            <span
              v-if="cel.total"
              class="mt-auto inline-flex items-center gap-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white"
            >
              {{ cel.total }}
            </span>
          </button>
        </div>
      </div>
    </template>

    <AgendamentoFormModal
      v-model="novoAberto"
      :data-inicial="dataNova"
      :hora-inicial="horaPreSelecionada"
      @salvo="carregar"
    />
    <AgendamentoDetalhesModal
      v-model="detalhesAberto"
      :agendamento="selecionado"
      @alterado="carregar"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { agendamentoService } from '@/services/agendamento.service';

const props = withDefaults(
  defineProps<{
    inicio: string;
    fim: string;
    data: string;
    duracaoPadrao?: number;
    label?: string;
    required?: boolean;
    inicioDia?: string;
    fimDia?: string;
    passo?: number;
    // Ao editar um agendamento existente, ignora ele mesmo na checagem de
    // horários ocupados (senão o próprio intervalo apareceria bloqueado).
    ignorarAgendamentoId?: number;
  }>(),
  {
    duracaoPadrao: 30,
    inicioDia: '07:00',
    fimDia: '21:00',
    passo: 30,
  },
);

const emit = defineEmits<{
  (e: 'update:inicio', v: string): void;
  (e: 'update:fim', v: string): void;
}>();

const aberto = ref(false);
const carregando = ref(false);
const ocupados = ref<{ ini: number; fim: number }[]>([]);

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function toStr(v: number): string {
  return `${Math.floor(v / 60)
    .toString()
    .padStart(2, '0')}:${(v % 60).toString().padStart(2, '0')}`;
}

// Carrega os atendimentos do dia para marcar horários ocupados.
async function carregarOcupados() {
  if (!props.data) {
    ocupados.value = [];
    return;
  }
  carregando.value = true;
  try {
    const itens = await agendamentoService.listarPorData(props.data);
    ocupados.value = itens
      .filter(
        (a) =>
          a.status !== 'CANCELADO' && a.id !== props.ignorarAgendamentoId,
      )
      .map((a) => ({ ini: toMin(a.hora_inicio), fim: toMin(a.hora_fim) }));
  } finally {
    carregando.value = false;
  }
}

watch(aberto, (o) => {
  if (o) carregarOcupados();
});

const inicioSel = computed(() => (props.inicio ? toMin(props.inicio) : null));
const fimSel = computed(() => (props.fim ? toMin(props.fim) : null));

// Um bloco [a, a+passo) está livre se não toca nenhum intervalo ocupado.
function blocoOcupado(a: number): boolean {
  const b = a + props.passo;
  return ocupados.value.some((o) => o.ini < b && o.fim > a);
}

// True se todo o intervalo [a, b) está livre.
function intervaloLivre(a: number, b: number): boolean {
  return !ocupados.value.some((o) => o.ini < b && o.fim > a);
}

// Blocos do dia agrupados por período.
const periodos = computed(() => {
  const a = toMin(props.inicioDia);
  const z = toMin(props.fimDia);
  const grupos: Record<string, { min: number; label: string; ocupado: boolean }[]> = {
    Manhã: [],
    Tarde: [],
    Noite: [],
  };
  for (let t = a; t <= z; t += props.passo) {
    const h = Math.floor(t / 60);
    const nome = h < 12 ? 'Manhã' : h < 18 ? 'Tarde' : 'Noite';
    grupos[nome].push({ min: t, label: toStr(t), ocupado: blocoOcupado(t) });
  }
  return Object.entries(grupos)
    .map(([nome, itens]) => ({ nome, itens }))
    .filter((g) => g.itens.length);
});

function estaSelecionado(min: number): boolean {
  return (
    inicioSel.value != null &&
    fimSel.value != null &&
    min >= inicioSel.value &&
    min < fimSel.value
  );
}

// Inicia uma nova seleção em `min`, já cobrindo a duração padrão (limitada ao
// que estiver livre, mínimo um bloco).
function novaSelecao(min: number) {
  const desejado = min + Math.max(props.passo, Math.ceil(props.duracaoPadrao / props.passo) * props.passo);
  let fim = min + props.passo;
  for (let b = min + props.passo; b <= desejado; b += props.passo) {
    if (intervaloLivre(min, b)) fim = b;
    else break;
  }
  emit('update:inicio', toStr(min));
  emit('update:fim', toStr(fim));
}

function clicar(min: number, ocupado: boolean) {
  if (ocupado) return;
  const ini = inicioSel.value;
  if (ini == null || min < ini) {
    novaSelecao(min);
    return;
  }
  // Estende (ou ajusta) o fim incluindo o bloco clicado, se tudo estiver livre.
  const novoFim = min + props.passo;
  if (intervaloLivre(ini, novoFim)) {
    emit('update:fim', toStr(novoFim));
  } else {
    novaSelecao(min);
  }
}

function limpar() {
  emit('update:inicio', '');
  emit('update:fim', '');
}

const rotulo = computed(() =>
  props.inicio && props.fim ? `${props.inicio} – ${props.fim}` : '',
);
</script>

<template>
  <div>
    <span
      v-if="label"
      class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
    >
      {{ label }}
      <span v-if="required" class="text-primary">*</span>
    </span>

    <!-- Gatilho -->
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-xl border border-line bg-white/70 px-4 py-2.5 text-left transition hover:border-primary-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
      @click="aberto = true"
    >
      <svg class="h-5 w-5 shrink-0 text-primary-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="9" stroke-width="1.8" />
        <path stroke-linecap="round" stroke-width="1.8" d="M12 7.5V12l3 1.8" />
      </svg>
      <span class="tnum truncate" :class="rotulo ? 'text-ink' : 'text-muted/60'">
        {{ rotulo || 'Escolher horário' }}
      </span>
    </button>

    <!-- Seletor de intervalo -->
    <BaseModal v-model="aberto" title="Escolher horário">
      <div class="space-y-5">
        <p class="-mt-1 text-sm text-muted">
          Toque no início e estenda até o fim. Horários
          <span class="font-medium text-ink">ocupados</span> ficam bloqueados.
        </p>

        <p v-if="carregando" class="text-sm text-muted">Carregando horários...</p>

        <div v-for="p in periodos" :key="p.nome">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {{ p.nome }}
          </p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="b in p.itens"
              :key="b.min"
              type="button"
              :disabled="b.ocupado"
              class="tnum rounded-xl border px-2 py-2.5 text-sm font-medium transition"
              :class="
                b.ocupado
                  ? 'cursor-not-allowed border-line bg-line/40 text-muted/40 line-through'
                  : estaSelecionado(b.min)
                    ? 'border-primary bg-primary text-white shadow-glow'
                    : 'border-line text-ink hover:border-primary-light hover:bg-primary-tint'
              "
              @click="clicar(b.min, b.ocupado)"
            >
              {{ b.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rodapé fixo -->
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <button
            type="button"
            class="text-sm text-muted transition hover:text-ink"
            @click="limpar"
          >
            Limpar
          </button>
          <div class="flex items-center gap-3">
            <span v-if="rotulo" class="tnum text-sm font-semibold text-ink">{{ rotulo }}</span>
            <button
              type="button"
              class="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark disabled:opacity-50"
              :disabled="!rotulo"
              @click="aberto = false"
            >
              Confirmar
            </button>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

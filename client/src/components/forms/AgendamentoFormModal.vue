<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Cliente, Servico } from '@/types';
import { clienteService } from '@/services/cliente.service';
import { servicoService } from '@/services/servico.service';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import { formatarMoeda, formatarDuracao } from '@/utils/format';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseDatePicker from '@/components/base/BaseDatePicker.vue';
import TimeRangePicker from '@/components/base/TimeRangePicker.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import PickerModal from '@/components/base/PickerModal.vue';
import ClienteFormModal from './ClienteFormModal.vue';
import ServicoFormModal from './ServicoFormModal.vue';

const props = defineProps<{
  modelValue: boolean;
  dataInicial: string;
  horaInicial?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'salvo'): void;
}>();

const { sucesso, erro } = useToast();

const clientes = ref<Cliente[]>([]);
const servicos = ref<Servico[]>([]);
const salvando = ref(false);

// Estados dos modais auxiliares.
const pickerCliente = ref(false);
const pickerServico = ref(false);
const novoCliente = ref(false);
const novoServico = ref(false);

const form = ref({
  cliente_id: null as number | null,
  servico_id: null as number | null,
  data: props.dataInicial,
  hora_inicio: props.horaInicial ?? '',
  hora_fim: '',
  observacao: '',
});

async function carregarListas() {
  [clientes.value, servicos.value] = await Promise.all([
    clienteService.listar(),
    servicoService.listar(),
  ]);
}

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      form.value = {
        cliente_id: null,
        servico_id: null,
        data: props.dataInicial,
        hora_inicio: props.horaInicial ?? '',
        hora_fim: '',
        observacao: '',
      };
      carregarListas();
    }
  },
);

const clienteSelecionado = computed(() =>
  clientes.value.find((c) => c.id === form.value.cliente_id),
);
const servicoSelecionado = computed(() =>
  servicos.value.find((s) => s.id === form.value.servico_id),
);

// Duração resultante do intervalo escolhido (em minutos).
const duracaoSelecionada = computed(() => {
  if (!form.value.hora_inicio || !form.value.hora_fim) return 0;
  const [hi, mi] = form.value.hora_inicio.split(':').map(Number);
  const [hf, mf] = form.value.hora_fim.split(':').map(Number);
  return hf * 60 + mf - (hi * 60 + mi);
});

// Início no passado (em relação a agora) -> agendamento retroativo (histórico).
const ehRetroativo = computed(() => {
  if (!form.value.data || !form.value.hora_inicio) return false;
  return (
    new Date(`${form.value.data}T${form.value.hora_inicio}`).getTime() <
    Date.now()
  );
});

function onClienteCriado(c: Cliente) {
  clientes.value.unshift(c);
  form.value.cliente_id = c.id;
  pickerCliente.value = false;
}

function onServicoCriado(s: Servico) {
  servicos.value.unshift(s);
  form.value.servico_id = s.id;
  pickerServico.value = false;
}

function filtrarCliente(c: Cliente, q: string) {
  return (
    c.nome.toLowerCase().includes(q) ||
    (c.telefone ?? '').toLowerCase().includes(q) ||
    (c.instagram ?? '').toLowerCase().includes(q)
  );
}

function filtrarServico(s: Servico, q: string) {
  return s.nome.toLowerCase().includes(q);
}

function subtituloCliente(c: Cliente) {
  return c.telefone || c.instagram || 'Sem contato';
}

async function salvar() {
  if (!form.value.cliente_id) return erro('Selecione um cliente.');
  if (!form.value.servico_id) return erro('Selecione um serviço.');
  if (!form.value.data) return erro('Informe a data.');
  if (!form.value.hora_inicio || !form.value.hora_fim) {
    return erro('Escolha o horário.');
  }

  salvando.value = true;
  try {
    await agendamentoService.criar({
      cliente_id: form.value.cliente_id,
      servico_id: form.value.servico_id,
      data: form.value.data,
      hora_inicio: form.value.hora_inicio,
      hora_fim: form.value.hora_fim,
      observacao: form.value.observacao.trim() || undefined,
    });
    sucesso(
      ehRetroativo.value
        ? 'Atendimento registrado no histórico.'
        : 'Agendamento criado.',
    );
    emit('salvo');
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao criar agendamento.');
  } finally {
    salvando.value = false;
  }
}

// Classe do "gatilho" que imita o visual de um campo de seleção.
const triggerClasse =
  'flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-white/70 px-4 py-2.5 text-left transition hover:border-primary-light focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15';
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Novo agendamento"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="salvar">
      <!-- Cliente -->
      <div>
        <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Cliente <span class="text-primary">*</span>
        </span>
        <button type="button" :class="triggerClasse" @click="pickerCliente = true">
          <span :class="clienteSelecionado ? 'text-ink' : 'text-muted/60'">
            {{ clienteSelecionado ? clienteSelecionado.nome : 'Selecione o cliente' }}
          </span>
          <svg class="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Serviço -->
      <div>
        <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Serviço <span class="text-primary">*</span>
        </span>
        <button type="button" :class="triggerClasse" @click="pickerServico = true">
          <span :class="servicoSelecionado ? 'text-ink' : 'text-muted/60'">
            {{ servicoSelecionado ? servicoSelecionado.nome : 'Selecione o serviço' }}
          </span>
          <svg class="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Data -->
      <BaseDatePicker v-model="form.data" label="Data" required />

      <!-- Horário (intervalo) -->
      <TimeRangePicker
        v-model:inicio="form.hora_inicio"
        v-model:fim="form.hora_fim"
        :data="form.data"
        :duracao-padrao="servicoSelecionado?.duracao_minuto ?? 30"
        label="Horário"
        required
      />

      <!-- Resumo do intervalo -->
      <div
        v-if="servicoSelecionado && duracaoSelecionada > 0"
        class="flex items-center justify-between rounded-xl bg-primary-soft/60 px-4 py-3 text-sm"
      >
        <span class="text-primary-deep">
          Duração
          <span class="font-medium">{{ formatarDuracao(duracaoSelecionada) }}</span>
        </span>
        <span class="font-semibold text-primary-deep">
          {{ formatarMoeda(servicoSelecionado.valor) }}
        </span>
      </div>

      <BaseTextarea v-model="form.observacao" label="Observação" :rows="2" placeholder="Opcional" />

      <!-- Aviso de agendamento retroativo -->
      <div
        v-if="ehRetroativo"
        class="flex items-start gap-2.5 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink"
      >
        <svg class="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l2 2m6-2a8 8 0 11-3.3-6.5M20 4v4h-4" />
        </svg>
        <span>
          Esse horário já passou. Será salvo como
          <strong class="font-semibold">retroativo</strong> e marcado como
          <strong class="font-semibold">concluído</strong> (histórico).
        </span>
      </div>

      <div class="flex gap-3 pt-2">
        <BaseButton variant="ghost" block type="button" @click="emit('update:modelValue', false)">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" block type="submit" :loading="salvando">
          {{ ehRetroativo ? 'Registrar' : 'Agendar' }}
        </BaseButton>
      </div>
    </form>

    <!-- Picker de clientes -->
    <PickerModal
      v-model="pickerCliente"
      title="Selecionar cliente"
      search-placeholder="Buscar por nome ou telefone..."
      novo-label="Novo cliente"
      vazio-texto="Nenhum cliente encontrado."
      avatar
      :items="clientes"
      :selected-id="form.cliente_id"
      :get-key="(c) => c.id"
      :get-label="(c) => c.nome"
      :get-subtitle="subtituloCliente"
      :filtro="filtrarCliente"
      @select="(c) => (form.cliente_id = c.id)"
      @novo="novoCliente = true"
    />

    <!-- Picker de serviços -->
    <PickerModal
      v-model="pickerServico"
      title="Selecionar serviço"
      search-placeholder="Buscar serviço..."
      novo-label="Novo serviço"
      vazio-texto="Nenhum serviço encontrado."
      :items="servicos"
      :selected-id="form.servico_id"
      :get-key="(s) => s.id"
      :get-label="(s) => s.nome"
      :get-subtitle="(s) => formatarDuracao(s.duracao_minuto)"
      :get-trailing="(s) => formatarMoeda(s.valor)"
      :filtro="filtrarServico"
      @select="(s) => (form.servico_id = s.id)"
      @novo="novoServico = true"
    />

    <!-- Cadastros rápidos -->
    <ClienteFormModal v-model="novoCliente" @salvo="onClienteCriado" />
    <ServicoFormModal v-model="novoServico" @salvo="onServicoCriado" />
  </BaseModal>
</template>

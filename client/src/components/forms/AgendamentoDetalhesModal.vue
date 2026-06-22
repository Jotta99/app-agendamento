<script setup lang="ts">
import { ref } from 'vue';
import type { Agendamento, StatusAgendamento } from '@/types';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import {
  formatarHora,
  formatarMoeda,
  formatarDataExtensa,
} from '@/utils/format';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseBadge from '@/components/base/BaseBadge.vue';
import BaseAvatar from '@/components/base/BaseAvatar.vue';
import BaseStars from '@/components/base/BaseStars.vue';
import AvaliacaoModal from './AvaliacaoModal.vue';

const props = defineProps<{
  modelValue: boolean;
  agendamento: Agendamento | null;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'alterado'): void;
}>();

const { sucesso, erro } = useToast();
const { confirmar } = useConfirm();
const processando = ref(false);
const avaliarAberto = ref(false);

function onConcluido() {
  emit('alterado');
  emit('update:modelValue', false);
}

async function mudarStatus(status: StatusAgendamento) {
  if (!props.agendamento) return;
  processando.value = true;
  try {
    await agendamentoService.atualizar(props.agendamento.id, { status });
    sucesso('Agendamento atualizado.');
    emit('alterado');
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao atualizar.');
  } finally {
    processando.value = false;
  }
}

async function alternarPago() {
  if (!props.agendamento) return;
  processando.value = true;
  try {
    const atualizado = await agendamentoService.atualizar(
      props.agendamento.id,
      { pago: !props.agendamento.pago },
    );
    props.agendamento.pago = atualizado.pago;
    sucesso(atualizado.pago ? 'Marcado como pago.' : 'Marcado como a receber.');
    emit('alterado');
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao atualizar.');
  } finally {
    processando.value = false;
  }
}

async function excluir() {
  if (!props.agendamento) return;
  const ok = await confirmar({
    titulo: 'Excluir agendamento',
    mensagem: 'Esta ação não pode ser desfeita.',
    confirmarLabel: 'Excluir',
    perigo: true,
  });
  if (!ok) return;
  processando.value = true;
  try {
    await agendamentoService.remover(props.agendamento.id);
    sucesso('Agendamento excluído.');
    emit('alterado');
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao excluir.');
  } finally {
    processando.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Detalhes do agendamento"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="agendamento" class="space-y-5">
      <!-- Cliente -->
      <div class="flex items-center gap-3">
        <BaseAvatar :nome="agendamento.cliente?.nome" size="lg" />
        <div class="min-w-0">
          <p class="truncate text-lg font-semibold text-ink">
            {{ agendamento.cliente?.nome }}
          </p>
          <p v-if="agendamento.cliente?.instagram" class="text-sm text-muted">
            {{ agendamento.cliente.instagram }}
          </p>
        </div>
        <BaseBadge :status="agendamento.status" class="ml-auto" />
      </div>

      <!-- Infos -->
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl bg-surface px-4 py-3">
          <p class="text-muted">Serviço</p>
          <p class="font-medium text-ink">{{ agendamento.servico?.nome }}</p>
        </div>
        <div class="rounded-xl bg-surface px-4 py-3">
          <p class="text-muted">Valor</p>
          <p class="font-medium text-ink">{{ formatarMoeda(agendamento.valor) }}</p>
        </div>
        <div class="rounded-xl bg-surface px-4 py-3">
          <p class="text-muted">Data</p>
          <p class="font-medium capitalize text-ink">
            {{ formatarDataExtensa(agendamento.data) }}
          </p>
        </div>
        <div class="rounded-xl bg-surface px-4 py-3">
          <p class="text-muted">Horário</p>
          <p class="font-medium text-ink">
            {{ formatarHora(agendamento.hora_inicio) }} –
            {{ formatarHora(agendamento.hora_fim) }}
          </p>
        </div>
      </div>

      <div v-if="agendamento.observacao" class="rounded-xl bg-surface px-4 py-3 text-sm">
        <p class="text-muted">Observação</p>
        <p class="text-ink">{{ agendamento.observacao }}</p>
      </div>

      <!-- Avaliação registrada -->
      <div
        v-if="agendamento.avaliacao_atendimento"
        class="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm"
      >
        <div class="flex items-center justify-between">
          <p class="font-medium text-ink">Avaliação</p>
          <BaseStars
            :model-value="agendamento.avaliacao_atendimento.avaliacao"
            readonly
            :size="18"
          />
        </div>
        <p
          v-if="agendamento.avaliacao_atendimento.observacao"
          class="mt-1.5 text-ink"
        >
          {{ agendamento.avaliacao_atendimento.observacao }}
        </p>
      </div>

      <!-- Pagamento -->
      <button
        class="flex w-full items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm transition hover:bg-surface"
        :disabled="processando"
        @click="alternarPago"
      >
        <span class="font-medium text-ink">Pagamento</span>
        <span
          class="font-semibold"
          :class="agendamento.pago ? 'text-success' : 'text-muted'"
        >
          {{ agendamento.pago ? '✓ Pago' : 'A receber' }}
        </span>
      </button>

      <!-- Ações -->
      <div class="space-y-2">
        <div
          v-if="agendamento.status === 'AGENDADO'"
          class="grid grid-cols-2 gap-3"
        >
          <BaseButton
            variant="success"
            block
            :loading="processando"
            @click="avaliarAberto = true"
          >
            Concluir
          </BaseButton>
          <BaseButton
            variant="secondary"
            block
            :loading="processando"
            @click="mudarStatus('FALTOU')"
          >
            Faltou
          </BaseButton>
        </div>
        <BaseButton
          v-if="agendamento.status === 'AGENDADO'"
          variant="ghost"
          block
          :loading="processando"
          @click="mudarStatus('CANCELADO')"
        >
          Cancelar atendimento
        </BaseButton>
        <BaseButton
          variant="danger"
          block
          :loading="processando"
          @click="excluir"
        >
          Excluir
        </BaseButton>
      </div>
    </div>

    <!-- Concluir + avaliar -->
    <AvaliacaoModal
      v-model="avaliarAberto"
      :agendamento-id="agendamento?.id ?? null"
      @concluido="onConcluido"
    />
  </BaseModal>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue';
import { agendamentoService } from '@/services/agendamento.service';
import { useToast } from '@/composables/useToast';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseStars from '@/components/base/BaseStars.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{ modelValue: boolean; agendamentoId: number | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'concluido'): void;
}>();

const { sucesso, erro } = useToast();
const nota = ref(0);
const observacao = ref('');
const salvando = ref(false);

const LEGENDAS = ['', 'Ruim', 'Regular', 'Bom', 'Muito bom', 'Excelente'];

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      nota.value = 0;
      observacao.value = '';
    }
  },
);

async function salvar() {
  if (!props.agendamentoId) return;
  if (nota.value < 1) return erro('Selecione de 1 a 5 estrelas.');

  salvando.value = true;
  try {
    await agendamentoService.concluir(props.agendamentoId, {
      avaliacao: nota.value,
      observacao: observacao.value.trim() || undefined,
    });
    sucesso('Atendimento concluído e avaliado.');
    emit('concluido');
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao concluir.');
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    title="Avaliar atendimento"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-5">
      <!-- Estrelas -->
      <div class="flex flex-col items-center gap-2 py-2">
        <BaseStars v-model="nota" :size="40" />
        <p class="h-5 text-sm font-medium text-primary-deep">
          {{ LEGENDAS[nota] }}
        </p>
      </div>

      <!-- Observação (opcional) -->
      <div>
        <BaseTextarea
          v-model="observacao"
          label="Observação (opcional)"
          :rows="3"
          :maxlength="250"
          placeholder="Como foi o atendimento?"
        />
        <p class="mt-1 text-right text-xs text-muted">
          {{ observacao.length }}/250
        </p>
      </div>

    </div>

    <template #footer>
      <div class="flex gap-3">
        <BaseButton variant="ghost" block type="button" @click="emit('update:modelValue', false)">
          Cancelar
        </BaseButton>
        <BaseButton variant="success" block :loading="salvando" @click="salvar">
          Concluir
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

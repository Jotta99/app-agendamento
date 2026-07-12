<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Cliente } from '@/types';
import { clienteService } from '@/services/cliente.service';
import { useToast } from '@/composables/useToast';
import { useConfirm } from '@/composables/useConfirm';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BasePhoneInput from '@/components/base/BasePhoneInput.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{ modelValue: boolean; cliente?: Cliente | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'salvo', cliente: Cliente): void;
  (e: 'excluido'): void;
}>();

const { sucesso, erro } = useToast();
const { confirmar } = useConfirm();
const salvando = ref(false);
const excluindo = ref(false);
const form = ref({ nome: '', telefone: '', instagram: '', observacao: '' });

// Preenche o formulário ao abrir (novo ou edição).
watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      form.value = {
        nome: props.cliente?.nome ?? '',
        telefone: props.cliente?.telefone ?? '',
        instagram: props.cliente?.instagram ?? '',
        observacao: props.cliente?.observacao ?? '',
      };
    }
  },
);

async function salvar() {
  if (!form.value.nome.trim()) {
    erro('Informe o nome do cliente.');
    return;
  }
  salvando.value = true;
  try {
    const payload = {
      nome: form.value.nome.trim(),
      telefone: form.value.telefone.trim() || null,
      instagram: form.value.instagram.trim() || null,
      observacao: form.value.observacao.trim() || null,
    };
    const salvo = props.cliente
      ? await clienteService.atualizar(props.cliente.id, payload)
      : await clienteService.criar(payload);
    sucesso(props.cliente ? 'Cliente atualizado.' : 'Cliente cadastrado.');
    emit('salvo', salvo);
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao salvar cliente.');
  } finally {
    salvando.value = false;
  }
}

async function excluir() {
  if (!props.cliente) return;
  const ok = await confirmar({
    titulo: 'Excluir cliente',
    mensagem: `Excluir "${props.cliente.nome}"? O histórico de agendamentos dele é mantido.`,
    confirmarLabel: 'Excluir',
    perigo: true,
  });
  if (!ok) return;

  excluindo.value = true;
  try {
    await clienteService.remover(props.cliente.id);
    sucesso('Cliente excluído.');
    emit('excluido');
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao excluir cliente.');
  } finally {
    excluindo.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="cliente ? 'Editar cliente' : 'Novo cliente'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="salvar">
      <BaseInput v-model="form.nome" label="Nome" placeholder="Nome completo" required />
      <BasePhoneInput v-model="form.telefone" label="Telefone" />
      <BaseInput v-model="form.instagram" label="Instagram" placeholder="@usuario" />
      <BaseTextarea v-model="form.observacao" label="Observação" placeholder="Preferências, alergias..." />

      <div v-if="cliente" class="border-t border-line pt-4">
        <BaseButton variant="danger" block type="button" :loading="excluindo" @click="excluir">
          Excluir cliente
        </BaseButton>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <div class="flex gap-3">
        <BaseButton variant="ghost" block type="button" @click="emit('update:modelValue', false)">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" block type="button" :loading="salvando" @click="salvar">
          Salvar
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

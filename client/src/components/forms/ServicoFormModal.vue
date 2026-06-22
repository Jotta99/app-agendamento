<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Servico } from '@/types';
import { servicoService } from '@/services/servico.service';
import { useToast } from '@/composables/useToast';
import BaseModal from '@/components/base/BaseModal.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseStepper from '@/components/base/BaseStepper.vue';
import BaseTextarea from '@/components/base/BaseTextarea.vue';
import BaseMoneyInput from '@/components/base/BaseMoneyInput.vue';
import BaseButton from '@/components/base/BaseButton.vue';

const props = defineProps<{ modelValue: boolean; servico?: Servico | null }>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'salvo', servico: Servico): void;
}>();

const { sucesso, erro } = useToast();
const salvando = ref(false);

// Minutos disponíveis (de 5 em 5).
const minutosChips = Array.from({ length: 12 }, (_, i) => i * 5);

const form = ref({
  nome: '',
  descricao: '',
  horas: 1,
  minutos: 0,
  valor: null as number | null,
});

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) {
      const total = props.servico?.duracao_minuto ?? 60;
      form.value = {
        nome: props.servico?.nome ?? '',
        descricao: props.servico?.descricao ?? '',
        horas: Math.floor(total / 60),
        minutos: total % 60,
        valor: props.servico ? Number(props.servico.valor) : null,
      };
    }
  },
);

async function salvar() {
  if (!form.value.nome.trim()) return erro('Informe o nome do serviço.');

  const horas = Number(form.value.horas) || 0;
  const minutos = Number(form.value.minutos) || 0;
  const duracao = horas * 60 + minutos; // salvo em minutos
  if (duracao < 1) return erro('Informe a duração do serviço.');

  if (form.value.valor == null || form.value.valor < 0) {
    return erro('Informe um valor válido.');
  }

  salvando.value = true;
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim() || null,
      duracao_minuto: duracao,
      valor: form.value.valor, // número puro
    };
    const salvo = props.servico
      ? await servicoService.atualizar(props.servico.id, payload)
      : await servicoService.criar(payload);
    sucesso(props.servico ? 'Serviço atualizado.' : 'Serviço cadastrado.');
    emit('salvo', salvo);
    emit('update:modelValue', false);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao salvar serviço.');
  } finally {
    salvando.value = false;
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="servico ? 'Editar serviço' : 'Novo serviço'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <form class="space-y-4" @submit.prevent="salvar">
      <BaseInput v-model="form.nome" label="Nome" placeholder="Ex.: Manicure" required />
      <BaseTextarea v-model="form.descricao" label="Descrição" placeholder="Detalhes do serviço" :rows="2" />

      <!-- Duração em horas e minutos (salva em minutos) -->
      <div>
        <span class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Duração <span class="text-primary">*</span>
        </span>
        <div class="space-y-3 rounded-xl border border-line bg-white/70 p-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-muted">Horas</span>
            <BaseStepper v-model="form.horas" :min="0" :max="12" suffix="h" />
          </div>
          <div>
            <span class="text-sm font-medium text-muted">Minutos</span>
            <div class="mt-2 flex flex-wrap gap-1.5">
              <button
                v-for="m in minutosChips"
                :key="m"
                type="button"
                class="tnum h-9 w-12 rounded-lg border text-sm font-medium transition"
                :class="
                  form.minutos === m
                    ? 'border-primary bg-primary text-white shadow-glow'
                    : 'border-line bg-card text-ink hover:border-primary-light hover:bg-primary-tint'
                "
                @click="form.minutos = m"
              >
                {{ String(m).padStart(2, '0') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BaseMoneyInput v-model="form.valor" label="Valor" required placeholder="0,00" />
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

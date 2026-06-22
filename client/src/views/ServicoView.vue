<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import ServicoFormModal from '@/components/forms/ServicoFormModal.vue';
import { servicoService } from '@/services/servico.service';
import { useToast } from '@/composables/useToast';
import { formatarMoeda, formatarDuracao } from '@/utils/format';
import type { Servico } from '@/types';

const { erro } = useToast();
const carregando = ref(true);
const servicos = ref<Servico[]>([]);

const modalAberto = ref(false);
const emEdicao = ref<Servico | null>(null);

async function carregar() {
  carregando.value = true;
  try {
    servicos.value = await servicoService.listar();
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar serviços.');
  } finally {
    carregando.value = false;
  }
}

function novo() {
  emEdicao.value = null;
  modalAberto.value = true;
}

function editar(s: Servico) {
  emEdicao.value = s;
  modalAberto.value = true;
}

onMounted(carregar);
</script>

<template>
  <AppLayout>
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-deep">
          Sua lista
        </p>
        <h1 class="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Serviços
        </h1>
      </div>
      <BaseButton variant="primary" @click="novo">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo serviço
      </BaseButton>
    </header>

    <LoadingSpinner v-if="carregando" />

    <template v-else>
      <div v-if="servicos.length" class="stagger grid gap-3 sm:grid-cols-2">
        <button
          v-for="(s, i) in servicos"
          :key="s.id"
          class="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-light hover:shadow-soft"
          :style="{ animationDelay: i * 40 + 'ms' }"
          @click="editar(s)"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold text-ink">{{ s.nome }}</p>
            <p class="mt-0.5 inline-flex items-center gap-1.5 text-sm text-muted">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="9" stroke-width="1.6" />
                <path stroke-linecap="round" stroke-width="1.6" d="M12 8v4l2.5 1.5" />
              </svg>
              {{ formatarDuracao(s.duracao_minuto) }}
            </p>
          </div>
          <span class="tnum shrink-0 font-display text-lg font-semibold text-primary-deep">
            {{ formatarMoeda(s.valor) }}
          </span>
        </button>
      </div>

      <EmptyState
        v-else
        titulo="Nenhum serviço ainda"
        descricao="Cadastre os serviços que você oferece para agilizar os agendamentos."
      >
        <template #action>
          <BaseButton variant="primary" @click="novo">Cadastrar serviço</BaseButton>
        </template>
      </EmptyState>
    </template>

    <ServicoFormModal
      v-model="modalAberto"
      :servico="emEdicao"
      @salvo="carregar"
    />
  </AppLayout>
</template>

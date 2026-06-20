<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';
import BaseAvatar from '@/components/base/BaseAvatar.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import LoadingSpinner from '@/components/base/LoadingSpinner.vue';
import ClienteFormModal from '@/components/forms/ClienteFormModal.vue';
import { clienteService } from '@/services/cliente.service';
import { useToast } from '@/composables/useToast';
import type { Cliente } from '@/types';

const { erro } = useToast();
const carregando = ref(true);
const clientes = ref<Cliente[]>([]);
const busca = ref('');
let debounce: ReturnType<typeof setTimeout>;

const modalAberto = ref(false);
const emEdicao = ref<Cliente | null>(null);

async function carregar() {
  carregando.value = true;
  try {
    clientes.value = await clienteService.listar(busca.value || undefined);
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Erro ao carregar clientes.');
  } finally {
    carregando.value = false;
  }
}

function onBusca(v: string) {
  busca.value = v;
  clearTimeout(debounce);
  debounce = setTimeout(carregar, 300);
}

function novo() {
  emEdicao.value = null;
  modalAberto.value = true;
}

function editar(c: Cliente) {
  emEdicao.value = c;
  modalAberto.value = true;
}

onMounted(carregar);
</script>

<template>
  <AppLayout>
    <header class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-deep">
          Sua carteira
        </p>
        <h1 class="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">
          Clientes
        </h1>
      </div>
      <BaseButton variant="primary" @click="novo">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Novo cliente
      </BaseButton>
    </header>

    <!-- Busca -->
    <div class="mb-5">
      <BaseInput
        :model-value="busca"
        placeholder="Buscar por nome ou telefone..."
        icon
        @update:model-value="onBusca"
      >
        <template #icon>
          <svg
            class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </template>
      </BaseInput>
    </div>

    <LoadingSpinner v-if="carregando" />

    <template v-else>
      <div v-if="clientes.length" class="stagger space-y-2">
        <button
          v-for="(c, i) in clientes"
          :key="c.id"
          class="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-3 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-light hover:shadow-soft"
          :style="{ animationDelay: i * 40 + 'ms' }"
          @click="editar(c)"
        >
          <BaseAvatar :nome="c.nome" />
          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-ink">{{ c.nome }}</p>
            <p class="truncate text-sm text-muted">
              <span v-if="c.telefone">{{ c.telefone }}</span>
              <span v-if="c.telefone && c.instagram"> • </span>
              <span v-if="c.instagram">{{ c.instagram }}</span>
              <span v-if="!c.telefone && !c.instagram">Sem contato</span>
            </p>
          </div>
          <svg class="h-5 w-5 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <EmptyState
        v-else
        :titulo="busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'"
        :descricao="busca ? 'Tente outro termo de busca.' : 'Cadastre seu primeiro cliente.'"
      >
        <template #action>
          <BaseButton v-if="!busca" variant="primary" @click="novo">
            Cadastrar cliente
          </BaseButton>
        </template>
      </EmptyState>
    </template>

    <ClienteFormModal
      v-model="modalAberto"
      :cliente="emEdicao"
      @salvo="carregar"
    />
  </AppLayout>
</template>

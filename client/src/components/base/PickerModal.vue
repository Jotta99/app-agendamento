<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseInput from './BaseInput.vue';
import BaseAvatar from './BaseAvatar.vue';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  items: any[];
  selectedId?: number | string | null;
  searchPlaceholder?: string;
  novoLabel?: string;
  avatar?: boolean;
  vazioTexto?: string;
  getKey: (item: any) => number | string;
  getLabel: (item: any) => string;
  getSubtitle?: (item: any) => string;
  getTrailing?: (item: any) => string;
  filtro: (item: any, q: string) => boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'select', item: any): void;
  (e: 'novo'): void;
}>();

const busca = ref('');

watch(
  () => props.modelValue,
  (aberto) => {
    if (aberto) busca.value = '';
  },
);

const filtrados = computed(() => {
  const q = busca.value.trim().toLowerCase();
  if (!q) return props.items;
  return props.items.filter((i) => props.filtro(i, q));
});

function escolher(item: any) {
  emit('select', item);
  emit('update:modelValue', false);
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3">
      <!-- Busca -->
      <BaseInput
        v-model="busca"
        :placeholder="searchPlaceholder ?? 'Buscar...'"
        icon
      >
        <template #icon>
          <svg
            class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </template>
      </BaseInput>

      <!-- Lista -->
      <div class="-mx-1 max-h-72 space-y-1.5 overflow-y-auto px-1 no-scrollbar">
        <button
          v-for="item in filtrados"
          :key="getKey(item)"
          type="button"
          class="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition"
          :class="
            getKey(item) === selectedId
              ? 'border-primary bg-primary-soft'
              : 'border-line bg-card hover:border-primary-light hover:bg-primary-tint'
          "
          @click="escolher(item)"
        >
          <BaseAvatar v-if="avatar" :nome="getLabel(item)" size="sm" />
          <span class="min-w-0 flex-1">
            <span class="block truncate font-medium text-ink">
              {{ getLabel(item) }}
            </span>
            <span
              v-if="getSubtitle"
              class="block truncate text-sm text-muted"
            >
              {{ getSubtitle(item) }}
            </span>
          </span>
          <span
            v-if="getTrailing"
            class="tnum shrink-0 font-display text-sm font-semibold text-primary-deep"
          >
            {{ getTrailing(item) }}
          </span>
        </button>

        <p
          v-if="!filtrados.length"
          class="py-6 text-center text-sm text-muted"
        >
          {{ vazioTexto ?? 'Nada encontrado.' }}
        </p>
      </div>

      <!-- Criar novo -->
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-light bg-primary-tint/60 py-2.5 text-sm font-semibold text-primary-deep transition hover:bg-primary-soft"
        @click="emit('novo')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ novoLabel ?? 'Novo' }}
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import {
  somarDias,
  somarMeses,
  inicioDoMes,
  inicioDaSemana,
  nomeMesAno,
  diaDoMes,
  mesmoMes,
  hojeISO,
  formatarDataCurta,
} from '@/utils/format';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
  }>(),
  { placeholder: 'Selecione' },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const aberto = ref(false);
const viewMes = ref(inicioDoMes(props.modelValue || hojeISO()));

// Reposiciona o calendário no mês da data atual ao abrir.
watch(aberto, (o) => {
  if (o) viewMes.value = inicioDoMes(props.modelValue || hojeISO());
});

const dias = computed(() => {
  const inicio = inicioDaSemana(viewMes.value);
  return Array.from({ length: 42 }, (_, i) => {
    const iso = somarDias(inicio, i);
    return {
      iso,
      numero: diaDoMes(iso),
      noMes: mesmoMes(iso, viewMes.value),
      ehHoje: iso === hojeISO(),
      selecionado: iso === props.modelValue,
    };
  });
});

const rotulo = computed(() =>
  props.modelValue ? formatarDataCurta(props.modelValue) : props.placeholder,
);

function escolher(iso: string) {
  emit('update:modelValue', iso);
  aberto.value = false;
}

function navegar(d: number) {
  viewMes.value = somarMeses(viewMes.value, d);
}
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="tnum truncate" :class="modelValue ? 'text-ink' : 'text-muted/60'">
        {{ rotulo }}
      </span>
    </button>

    <!-- Calendário -->
    <BaseModal v-model="aberto" title="Selecionar data">
      <!-- Navegação de mês -->
      <div class="mb-4 flex items-center justify-between">
        <button
          type="button"
          class="rounded-lg p-2 text-muted transition hover:bg-subtle hover:text-ink"
          @click="navegar(-1)"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p class="font-display text-lg font-semibold capitalize text-ink">
          {{ nomeMesAno(viewMes) }}
        </p>
        <button
          type="button"
          class="rounded-lg p-2 text-muted transition hover:bg-subtle hover:text-ink"
          @click="navegar(1)"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Cabeçalho de dias da semana -->
      <div class="mb-1 grid grid-cols-7">
        <span
          v-for="d in SEMANA"
          :key="d"
          class="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted"
        >
          {{ d.charAt(0) }}
        </span>
      </div>

      <!-- Grade de dias -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="d in dias"
          :key="d.iso"
          type="button"
          class="tnum mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition"
          :class="
            d.selecionado
              ? 'bg-primary text-white font-semibold shadow-glow'
              : d.ehHoje
                ? 'font-semibold text-primary-deep ring-1 ring-primary/40 hover:bg-primary-soft'
                : d.noMes
                  ? 'text-ink hover:bg-primary-soft'
                  : 'text-muted/40 hover:bg-subtle'
          "
          @click="escolher(d.iso)"
        >
          {{ d.numero }}
        </button>
      </div>

      <!-- Rodapé -->
      <div class="mt-4 flex items-center justify-between border-t border-line pt-3">
        <button
          type="button"
          class="text-sm font-semibold text-primary-deep hover:underline"
          @click="escolher(hojeISO())"
        >
          Hoje
        </button>
        <button
          type="button"
          class="text-sm text-muted transition hover:text-ink"
          @click="aberto = false"
        >
          Fechar
        </button>
      </div>
    </BaseModal>
  </div>
</template>

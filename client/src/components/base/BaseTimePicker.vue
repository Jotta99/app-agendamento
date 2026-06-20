<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from './BaseModal.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    inicio?: string;
    fim?: string;
    intervalo?: number;
  }>(),
  {
    placeholder: 'Escolher',
    inicio: '07:00',
    fim: '21:00',
    intervalo: 30,
  },
);

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const aberto = ref(false);

function paraMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function deMin(v: number): string {
  return `${Math.floor(v / 60)
    .toString()
    .padStart(2, '0')}:${(v % 60).toString().padStart(2, '0')}`;
}

// Agrupa os horários por período (manhã / tarde / noite) para leitura rápida.
const periodos = computed(() => {
  const a = paraMin(props.inicio);
  const b = paraMin(props.fim);
  const manha: string[] = [];
  const tarde: string[] = [];
  const noite: string[] = [];
  for (let t = a; t <= b; t += props.intervalo) {
    const h = Math.floor(t / 60);
    const v = deMin(t);
    if (h < 12) manha.push(v);
    else if (h < 18) tarde.push(v);
    else noite.push(v);
  }
  return [
    { nome: 'Manhã', itens: manha },
    { nome: 'Tarde', itens: tarde },
    { nome: 'Noite', itens: noite },
  ].filter((p) => p.itens.length);
});

function escolher(t: string) {
  emit('update:modelValue', t);
  aberto.value = false;
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
        <circle cx="12" cy="12" r="9" stroke-width="1.8" />
        <path stroke-linecap="round" stroke-width="1.8" d="M12 7.5V12l3 1.8" />
      </svg>
      <span class="tnum truncate" :class="modelValue ? 'text-ink' : 'text-muted/60'">
        {{ modelValue || placeholder }}
      </span>
    </button>

    <!-- Seletor de horário -->
    <BaseModal v-model="aberto" title="Selecionar horário">
      <div class="space-y-5">
        <div v-for="p in periodos" :key="p.nome">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {{ p.nome }}
          </p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="t in p.itens"
              :key="t"
              type="button"
              class="tnum rounded-xl border px-2 py-2.5 text-sm font-medium transition"
              :class="
                t === modelValue
                  ? 'border-primary bg-primary text-white shadow-glow'
                  : 'border-line text-ink hover:border-primary-light hover:bg-primary-tint'
              "
              @click="escolher(t)"
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

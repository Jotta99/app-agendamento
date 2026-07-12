<script setup lang="ts">
import { computed } from 'vue';
import { formatarMoeda } from '@/utils/format';

const props = defineProps<{ pago: number; aReceber: number }>();

const total = computed(() => props.pago + props.aReceber);
const pctPago = computed(() => (total.value ? (props.pago / total.value) * 100 : 0));
</script>

<template>
  <div>
    <div class="flex h-3 overflow-hidden rounded-full bg-subtle">
      <div
        class="h-full bg-success transition-all duration-500"
        :style="{ width: pctPago + '%' }"
      ></div>
      <div
        class="h-full bg-gold/70 transition-all duration-500"
        :style="{ width: 100 - pctPago + '%' }"
      ></div>
    </div>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
      <span class="flex items-center gap-2">
        <span class="h-2 w-2 shrink-0 rounded-full bg-success"></span>
        <span class="text-muted">Recebido</span>
        <span class="tnum font-semibold text-ink">{{ formatarMoeda(pago) }}</span>
      </span>
      <span class="flex items-center gap-2">
        <span class="h-2 w-2 shrink-0 rounded-full bg-gold/70"></span>
        <span class="text-muted">A receber</span>
        <span class="tnum font-semibold text-ink">{{ formatarMoeda(aReceber) }}</span>
      </span>
    </div>
    <p v-if="!total" class="mt-2 text-sm text-muted">Sem dados no período.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatarMoeda } from '@/utils/format';

const props = defineProps<{
  itens: { servico_id: number; nome: string; total: number; receita: number }[];
}>();

const maximo = computed(() => Math.max(1, ...props.itens.map((i) => i.receita)));
</script>

<template>
  <ul class="space-y-3.5">
    <li v-for="(item, i) in itens" :key="item.servico_id" class="space-y-1.5">
      <div class="flex items-center justify-between gap-2 text-sm">
        <span class="truncate font-medium text-ink">
          <span class="tnum mr-1.5 text-muted">{{ i + 1 }}.</span>{{ item.nome }}
        </span>
        <span class="tnum shrink-0 font-semibold text-ink">
          {{ formatarMoeda(item.receita) }}
        </span>
      </div>
      <div class="h-1.5 overflow-hidden rounded-full bg-subtle">
        <div
          class="h-full rounded-full bg-gradient-to-r from-primary-light to-primary transition-all duration-500"
          :style="{ width: Math.max((item.receita / maximo) * 100, 4) + '%' }"
        ></div>
      </div>
      <p class="text-xs text-muted">
        {{ item.total }} atendimento{{ item.total === 1 ? '' : 's' }}
      </p>
    </li>
    <li v-if="!itens.length" class="text-sm text-muted">
      Sem atendimentos no período.
    </li>
  </ul>
</template>

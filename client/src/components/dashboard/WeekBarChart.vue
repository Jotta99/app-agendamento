<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  itens: { label: string; valor: number; destaque?: boolean }[];
  formatar?: (v: number) => string;
}>();

const maximo = computed(() => Math.max(1, ...props.itens.map((i) => i.valor)));

function altura(valor: number): number {
  if (valor <= 0) return 3;
  return Math.max((valor / maximo.value) * 100, 6);
}
</script>

<template>
  <div class="flex h-36 items-stretch gap-2">
    <div
      v-for="(item, i) in itens"
      :key="i"
      class="flex flex-1 flex-col items-center justify-end gap-1.5"
    >
      <div
        class="w-full rounded-t-lg transition-all duration-500"
        :class="item.destaque ? 'bg-primary shadow-glow' : 'bg-primary-light/50'"
        :style="{ height: altura(item.valor) + '%' }"
        :title="formatar ? formatar(item.valor) : String(item.valor)"
      ></div>
      <span
        class="text-[11px] font-semibold uppercase tracking-wide"
        :class="item.destaque ? 'text-primary-deep' : 'text-muted'"
      >
        {{ item.label }}
      </span>
    </div>
  </div>
</template>

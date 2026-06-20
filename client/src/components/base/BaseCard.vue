<script setup lang="ts">
withDefaults(defineProps<{ padding?: boolean; hover?: boolean }>(), {
  padding: true,
  hover: false,
});
</script>

<template>
  <div
    class="relative rounded-2xl border border-line bg-card shadow-card"
    :class="[
      padding ? 'p-5' : '',
      hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft' : '',
    ]"
  >
    <slot />
  </div>
</template>

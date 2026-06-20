<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    rows?: number;
  }>(),
  { rows: 3 },
);

defineEmits<{ (e: 'update:modelValue', value: string): void }>();
</script>

<template>
  <label class="block">
    <span
      v-if="label"
      class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
    >
      {{ label }}
    </span>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="w-full resize-none rounded-xl border border-line bg-white/70 px-4 py-2.5 text-ink placeholder:text-muted/50 transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
      @input="
        $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
    />
  </label>
</template>

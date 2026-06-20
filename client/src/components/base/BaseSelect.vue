<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options: { value: string | number; label: string }[];
  }>(),
  { required: false },
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
      <span v-if="required" class="text-primary">*</span>
    </span>
    <div class="relative">
      <select
        :value="modelValue ?? ''"
        :required="required"
        class="w-full appearance-none rounded-xl border border-line bg-white/70 px-4 py-2.5 pr-10 text-ink transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
        @change="
          $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
        "
      >
        <option value="" disabled>{{ placeholder ?? 'Selecione...' }}</option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </label>
</template>

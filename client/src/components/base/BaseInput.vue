<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    icon?: boolean;
  }>(),
  { type: 'text', required: false },
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
      <slot name="icon" />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        class="w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 text-ink placeholder:text-muted/50 transition-all duration-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15"
        :class="[error ? 'border-danger focus:border-danger focus:ring-danger/15' : '', icon ? 'pl-10' : '']"
        @input="
          $emit(
            'update:modelValue',
            ($event.target as HTMLInputElement).value,
          )
        "
      />
    </div>
    <span v-if="error" class="mt-1 block text-xs text-danger">{{ error }}</span>
  </label>
</template>

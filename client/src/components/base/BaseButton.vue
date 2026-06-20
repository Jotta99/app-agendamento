<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit';
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    block: false,
    loading: false,
    disabled: false,
  },
);

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants: Record<string, string> = {
    primary:
      'text-white bg-primary hover:bg-primary-dark shadow-glow',
    secondary:
      'bg-card text-ink border border-line hover:bg-subtle hover:border-muted/40 shadow-card',
    ghost: 'bg-transparent text-ink/80 hover:bg-ink/[0.06] hover:text-ink',
    danger: 'text-white bg-danger hover:brightness-[1.06] shadow-card',
    success: 'text-white bg-success hover:brightness-[1.06] shadow-card',
  };

  const sizes: Record<string, string> = {
    sm: 'text-sm px-3.5 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.block ? 'w-full' : '',
  ].join(' ');
});
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>

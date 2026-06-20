<script setup lang="ts">
defineProps<{ modelValue: boolean; title?: string; wide?: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

function fechar() {
  emit('update:modelValue', false);
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      @click.self="fechar"
    >
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
        leave-active-class="transition duration-150"
        leave-to-class="translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
        appear
      >
        <div
          v-if="modelValue"
          class="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-white/70 bg-white shadow-soft sm:rounded-3xl no-scrollbar"
          :class="wide ? 'sm:max-w-2xl' : 'sm:max-w-md'"
        >
          <div class="hairline-accent h-[3px] w-full"></div>
          <header
            class="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-4 backdrop-blur"
          >
            <h2 class="font-display text-xl font-semibold text-ink">{{ title }}</h2>
            <button
              class="rounded-full p-2 text-muted transition hover:bg-primary-soft hover:text-primary-deep"
              @click="fechar"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div class="p-6">
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

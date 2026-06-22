<script setup lang="ts">
import { useSlots } from 'vue';

defineProps<{ modelValue: boolean; title?: string; wide?: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const slots = useSlots();

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
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      @click.self="fechar"
    >
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="scale-95 opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="scale-95 opacity-0"
        appear
      >
        <!-- Card centralizado em coluna: cabeçalho fixo, corpo rolável, rodapé
             fixo. max-h em dvh respeita a altura REAL no mobile. -->
        <div
          v-if="modelValue"
          class="relative flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-soft"
          :class="wide ? 'sm:max-w-2xl' : 'sm:max-w-md'"
        >
          <div class="hairline-accent h-[3px] w-full shrink-0"></div>

          <header
            class="flex shrink-0 items-center justify-between border-b border-line px-6 py-4"
          >
            <h2 class="font-display text-xl font-semibold text-ink">{{ title }}</h2>
            <button
              class="rounded-full p-2 text-muted transition hover:bg-primary-soft hover:text-primary-deep"
              @click="fechar"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>

          <!-- Corpo rolável -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-6 no-scrollbar">
            <slot />
          </div>

          <!-- Rodapé fixo (botões de ação) — sempre visível -->
          <footer
            v-if="slots.footer"
            class="shrink-0 border-t border-line bg-card px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <slot name="footer" />
          </footer>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

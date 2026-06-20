<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm';
import BaseButton from './base/BaseButton.vue';

const { estado, responder } = useConfirm();
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div
      v-if="estado.aberto"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      @click.self="responder(false)"
    >
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="translate-y-3 scale-95 opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="scale-95 opacity-0"
        appear
      >
        <div
          v-if="estado.aberto"
          class="w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-card shadow-soft"
        >
          <div class="hairline-accent h-[3px] w-full"></div>
          <div class="flex flex-col items-center p-6 text-center">
            <div
              class="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              :class="
                estado.perigo
                  ? 'bg-danger/10 text-danger'
                  : 'bg-primary-soft text-primary-deep'
              "
            >
              <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  v-if="estado.perigo"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.7"
                  d="M12 9v4m0 4h.01M10.3 3.86l-8.4 14.55A1.5 1.5 0 003.2 20.7h17.6a1.5 1.5 0 001.3-2.29L13.7 3.86a1.5 1.5 0 00-2.6 0z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.7"
                  d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold text-ink">
              {{ estado.titulo }}
            </h3>
            <p class="mt-1.5 text-sm leading-relaxed text-muted">
              {{ estado.mensagem }}
            </p>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <BaseButton variant="ghost" block @click="responder(false)">
              {{ estado.cancelarLabel }}
            </BaseButton>
            <BaseButton
              :variant="estado.perigo ? 'danger' : 'primary'"
              block
              @click="responder(true)"
            >
              {{ estado.confirmarLabel }}
            </BaseButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

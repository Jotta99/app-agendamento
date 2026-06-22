<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import BaseButton from '@/components/base/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput.vue';

const auth = useAuthStore();
const router = useRouter();
const { erro } = useToast();

const senha = ref('');

async function entrar() {
  if (!senha.value) {
    erro('Digite sua senha.');
    return;
  }
  try {
    await auth.login(senha.value);
    router.push('/dashboard');
  } catch (e: any) {
    erro(e.response?.data?.message ?? 'Não foi possível entrar.');
  }
}
</script>

<template>
  <div class="relative flex min-h-screen items-center justify-center px-5">
    <div class="relative z-[1] w-full max-w-sm animate-fade-up">
      <!-- Cabeçalho da marca -->
      <div class="mb-8 text-center">
        <img
          src="/assets/icone.png"
          alt="Agenda"
          class="mx-auto mb-5 h-16 w-16 object-contain"
        />
        <p class="text-[11px] uppercase tracking-[0.3em] text-primary-deep">
          Agenda
        </p>
        <h1 class="mt-2 font-display text-3xl font-semibold text-ink">
          Bem-vinda de volta
        </h1>
        <p class="mt-1.5 text-sm text-muted">Sua agenda, do seu jeito.</p>
      </div>

      <!-- Cartão -->
      <div class="relative overflow-hidden rounded-3xl border border-line bg-card p-7 shadow-soft">
        <div class="hairline-accent absolute inset-x-0 top-0 h-[3px]"></div>
        <form class="space-y-5" @submit.prevent="entrar">
          <BaseInput
            v-model="senha"
            label="Senha"
            type="password"
            placeholder="••••••••"
            required
          />
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="auth.carregando"
          >
            Entrar
          </BaseButton>
        </form>
      </div>

      <p class="mt-6 text-center text-xs text-muted">
        Acesso exclusivo da profissional
      </p>
    </div>
  </div>
</template>

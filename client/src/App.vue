<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppToaster from '@/components/AppToaster.vue';
import AppConfirm from '@/components/AppConfirm.vue';

const auth = useAuthStore();

onMounted(() => {
  // Recupera o perfil se já houver sessão salva.
  auth.carregarPerfil();
});
</script>

<template>
  <RouterView />
  <AppToaster />
  <AppConfirm />
</template>

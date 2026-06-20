import { ref } from 'vue';

export interface Toast {
  id: number;
  mensagem: string;
  tipo: 'sucesso' | 'erro';
}

const toasts = ref<Toast[]>([]);
let seq = 0;

export function useToast() {
  function mostrar(mensagem: string, tipo: Toast['tipo'] = 'sucesso') {
    const id = ++seq;
    toasts.value.push({ id, mensagem, tipo });
    setTimeout(() => remover(id), 3500);
  }

  function sucesso(msg: string) {
    mostrar(msg, 'sucesso');
  }

  function erro(msg: string) {
    mostrar(msg, 'erro');
  }

  function remover(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, sucesso, erro, remover };
}

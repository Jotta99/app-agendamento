import { ref } from 'vue';

export interface ConfirmOptions {
  titulo?: string;
  mensagem: string;
  confirmarLabel?: string;
  cancelarLabel?: string;
  perigo?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  aberto: boolean;
}

const estado = ref<ConfirmState>({ aberto: false, mensagem: '' });
let resolver: ((v: boolean) => void) | null = null;

export function useConfirm() {
  // Abre o diálogo e resolve com true (confirmar) ou false (cancelar).
  function confirmar(opts: ConfirmOptions): Promise<boolean> {
    estado.value = {
      titulo: 'Tem certeza?',
      confirmarLabel: 'Confirmar',
      cancelarLabel: 'Cancelar',
      perigo: false,
      aberto: true,
      ...opts,
    };
    return new Promise((resolve) => {
      resolver = resolve;
    });
  }

  function responder(valor: boolean) {
    estado.value.aberto = false;
    resolver?.(valor);
    resolver = null;
  }

  return { estado, confirmar, responder };
}

import api from './api';
import type { Servico } from '@/types';

export type ServicoPayload = Omit<
  Servico,
  'id' | 'created_at' | 'updated_at'
>;

export const servicoService = {
  listar() {
    return api.get<Servico[]>('/servico').then((r) => r.data);
  },
  obter(id: number) {
    return api.get<Servico>(`/servico/${id}`).then((r) => r.data);
  },
  criar(payload: ServicoPayload) {
    return api.post<Servico>('/servico', payload).then((r) => r.data);
  },
  atualizar(id: number, payload: Partial<ServicoPayload>) {
    return api.patch<Servico>(`/servico/${id}`, payload).then((r) => r.data);
  },
  remover(id: number) {
    return api.delete(`/servico/${id}`).then((r) => r.data);
  },
};

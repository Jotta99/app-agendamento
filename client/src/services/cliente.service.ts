import api from './api';
import type { Cliente } from '@/types';

export type ClientePayload = Omit<
  Cliente,
  'id' | 'created_at' | 'updated_at'
>;

export const clienteService = {
  listar(busca?: string) {
    return api
      .get<Cliente[]>('/cliente', { params: busca ? { busca } : {} })
      .then((r) => r.data);
  },
  obter(id: number) {
    return api.get<Cliente>(`/cliente/${id}`).then((r) => r.data);
  },
  criar(payload: ClientePayload) {
    return api.post<Cliente>('/cliente', payload).then((r) => r.data);
  },
  atualizar(id: number, payload: Partial<ClientePayload>) {
    return api.patch<Cliente>(`/cliente/${id}`, payload).then((r) => r.data);
  },
  remover(id: number) {
    return api.delete(`/cliente/${id}`).then((r) => r.data);
  },
};

import api from './api';
import type { Agendamento, ResumoDia, StatusAgendamento } from '@/types';

export interface CriarAgendamentoPayload {
  cliente_id: number;
  servico_id: number;
  data: string;
  hora_inicio: string;
  hora_fim?: string;
  observacao?: string;
}

export interface AtualizarAgendamentoPayload {
  cliente_id?: number;
  servico_id?: number;
  data?: string;
  hora_inicio?: string;
  observacao?: string;
  status?: StatusAgendamento;
  pago?: boolean;
}

export const agendamentoService = {
  listarPorData(data: string) {
    return api
      .get<Agendamento[]>('/agendamento', { params: { data } })
      .then((r) => r.data);
  },
  listarPorIntervalo(inicio: string, fim: string) {
    return api
      .get<Agendamento[]>('/agendamento', { params: { inicio, fim } })
      .then((r) => r.data);
  },
  resumoDoDia(data: string) {
    return api
      .get<ResumoDia>('/agendamento/resumo', { params: { data } })
      .then((r) => r.data);
  },
  obter(id: number) {
    return api.get<Agendamento>(`/agendamento/${id}`).then((r) => r.data);
  },
  criar(payload: CriarAgendamentoPayload) {
    return api.post<Agendamento>('/agendamento', payload).then((r) => r.data);
  },
  atualizar(id: number, payload: AtualizarAgendamentoPayload) {
    return api
      .patch<Agendamento>(`/agendamento/${id}`, payload)
      .then((r) => r.data);
  },
  concluir(id: number, payload: { avaliacao: number; observacao?: string }) {
    return api
      .post<Agendamento>(`/agendamento/${id}/concluir`, payload)
      .then((r) => r.data);
  },
  remover(id: number) {
    return api.delete(`/agendamento/${id}`).then((r) => r.data);
  },
};

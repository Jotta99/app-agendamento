export interface Cliente {
  id: number;
  nome: string;
  telefone: string | null;
  instagram: string | null;
  observacao: string | null;
  avaliacao_media?: number | null;
  avaliacao_total?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AvaliacaoAtendimento {
  id: number;
  agendamento_id: number;
  avaliacao: number;
  observacao: string | null;
}

export interface Servico {
  id: number;
  nome: string;
  descricao: string | null;
  duracao_minuto: number;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

export type StatusAgendamento =
  | 'AGENDADO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'FALTOU';

export interface Agendamento {
  id: number;
  cliente_id: number;
  servico_id: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor: number;
  observacao: string | null;
  status: StatusAgendamento;
  pago: boolean;
  cliente?: Cliente;
  servico?: Servico;
  avaliacao_atendimento?: AvaliacaoAtendimento | null;
}

export interface ResumoDia {
  data: string;
  total_agendamentos: number;
  receita_prevista: number;
  proximo_atendimento: Agendamento | null;
  agendamentos: Agendamento[];
}

export interface VisaoGeral {
  inicio: string;
  fim: string;
  por_dia: Record<string, { total: number; receita: number }>;
  por_status: Record<StatusAgendamento, number>;
  por_servico: {
    servico_id: number;
    nome: string;
    total: number;
    receita: number;
  }[];
  pagamento: { pago: number; a_receber: number };
  totais: { atendimentos: number; receita: number; ticket_medio: number };
}

export interface Usuario {
  nome: string;
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Cliente } from './cliente.model';
import { Servico } from './servico.model';
import { AvaliacaoAtendimento } from './avaliacao-atendimento.model';

export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO',
  FALTOU = 'FALTOU',
}

@Table({ tableName: 'agendamento', paranoid: true, underscored: true })
export class Agendamento extends Model {
  @ForeignKey(() => Cliente)
  @Column({ type: DataType.INTEGER, allowNull: false })
  cliente_id: number;

  @ForeignKey(() => Servico)
  @Column({ type: DataType.INTEGER, allowNull: false })
  servico_id: number;

  // Apenas a data (sem hora) — a hora fica em hora_inicio/hora_fim.
  @Column({ type: DataType.DATEONLY, allowNull: false })
  data: string;

  @Column({ type: DataType.TIME, allowNull: false })
  hora_inicio: string;

  @Column({ type: DataType.TIME, allowNull: false })
  hora_fim: string;

  // Valor copiado do serviço no momento da criação (snapshot histórico).
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  valor: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  observacao: string | null;

  @Column({
    type: DataType.ENUM(...Object.values(StatusAgendamento)),
    allowNull: false,
    defaultValue: StatusAgendamento.AGENDADO,
  })
  status: StatusAgendamento;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  pago: boolean;

  @BelongsTo(() => Cliente)
  cliente: Cliente;

  @BelongsTo(() => Servico)
  servico: Servico;

  @HasOne(() => AvaliacaoAtendimento)
  avaliacao_atendimento: AvaliacaoAtendimento;
}

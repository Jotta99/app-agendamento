import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Agendamento } from './agendamento.model';

@Table({ tableName: 'servico', paranoid: true, underscored: true })
export class Servico extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  nome: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  descricao: string | null;

  // Duração estimada em minutos.
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 60 })
  duracao_minuto: number;

  // Valor em reais (DECIMAL evita imprecisão de ponto flutuante).
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  valor: number;

  @HasMany(() => Agendamento)
  agendamentos: Agendamento[];
}

import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Agendamento } from './agendamento.model';

@Table({
  tableName: 'avaliacao_atendimento',
  paranoid: true,
  underscored: true,
})
export class AvaliacaoAtendimento extends Model {
  @ForeignKey(() => Agendamento)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  agendamento_id: number;

  // Nota de 1 a 5 (Postgres não tem TINYINT — usamos SMALLINT).
  @Column({ type: DataType.SMALLINT, allowNull: false })
  avaliacao: number;

  @Column({ type: DataType.STRING(250), allowNull: true })
  observacao: string | null;

  @BelongsTo(() => Agendamento)
  agendamento: Agendamento;
}

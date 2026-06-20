import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Agendamento } from './agendamento.model';

@Table({ tableName: 'cliente', paranoid: true, underscored: true })
export class Cliente extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  nome: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telefone: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  instagram: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  observacao: string | null;

  @HasMany(() => Agendamento)
  agendamentos: Agendamento[];
}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Agendamento } from '../../database/models/agendamento.model';
import { Cliente } from '../../database/models/cliente.model';
import { Servico } from '../../database/models/servico.model';
import { AgendamentoService } from './agendamento.service';
import { AgendamentoController } from './agendamento.controller';

@Module({
  imports: [SequelizeModule.forFeature([Agendamento, Cliente, Servico])],
  controllers: [AgendamentoController],
  providers: [AgendamentoService],
})
export class AgendamentoModule {}

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Servico } from '../../database/models/servico.model';
import { ServicoService } from './servico.service';
import { ServicoController } from './servico.controller';

@Module({
  imports: [SequelizeModule.forFeature([Servico])],
  controllers: [ServicoController],
  providers: [ServicoService],
})
export class ServicoModule {}

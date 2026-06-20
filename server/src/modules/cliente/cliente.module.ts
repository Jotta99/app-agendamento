import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cliente } from '../../database/models/cliente.model';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';

@Module({
  imports: [SequelizeModule.forFeature([Cliente])],
  controllers: [ClienteController],
  providers: [ClienteService],
})
export class ClienteModule {}

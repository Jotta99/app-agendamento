import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { StatusAgendamento } from '../../../database/models/agendamento.model';
import { CreateAgendamentoDto } from './create-agendamento.dto';

export class UpdateAgendamentoDto extends PartialType(CreateAgendamentoDto) {
  @IsOptional()
  @IsEnum(StatusAgendamento, { message: 'Status inválido.' })
  status?: StatusAgendamento;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;
}

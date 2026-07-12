import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { StatusAgendamento } from '../../../database/models/agendamento.model';
import { CreateAgendamentoDto } from './create-agendamento.dto';

export class UpdateAgendamentoDto extends PartialType(CreateAgendamentoDto) {
  @IsOptional()
  @IsEnum(StatusAgendamento, { message: 'Status inválido.' })
  status?: StatusAgendamento;

  @IsOptional()
  @IsBoolean()
  pago?: boolean;

  // Permite sobrescrever manualmente o valor copiado do serviço
  // (ex.: desconto, cortesia, ajuste pontual para este atendimento).
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor inválido.' })
  @Min(0, { message: 'O valor não pode ser negativo.' })
  valor?: number;
}

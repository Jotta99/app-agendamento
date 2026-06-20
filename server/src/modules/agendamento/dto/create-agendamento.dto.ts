import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAgendamentoDto {
  @IsInt()
  cliente_id: number;

  @IsInt()
  servico_id: number;

  // Data no formato AAAA-MM-DD.
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data inválida (use AAAA-MM-DD).' })
  data: string;

  // Hora de início no formato HH:mm.
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Hora inválida (use HH:mm).',
  })
  hora_inicio: string;

  // Hora final (HH:mm). Opcional: se ausente, é calculada pela duração do serviço.
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Hora final inválida (use HH:mm).',
  })
  hora_fim?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;
}

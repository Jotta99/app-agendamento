import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServicoDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @MaxLength(150)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;

  @IsInt({ message: 'A duração deve ser um número de minutos.' })
  @Min(1, { message: 'A duração deve ser de pelo menos 1 minuto.' })
  duracao_minuto: number;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Valor inválido.' })
  @Min(0, { message: 'O valor não pode ser negativo.' })
  valor: number;
}

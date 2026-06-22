import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ConcluirAgendamentoDto {
  @IsInt({ message: 'A avaliação deve ser um número.' })
  @Min(1, { message: 'A avaliação mínima é 1.' })
  @Max(5, { message: 'A avaliação máxima é 5.' })
  avaliacao: number;

  @IsOptional()
  @IsString()
  @MaxLength(250, { message: 'A observação deve ter no máximo 250 caracteres.' })
  observacao?: string;
}

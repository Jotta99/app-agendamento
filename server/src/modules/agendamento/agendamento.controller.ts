import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgendamentoService } from './agendamento.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ConcluirAgendamentoDto } from './dto/concluir-agendamento.dto';

// Devolve a data de hoje no formato AAAA-MM-DD (fuso local).
function hoje(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

@UseGuards(JwtAuthGuard)
@Controller('agendamento')
export class AgendamentoController {
  constructor(private readonly agendamentoService: AgendamentoService) {}

  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.agendamentoService.create(dto);
  }

  // Agenda. ?data=AAAA-MM-DD (dia, padrão hoje) ou ?inicio=&fim= (intervalo).
  @Get()
  listar(
    @Query('data') data?: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    if (inicio && fim) {
      return this.agendamentoService.findByRange(inicio, fim);
    }
    return this.agendamentoService.findByDate(data || hoje());
  }

  // Resumo para a Dashboard. ?data=AAAA-MM-DD — padrão: hoje.
  @Get('resumo')
  resumo(@Query('data') data?: string) {
    return this.agendamentoService.resumoDoDia(data || hoje());
  }

  // Agendamentos com horário já passado e ainda não finalizados.
  @Get('pendentes')
  pendentes() {
    return this.agendamentoService.pendentesFinalizacao();
  }

  // Visualizações agregadas da Dashboard (semana/mês). ?inicio=&fim= obrigatórios.
  @Get('visao-geral')
  visaoGeral(@Query('inicio') inicio?: string, @Query('fim') fim?: string) {
    if (!inicio || !fim) {
      throw new BadRequestException('Informe "inicio" e "fim" (AAAA-MM-DD).');
    }
    return this.agendamentoService.visaoGeral(inicio, fim);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentoService.findOne(id);
  }

  // Conclui o atendimento registrando a avaliação (estrelas + observação).
  @Post(':id/concluir')
  concluir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ConcluirAgendamentoDto,
  ) {
    return this.agendamentoService.concluir(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamentoDto,
  ) {
    return this.agendamentoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentoService.remove(id);
  }
}

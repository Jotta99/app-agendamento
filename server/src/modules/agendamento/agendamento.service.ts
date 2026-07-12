import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  Agendamento,
  StatusAgendamento,
} from '../../database/models/agendamento.model';
import { Cliente } from '../../database/models/cliente.model';
import { Servico } from '../../database/models/servico.model';
import { AvaliacaoAtendimento } from '../../database/models/avaliacao-atendimento.model';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';
import { ConcluirAgendamentoDto } from './dto/concluir-agendamento.dto';

// Status que efetivamente ocupam um horário na agenda.
const STATUS_OCUPA_HORARIO = [
  StatusAgendamento.AGENDADO,
  StatusAgendamento.CONCLUIDO,
];

// Cliente/Serviço podem ter sido excluídos (soft delete) sem afetar o
// histórico: paranoid:false garante que os dados continuem aparecendo nos
// agendamentos antigos mesmo depois da exclusão (só somem das listas/pickers
// de cliente e serviço ativos, que consultam os models diretamente).
const INCLUDE_RELACOES = [
  { model: Cliente, paranoid: false },
  { model: Servico, paranoid: false },
];

@Injectable()
export class AgendamentoService {
  constructor(
    @InjectModel(Agendamento)
    private readonly agendamentoModel: typeof Agendamento,
    @InjectModel(Servico) private readonly servicoModel: typeof Servico,
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
    @InjectModel(AvaliacaoAtendimento)
    private readonly avaliacaoModel: typeof AvaliacaoAtendimento,
  ) {}

  // Soma minutos a uma hora "HH:mm" e devolve "HH:mm".
  private somaMinutos(hora: string, minutos: number): string {
    const [h, m] = hora.split(':').map(Number);
    const total = h * 60 + m + minutos;
    if (total >= 24 * 60) {
      throw new BadRequestException(
        'O atendimento ultrapassa o fim do dia. Escolha outro horário.',
      );
    }
    const hh = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const mm = (total % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  // Verifica se há sobreposição com outro atendimento na mesma data.
  private async garantirSemConflito(
    data: string,
    horaInicio: string,
    horaFim: string,
    ignorarId?: number,
  ) {
    const where: any = {
      data,
      status: { [Op.in]: STATUS_OCUPA_HORARIO },
      hora_inicio: { [Op.lt]: horaFim },
      hora_fim: { [Op.gt]: horaInicio },
    };
    if (ignorarId) {
      where.id = { [Op.ne]: ignorarId };
    }

    const conflito = await this.agendamentoModel.findOne({ where });
    if (conflito) {
      throw new ConflictException(
        'Já existe um atendimento nesse horário.',
      );
    }
  }

  async create(dto: CreateAgendamentoDto) {
    const cliente = await this.clienteModel.findByPk(dto.cliente_id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    const servico = await this.servicoModel.findByPk(dto.servico_id);
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado.');
    }

    // Usa o intervalo escolhido (hora_fim) ou calcula pela duração do serviço.
    let horaFim: string;
    if (dto.hora_fim) {
      if (dto.hora_fim <= dto.hora_inicio) {
        throw new BadRequestException(
          'O horário final deve ser depois do inicial.',
        );
      }
      horaFim = dto.hora_fim;
    } else {
      horaFim = this.somaMinutos(dto.hora_inicio, servico.duracao_minuto);
    }
    await this.garantirSemConflito(dto.data, dto.hora_inicio, horaFim);

    // Agendamento no passado = retroativo (histórico): já entra como concluído.
    const inicioDt = new Date(`${dto.data}T${dto.hora_inicio}:00`);
    const retroativo = inicioDt.getTime() < Date.now();

    const agendamento = await this.agendamentoModel.create({
      cliente_id: dto.cliente_id,
      servico_id: dto.servico_id,
      data: dto.data,
      hora_inicio: dto.hora_inicio,
      hora_fim: horaFim,
      // Snapshot do valor: alterações futuras no serviço não afetam este.
      valor: servico.valor,
      observacao: dto.observacao ?? null,
      status: retroativo
        ? StatusAgendamento.CONCLUIDO
        : StatusAgendamento.AGENDADO,
      pago: false,
    });

    return this.findOne(agendamento.id);
  }

  // Lista os atendimentos de um dia específico, com cliente e serviço.
  findByDate(data: string) {
    return this.agendamentoModel.findAll({
      where: { data },
      include: INCLUDE_RELACOES,
      order: [['hora_inicio', 'ASC']],
    });
  }

  // Lista os atendimentos de um intervalo (para visões de semana/mês).
  findByRange(inicio: string, fim: string) {
    return this.agendamentoModel.findAll({
      where: { data: { [Op.between]: [inicio, fim] } },
      include: INCLUDE_RELACOES,
      order: [
        ['data', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });
  }

  // Agendamentos cujo horário já passou mas continuam como "AGENDADO" —
  // precisam ser finalizados manualmente (concluir, marcar falta ou cancelar).
  async pendentesFinalizacao() {
    const agora = Date.now();
    const candidatos = await this.agendamentoModel.findAll({
      where: { status: StatusAgendamento.AGENDADO },
      include: INCLUDE_RELACOES,
      order: [
        ['data', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });
    return candidatos.filter(
      (a) => new Date(`${a.data}T${a.hora_fim}`).getTime() < agora,
    );
  }

  async findOne(id: number) {
    const agendamento = await this.agendamentoModel.findByPk(id, {
      include: [...INCLUDE_RELACOES, AvaliacaoAtendimento],
    });
    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado.');
    }
    return agendamento;
  }

  // Conclui o atendimento e registra (ou atualiza) a avaliação.
  async concluir(id: number, dto: ConcluirAgendamentoDto) {
    const agendamento = await this.findOne(id);

    const existente = await this.avaliacaoModel.findOne({
      where: { agendamento_id: id },
    });
    if (existente) {
      await existente.update({
        avaliacao: dto.avaliacao,
        observacao: dto.observacao ?? null,
      });
    } else {
      await this.avaliacaoModel.create({
        agendamento_id: id,
        avaliacao: dto.avaliacao,
        observacao: dto.observacao ?? null,
      });
    }

    await agendamento.update({ status: StatusAgendamento.CONCLUIDO });
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateAgendamentoDto) {
    const agendamento = await this.findOne(id);

    const horaInicio = dto.hora_inicio ?? agendamento.hora_inicio;
    const data = dto.data ?? agendamento.data;
    let valor = agendamento.valor;
    // Respeita a hora final explícita (igual ao create()); só recalcula pela
    // duração do serviço se ela não vier no payload.
    let horaFim = dto.hora_fim ?? agendamento.hora_fim;

    const trocouServico =
      !!dto.servico_id && dto.servico_id !== agendamento.servico_id;

    if (trocouServico || (!dto.hora_fim && dto.hora_inicio)) {
      const servicoId = dto.servico_id ?? agendamento.servico_id;
      const servico = await this.servicoModel.findByPk(servicoId);
      if (!servico) {
        throw new NotFoundException('Serviço não encontrado.');
      }
      // Serviço trocado sugere o novo valor (a menos que dto.valor o sobrescreva abaixo).
      if (trocouServico) {
        valor = servico.valor;
      }
      // Início mudou sem hora final explícita: recalcula pela duração do serviço.
      if (!dto.hora_fim && dto.hora_inicio) {
        horaFim = this.somaMinutos(horaInicio, servico.duracao_minuto);
      }
    }

    if (dto.data || dto.hora_inicio || dto.hora_fim || dto.servico_id) {
      await this.garantirSemConflito(data, horaInicio, horaFim, id);
    }

    // Valor informado manualmente tem prioridade máxima sobre o cálculo
    // automático (permite ajustar o preço deste atendimento sem alterar o
    // serviço, ex.: desconto ou cortesia).
    if (dto.valor !== undefined) {
      valor = dto.valor;
    }

    await agendamento.update({
      ...dto,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      valor,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const agendamento = await this.findOne(id);
    await agendamento.destroy(); // soft delete (paranoid)
    return { mensagem: 'Agendamento removido com sucesso.' };
  }

  // Resumo do dia para a Dashboard ("Como está meu dia?").
  async resumoDoDia(data: string) {
    const agendamentos = await this.findByDate(data);

    const ativos = agendamentos.filter((a) =>
      STATUS_OCUPA_HORARIO.includes(a.status),
    );

    const receitaPrevista = ativos.reduce(
      (soma, a) => soma + Number(a.valor),
      0,
    );

    // Próximo atendimento: o primeiro AGENDADO que ainda não começou
    // (ignora horários que já passaram).
    const agora = Date.now();
    const proximo =
      agendamentos.find(
        (a) =>
          a.status === StatusAgendamento.AGENDADO &&
          new Date(`${a.data}T${a.hora_inicio}`).getTime() >= agora,
      ) ?? null;

    return {
      data,
      total_agendamentos: ativos.length,
      receita_prevista: receitaPrevista,
      proximo_atendimento: proximo,
      agendamentos,
    };
  }

  // Agregações para as visualizações da Dashboard (semana/mês).
  async visaoGeral(inicio: string, fim: string) {
    const agendamentos = await this.findByRange(inicio, fim);

    // Ativos = geraram/vão gerar receita (exclui cancelado e faltou).
    const ativos = agendamentos.filter((a) =>
      STATUS_OCUPA_HORARIO.includes(a.status),
    );

    // Por dia: total de atendimentos e receita (só dias com movimento).
    const porDia: Record<string, { total: number; receita: number }> = {};
    for (const a of ativos) {
      const dia = (porDia[a.data] ??= { total: 0, receita: 0 });
      dia.total += 1;
      dia.receita += Number(a.valor);
    }

    // Por status: contagem no período inteiro (todos os status).
    const porStatus: Record<string, number> = {
      AGENDADO: 0,
      CONCLUIDO: 0,
      CANCELADO: 0,
      FALTOU: 0,
    };
    for (const a of agendamentos) {
      porStatus[a.status] += 1;
    }

    // Por serviço: ranking por receita (top 5), só atendimentos ativos.
    const porServicoMap = new Map<
      number,
      { servico_id: number; nome: string; total: number; receita: number }
    >();
    for (const a of ativos) {
      const nome = a.servico?.nome ?? 'Serviço removido';
      const item = porServicoMap.get(a.servico_id) ?? {
        servico_id: a.servico_id,
        nome,
        total: 0,
        receita: 0,
      };
      item.total += 1;
      item.receita += Number(a.valor);
      porServicoMap.set(a.servico_id, item);
    }
    const porServico = [...porServicoMap.values()]
      .sort((x, y) => y.receita - x.receita)
      .slice(0, 5);

    // Pagamento: quanto já foi recebido vs. quanto falta receber.
    const pagamento = ativos.reduce(
      (acc, a) => {
        if (a.pago) acc.pago += Number(a.valor);
        else acc.a_receber += Number(a.valor);
        return acc;
      },
      { pago: 0, a_receber: 0 },
    );

    const receitaTotal = ativos.reduce((s, a) => s + Number(a.valor), 0);

    return {
      inicio,
      fim,
      por_dia: porDia,
      por_status: porStatus,
      por_servico: porServico,
      pagamento,
      totais: {
        atendimentos: ativos.length,
        receita: receitaTotal,
        ticket_medio: ativos.length ? receitaTotal / ativos.length : 0,
      },
    };
  }
}

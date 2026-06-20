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
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

// Status que efetivamente ocupam um horário na agenda.
const STATUS_OCUPA_HORARIO = [
  StatusAgendamento.AGENDADO,
  StatusAgendamento.CONCLUIDO,
];

@Injectable()
export class AgendamentoService {
  constructor(
    @InjectModel(Agendamento)
    private readonly agendamentoModel: typeof Agendamento,
    @InjectModel(Servico) private readonly servicoModel: typeof Servico,
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
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
      include: [Cliente, Servico],
      order: [['hora_inicio', 'ASC']],
    });
  }

  // Lista os atendimentos de um intervalo (para visões de semana/mês).
  findByRange(inicio: string, fim: string) {
    return this.agendamentoModel.findAll({
      where: { data: { [Op.between]: [inicio, fim] } },
      include: [Cliente, Servico],
      order: [
        ['data', 'ASC'],
        ['hora_inicio', 'ASC'],
      ],
    });
  }

  async findOne(id: number) {
    const agendamento = await this.agendamentoModel.findByPk(id, {
      include: [Cliente, Servico],
    });
    if (!agendamento) {
      throw new NotFoundException('Agendamento não encontrado.');
    }
    return agendamento;
  }

  async update(id: number, dto: UpdateAgendamentoDto) {
    const agendamento = await this.findOne(id);

    // Recalcula hora_fim/valor se serviço ou horário mudarem.
    let horaInicio = dto.hora_inicio ?? agendamento.hora_inicio;
    let horaFim = agendamento.hora_fim;
    let valor = agendamento.valor;
    const data = dto.data ?? agendamento.data;

    if (dto.servico_id || dto.hora_inicio) {
      const servicoId = dto.servico_id ?? agendamento.servico_id;
      const servico = await this.servicoModel.findByPk(servicoId);
      if (!servico) {
        throw new NotFoundException('Serviço não encontrado.');
      }
      horaFim = this.somaMinutos(horaInicio, servico.duracao_minuto);
      // Mantém o valor original; só atualiza se o serviço foi trocado.
      if (dto.servico_id && dto.servico_id !== agendamento.servico_id) {
        valor = servico.valor;
      }
    }

    if (dto.data || dto.hora_inicio || dto.servico_id) {
      await this.garantirSemConflito(data, horaInicio, horaFim, id);
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
}

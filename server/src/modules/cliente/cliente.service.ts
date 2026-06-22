import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Cliente } from '../../database/models/cliente.model';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

interface MediaCliente {
  media: number;
  total: number;
}

@Injectable()
export class ClienteService {
  constructor(
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
  ) {}

  // Média das avaliações por cliente (via agendamentos concluídos avaliados).
  private async medias(ids: number[]): Promise<Map<number, MediaCliente>> {
    const mapa = new Map<number, MediaCliente>();
    if (!ids.length) return mapa;

    const filtro = ids.map((n) => Number(n)).join(',');
    const rows = (await this.clienteModel.sequelize!.query(
      `SELECT a.cliente_id AS cliente_id,
              ROUND(AVG(av.avaliacao)::numeric, 1) AS media,
              COUNT(*) AS total
         FROM avaliacao_atendimento av
         JOIN agendamento a
           ON a.id = av.agendamento_id AND a.deleted_at IS NULL
        WHERE av.deleted_at IS NULL
          AND a.cliente_id IN (${filtro})
        GROUP BY a.cliente_id`,
      { type: QueryTypes.SELECT },
    )) as { cliente_id: number; media: string; total: string }[];

    for (const r of rows) {
      mapa.set(Number(r.cliente_id), {
        media: Number(r.media),
        total: Number(r.total),
      });
    }
    return mapa;
  }

  // Anexa avaliacao_media (ou null) e avaliacao_total ao cliente.
  private comMedia(cliente: Cliente, m?: MediaCliente) {
    return {
      ...cliente.toJSON(),
      avaliacao_media: m?.media ?? null,
      avaliacao_total: m?.total ?? 0,
    };
  }

  private async obterInstancia(id: number) {
    const cliente = await this.clienteModel.findByPk(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return cliente;
  }

  create(dto: CreateClienteDto) {
    return this.clienteModel.create({ ...dto });
  }

  async findAll(busca?: string) {
    const where = busca
      ? {
          [Op.or]: [
            { nome: { [Op.iLike]: `%${busca}%` } },
            { telefone: { [Op.iLike]: `%${busca}%` } },
          ],
        }
      : undefined;

    const clientes = await this.clienteModel.findAll({
      where,
      order: [['nome', 'ASC']],
    });
    const mapa = await this.medias(clientes.map((c) => c.id));
    return clientes.map((c) => this.comMedia(c, mapa.get(c.id)));
  }

  async findOne(id: number) {
    const cliente = await this.obterInstancia(id);
    const mapa = await this.medias([id]);
    return this.comMedia(cliente, mapa.get(id));
  }

  async update(id: number, dto: UpdateClienteDto) {
    const cliente = await this.obterInstancia(id);
    await cliente.update({ ...dto });
    return this.findOne(id);
  }

  async remove(id: number) {
    const cliente = await this.obterInstancia(id);
    await cliente.destroy(); // soft delete (paranoid)
    return { mensagem: 'Cliente removido com sucesso.' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Cliente } from '../../database/models/cliente.model';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClienteService {
  constructor(
    @InjectModel(Cliente) private readonly clienteModel: typeof Cliente,
  ) {}

  create(dto: CreateClienteDto) {
    return this.clienteModel.create({ ...dto });
  }

  findAll(busca?: string) {
    const where = busca
      ? {
          [Op.or]: [
            { nome: { [Op.iLike]: `%${busca}%` } },
            { telefone: { [Op.iLike]: `%${busca}%` } },
          ],
        }
      : undefined;

    return this.clienteModel.findAll({ where, order: [['nome', 'ASC']] });
  }

  async findOne(id: number) {
    const cliente = await this.clienteModel.findByPk(id);
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto) {
    const cliente = await this.findOne(id);
    return cliente.update({ ...dto });
  }

  async remove(id: number) {
    const cliente = await this.findOne(id);
    await cliente.destroy(); // soft delete (paranoid)
    return { mensagem: 'Cliente removido com sucesso.' };
  }
}

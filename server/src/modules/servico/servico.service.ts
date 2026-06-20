import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Servico } from '../../database/models/servico.model';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicoService {
  constructor(
    @InjectModel(Servico) private readonly servicoModel: typeof Servico,
  ) {}

  create(dto: CreateServicoDto) {
    return this.servicoModel.create({ ...dto });
  }

  findAll() {
    return this.servicoModel.findAll({ order: [['nome', 'ASC']] });
  }

  async findOne(id: number) {
    const servico = await this.servicoModel.findByPk(id);
    if (!servico) {
      throw new NotFoundException('Serviço não encontrado.');
    }
    return servico;
  }

  async update(id: number, dto: UpdateServicoDto) {
    const servico = await this.findOne(id);
    return servico.update({ ...dto });
  }

  async remove(id: number) {
    const servico = await this.findOne(id);
    await servico.destroy(); // soft delete (paranoid)
    return { mensagem: 'Serviço removido com sucesso.' };
  }
}

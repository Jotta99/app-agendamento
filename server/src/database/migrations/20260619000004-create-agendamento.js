'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agendamento', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'cliente', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      servico_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'servico', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      data: { type: Sequelize.DATEONLY, allowNull: false },
      hora_inicio: { type: Sequelize.TIME, allowNull: false },
      hora_fim: { type: Sequelize.TIME, allowNull: false },
      valor: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      observacao: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('AGENDADO', 'CONCLUIDO', 'CANCELADO', 'FALTOU'),
        allowNull: false,
        defaultValue: 'AGENDADO',
      },
      pago: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    // Índice para acelerar a busca da agenda por dia.
    await queryInterface.addIndex('agendamento', ['data']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agendamento');
    // Remove o tipo ENUM criado pelo Postgres.
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_agendamento_status";',
    );
  },
};

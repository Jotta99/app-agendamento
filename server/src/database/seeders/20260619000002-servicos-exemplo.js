'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    await queryInterface.bulkInsert('servico', [
      {
        nome: 'Manicure simples',
        descricao: 'Cutilagem e esmaltação tradicional.',
        duracao_minuto: 60,
        valor: 50.0,
        created_at: agora,
        updated_at: agora,
      },
      {
        nome: 'Pé e mão',
        descricao: 'Manicure e pedicure completos.',
        duracao_minuto: 90,
        valor: 80.0,
        created_at: agora,
        updated_at: agora,
      },
      {
        nome: 'Alongamento em gel',
        descricao: 'Alongamento e modelagem em gel.',
        duracao_minuto: 150,
        valor: 180.0,
        created_at: agora,
        updated_at: agora,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('servico', {
      nome: ['Manicure simples', 'Pé e mão', 'Alongamento em gel'],
    });
  },
};

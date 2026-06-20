// Configuração do Sequelize CLI (migrations e seeders).
// Lê as credenciais do .env — nenhum segredo fica hard-coded aqui.
require('dotenv').config();

const base = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  timezone: process.env.DB_TIMEZONE || 'America/Porto_Velho',
  define: {
    underscored: true,
    paranoid: true,
    timestamps: true,
  },
};

module.exports = {
  development: base,
  test: { ...base, database: `${process.env.DB_DATABASE}_test` },
  production: {
    ...base,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
    },
  },
};

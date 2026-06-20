import * as Joi from 'joi';

// Valida as variáveis de ambiente na inicialização.
// Se algo estiver faltando ou inválido, a aplicação não sobe (fail-fast).
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  CORS_ORIGIN: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').required(),
  DB_DATABASE: Joi.string().required(),
  DB_TIMEZONE: Joi.string().default('America/Porto_Velho'),
  DB_SSL: Joi.boolean().default(false),
  // Sincroniza as tabelas automaticamente (cria/atualiza a partir dos models).
  DB_SYNC: Joi.boolean().default(true),

  // Segredo do JWT precisa ser razoavelmente longo.
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  AUTH_SENHA: Joi.string().min(6).required(),
});

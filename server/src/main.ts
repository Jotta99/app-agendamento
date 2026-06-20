import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import helmet from 'helmet';
import { AppModule } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('pg');

// Cria o banco de dados caso ele ainda não exista (conectando ao banco
// administrativo "postgres"). Roda antes de o ORM inicializar.
async function ensureDatabase(logger: Logger) {
  const database = process.env.DB_DATABASE;
  if (!database) return;

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    ssl:
      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [database],
    );
    if (rowCount && rowCount > 0) {
      logger.log(`Banco "${database}" encontrado.`);
      return;
    }
    try {
      // Nome vem do .env (confiável); aspas duplas preservam o nome exato.
      await client.query(`CREATE DATABASE "${database}"`);
      logger.log(`🆕 Banco "${database}" não existia e foi criado.`);
    } catch (e) {
      // Alguns servidores não permitem criar bancos (modo multi-database
      // desabilitado, permissões restritas). Apenas avisa e segue — o banco
      // provavelmente já foi criado manualmente.
      logger.warn(
        `Não foi possível criar o banco "${database}" automaticamente ` +
          `(${(e as Error).message}). Crie-o manualmente, se necessário.`,
      );
    }
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Garante a existência do banco antes de subir a aplicação.
  try {
    await ensureDatabase(logger);
  } catch (e) {
    logger.error(
      `❌ Não foi possível acessar o servidor PostgreSQL: ${(e as Error).message}`,
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Verifica e registra a conexão com o banco de dados.
  const sequelize = app.get(Sequelize);
  try {
    await sequelize.authenticate();
    logger.log(
      `✅ Banco conectado: PostgreSQL em ${config.get('DB_HOST')}:${config.get(
        'DB_PORT',
      )}/${config.get('DB_DATABASE')}`,
    );
  } catch (e) {
    logger.error(
      `❌ Falha ao conectar no banco de dados: ${(e as Error).message}`,
    );
    process.exit(1); // sem banco a API não tem como operar
  }

  // Cabeçalhos HTTP de segurança.
  app.use(helmet());

  // CORS: libera a origem configurada + localhost + IPs de rede local
  // (para acessar do celular/tablet pelo IP), bloqueando origens externas.
  const origemConfigurada = config.get<string>('CORS_ORIGIN');
  const redeLocal =
    /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

  app.enableCors({
    origin: (origin, callback) => {
      // Sem origin (mesma origem, curl, apps nativos) é permitido.
      if (!origin || origin === origemConfigurada || redeLocal.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origem não permitida pelo CORS.'), false);
    },
    credentials: true,
  });

  // Escuta em todas as interfaces para ser acessível pela rede local.
  const host = '0.0.0.0';

  // Prefixo global da API.
  app.setGlobalPrefix('api');

  // Validação e sanitização de todo input que entra na API.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não declaradas no DTO
      forbidNonWhitelisted: true, // rejeita propriedades extras
      transform: true, // converte tipos (string -> number etc.)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port, host);
  logger.log(`🚀 API rodando na porta ${port} (acessível pela rede em /api)`);
}

bootstrap();

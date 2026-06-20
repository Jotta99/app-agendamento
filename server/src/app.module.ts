import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { envValidationSchema } from './config/env.validation';
import { Cliente } from './database/models/cliente.model';
import { Servico } from './database/models/servico.model';
import { Agendamento } from './database/models/agendamento.model';

import { AuthModule } from './modules/auth/auth.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ServicoModule } from './modules/servico/servico.module';
import { AgendamentoModule } from './modules/agendamento/agendamento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    // Limite de requisições: protege contra brute-force e abuso.
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 100 },
    ]),

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        timezone: config.get<string>('DB_TIMEZONE'),
        models: [Cliente, Servico, Agendamento],
        autoLoadModels: true,
        // Sincroniza as tabelas automaticamente a partir dos models (DB_SYNC).
        // Em produção, prefira migrations e mantenha DB_SYNC=false.
        synchronize:
          config.get('DB_SYNC') === true || config.get('DB_SYNC') === 'true',
        define: { underscored: true, paranoid: true, timestamps: true },
        logging: config.get('NODE_ENV') === 'development' ? console.log : false,
        dialectOptions:
          config.get('DB_SSL') === true || config.get('DB_SSL') === 'true'
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
      }),
    }),

    AuthModule,
    ClienteModule,
    ServicoModule,
    AgendamentoModule,
  ],
  providers: [
    // Aplica o rate-limit globalmente.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

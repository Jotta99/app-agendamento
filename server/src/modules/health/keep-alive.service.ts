import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const INTERVALO_MS = 5 * 60 * 1000; // 5 minutos

// Faz auto-ping na própria rota /api/health a cada 5 min, usando a URL pública.
// Como o Render hiberna serviços sem tráfego de entrada, o ping (que sai e volta
// pela URL externa) reinicia o timer de inatividade e mantém o serviço acordado.
@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('KeepAlive');
  private timer?: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Use SELF_PING_URL (ou RENDER_EXTERNAL_URL, que o Render injeta sozinho).
    // Sem URL pública definida, o keep-alive fica desligado (ex.: local).
    const base =
      this.config.get<string>('SELF_PING_URL') ||
      process.env.RENDER_EXTERNAL_URL;

    if (!base) {
      this.logger.log(
        'Keep-alive desativado (defina SELF_PING_URL para ativar).',
      );
      return;
    }

    const url = `${base.replace(/\/+$/, '')}/api/health`;
    this.timer = setInterval(() => this.ping(url), INTERVALO_MS);
    this.logger.log(`Keep-alive ativo: auto-ping a cada 5 min em ${url}`);
  }

  private async ping(url: string) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        this.logger.warn(`Keep-alive: resposta ${res.status}`);
      }
    } catch (e) {
      this.logger.warn(`Keep-alive falhou: ${(e as Error).message}`);
    }
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

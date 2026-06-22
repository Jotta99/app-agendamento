import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

// Rota pública (sem JWT) e fora do rate-limit — usada por health checks e
// pelo auto-ping que mantém o serviço acordado.
@SkipThrottle()
@Controller('health')
export class HealthController {
  private readonly inicio = Date.now();

  @Get()
  check() {
    return {
      status: 'ok',
      uptime_s: Math.floor((Date.now() - this.inicio) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
}

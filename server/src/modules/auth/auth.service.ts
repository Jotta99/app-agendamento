import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { timingSafeEqual } from 'crypto';
import { LoginDto } from './dto/login.dto';

// Identificador fixo do único usuário (a manicure).
const SUJEITO = 'manicure';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // Comparação em tempo constante (evita timing attacks).
  private igual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  }

  async login(dto: LoginDto) {
    const senha = this.config.get<string>('AUTH_SENHA') as string;

    if (!this.igual(dto.senha, senha)) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    const token = await this.jwtService.signAsync({ sub: SUJEITO });

    return {
      access_token: token,
    };
  }
}

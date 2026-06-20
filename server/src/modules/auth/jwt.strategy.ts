import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
  sub: string;
}

const SUJEITO = "manicure";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET"),
    });
  }

  // Token válido (assinado com o JWT_SECRET) e do sujeito esperado.
  // O retorno vira req.user — precisa ser "truthy", senão o Passport
  // trata como falha e responde 401.
  validate(payload: JwtPayload) {
    if (payload?.sub !== SUJEITO) {
      throw new UnauthorizedException("Sessão inválida.");
    }
    return { sub: payload.sub };
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_PERMITIDOS } from '../decoradores/roles.decorator';
import { Rol, type PayloadJwt } from '../dominio/usuario';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_PERMITIDOS, [
      contexto.getHandler(), contexto.getClass(),
    ]);
    if (!roles) return true;
    const { user } = contexto.switchToHttp().getRequest<{ user?: PayloadJwt }>();
    if (!user || !roles.includes(user.rol)) {
      throw new ForbiddenException('Solo entrenador o administrador pueden cancelar');
    }
    return true;
  }
}

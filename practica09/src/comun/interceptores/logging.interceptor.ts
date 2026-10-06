// Lo que un Interceptor puede hacer y un Pipe no: ve la peticion
// ANTES y la respuesta DESPUES. Envuelve la ejecucion del Controller.
//
// Este es el que SI coincide con el HandlerInterceptor de Spring —
// vale la pena decirlo, es el unico de los tres que coincide.
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    const req = contexto.switchToHttp().getRequest<{ method: string; url: string }>();
    const inicio = Date.now();

    // siguiente.handle() es la llamada al Controller. Todo lo de
    // antes de esta linea corre antes; lo del tap(), despues.
    return siguiente.handle().pipe(
      tap(() => {
        const ms = Date.now() - inicio;
        this.logger.log(`${req.method} ${req.url} - ${ms}ms`);
      }),
    );
  }
}

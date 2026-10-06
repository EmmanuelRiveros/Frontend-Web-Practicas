// BONUS - no esta activado en main.ts. Envuelve TODA respuesta
// exitosa en { data, meta }. Es un cambio que rompe el contrato: todo
// cliente que antes leia res[0].nombre ahora tiene que leer
// res.data[0].nombre. Un sobre asi se decide UNA VEZ, al principio
// del proyecto -- meterlo a la mitad, como aqui, cuesta caro.
//
// Para probarlo: agrega app.useGlobalInterceptors(new
// SobreInterceptor()) en main.ts (junto al LoggingInterceptor) y
// vuelve a correr peticiones.http. Los errores NO se envuelven: pasan
// directo al ExceptionFilter.
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Sobre<T> {
  data: T;
  meta: {
    ruta: string;
    duracionMs: number;
    timestamp: string;
  };
}

@Injectable()
export class SobreInterceptor implements NestInterceptor {
  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<Sobre<unknown>> {
    const req = contexto.switchToHttp().getRequest<{ url: string }>();
    const inicio = Date.now();

    return siguiente.handle().pipe(
      map((data) => ({
        data,
        meta: {
          ruta: req.url,
          duracionMs: Date.now() - inicio,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}

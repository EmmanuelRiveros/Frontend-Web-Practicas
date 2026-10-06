// El equivalente del Filter de Servlet de Java es ESTE (no el
// "Filter" de NestJS). Corre ANTES de que NestJS decida que
// Controller atiende la ruta, por eso no sabe a que handler va la
// peticion, y por eso no sirve para autorizar por rol (para eso
// estan los Guards).
//
// Cuando SI conviene un middleware: algo que no depende del handler.
// Un id de correlacion, CORS, comprimir.
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PeticionIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers['x-request-id'] as string) ?? randomUUID();
    res.setHeader('X-Request-Id', id);

    // Sin next(), la peticion se queda colgada para siempre. Es el
    // error clasico de los middlewares.
    next();
  }
}

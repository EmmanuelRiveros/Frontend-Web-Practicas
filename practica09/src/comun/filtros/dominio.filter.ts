// Traduce los errores de dominio a codigos HTTP, UNA VEZ, para toda
// la aplicacion. Antes esto era un try/catch copiado en cada
// Controller que lo necesitaba.
//
// OJO: esto se llama "Filter" pero no es el Filter de Servlet de
// Java (ese corre ANTES de todo). Corre AL FINAL, solo cuando algo
// falla. El equivalente en Spring es @ControllerAdvice.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CupoLlenoError,
  ErrorDeDominio,
  HorarioNoEncontradoError,
  InscripcionDuplicadaError,
  MiembroNoEncontradoError,
} from '../../inscripciones/dominio/errores';

@Catch(ErrorDeDominio)
export class DominioExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Dominio');

  private codigoPara(error: ErrorDeDominio): number {
    if (error instanceof HorarioNoEncontradoError || error instanceof MiembroNoEncontradoError) {
      return HttpStatus.NOT_FOUND; // 404
    }
    if (error instanceof CupoLlenoError || error instanceof InscripcionDuplicadaError) {
      return HttpStatus.CONFLICT; // 409
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  catch(error: ErrorDeDominio, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url: string; method: string }>();
    const estado = this.codigoPara(error);

    this.logger.warn(`${req.method} ${req.url} -> ${estado} ${error.constructor.name}`);

    res.status(estado).json({
      statusCode: estado,
      error: error.constructor.name,
      message: error.message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}

import express, { type ErrorRequestHandler } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  aPrestamoResponseDto,
  type ErrorResponseDto,
} from '../../contratos/prestamo.dto.js';
import { EjemplarPrestadoError } from '../errores/ejemplar-prestado.error.js';
import { InMemoryPrestamoRepository } from '../infra/in-memory-prestamo.repository.js';
import { PrestamoService } from '../servicios/prestamo.service.js';
import { ValidacionError, validarCrearPrestamo } from './validar.js';

const archivoActual = fileURLToPath(import.meta.url);
const directorioActual = path.dirname(archivoActual);

function respuestaDeError(error: string, detalles?: string[]): ErrorResponseDto {
  return detalles === undefined ? { error } : { error, detalles };
}

export function crearApp(): express.Express {
  const app = express();
  const repositorio = new InMemoryPrestamoRepository();
  const servicio = new PrestamoService(repositorio);

  app.use(express.json());
  app.use(express.static(path.resolve(directorioActual, '../../publico')));

  app.get('/api/prestamos', async (req, res) => {
    const libroId = typeof req.query.libroId === 'string' ? req.query.libroId.trim() : '';

    if (libroId === '') {
      res.status(400).json(respuestaDeError('libroId es obligatorio.'));
      return;
    }

    const prestamos = await servicio.listarPorLibro(libroId);
    res.status(200).json(prestamos.map(aPrestamoResponseDto));
  });

  app.post('/api/prestamos', async (req, res) => {
    const dto = validarCrearPrestamo(req.body);
    const prestamo = await servicio.crear(dto);
    const respuesta = aPrestamoResponseDto(prestamo);

    res
      .location(`/api/prestamos/${respuesta.folio}`)
      .status(201)
      .json(respuesta);
  });

  app.use((_req, res) => {
    res.status(404).json(respuestaDeError('Ruta no encontrada.'));
  });

  const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ValidacionError) {
      res.status(400).json(respuestaDeError(error.message, error.detalles));
      return;
    }

    if (error instanceof EjemplarPrestadoError) {
      res.status(409).json(respuestaDeError(error.message));
      return;
    }

    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json(respuestaDeError('El cuerpo debe contener JSON valido.'));
      return;
    }

    console.error('Error no controlado:', error);
    res.status(500).json(respuestaDeError('Error interno del servidor.'));
  };

  app.use(manejarErrores);
  return app;
}

export const app = crearApp();

export function iniciarServidor(puerto = 3000): void {
  app.listen(puerto, () => {
    console.log(`API disponible en http://localhost:${puerto}`);
  });
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === archivoActual) {
  iniciarServidor();
}

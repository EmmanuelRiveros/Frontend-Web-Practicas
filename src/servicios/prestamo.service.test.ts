import assert from 'node:assert/strict';
import { test } from 'node:test';
import { InMemoryPrestamoRepository } from '../infra/in-memory-prestamo.repository.js';
import { EjemplarPrestadoError } from '../errores/ejemplar-prestado.error.js';
import { PrestamoService } from './prestamo.service.js';

test('crea un prestamo cuando los ejemplares estan disponibles', async () => {
  const servicio = new PrestamoService(new InMemoryPrestamoRepository());

  const prestamo = await servicio.crear({
    libroId: 'LIB-0417',
    socioId: 'S-001',
    ejemplares: [14, 15],
  });

  assert.equal(prestamo.libroId, 'LIB-0417');
  assert.equal(prestamo.socioId, 'S-001');
  assert.deepEqual(prestamo.ejemplares, [14, 15]);
  assert.equal(prestamo.estado, 'activo');
  assert.equal(prestamo.costoReposicion, 0);
});

test('rechaza un prestamo si repite un ejemplar que sigue fuera', async () => {
  const servicio = new PrestamoService(new InMemoryPrestamoRepository());

  await servicio.crear({
    libroId: 'LIB-0417',
    socioId: 'S-001',
    ejemplares: [15],
  });

  await assert.rejects(
    servicio.crear({
      libroId: 'LIB-0417',
      socioId: 'S-002',
      ejemplares: [15, 16],
    }),
    (error: unknown) => {
      assert.ok(error instanceof EjemplarPrestadoError);
      assert.equal(error.ejemplar, 15);
      return true;
    },
  );
});

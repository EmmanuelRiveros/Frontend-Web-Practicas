// Se corre con: npx prisma db seed
// OJO: en Prisma 7 ya no se dispara solo despues de `migrate reset`.
import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generado/prisma/client';
import * as bcrypt from 'bcryptjs';

const u = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: u.hostname,
  port: Number(u.port || 3306),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, ''),
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  if (u.pathname.slice(1) !== 'practica10_gimnasio') {
    throw new Error('El seed solo puede limpiar la base aislada practica10_gimnasio.');
  }
  // Orden inverso a las dependencias: primero lo que apunta, al
  // final lo apuntado.
  await prisma.usuario.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.horario.deleteMany();
  await prisma.miembro.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.$executeRawUnsafe('ALTER TABLE usuarios AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE inscripciones AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE horarios AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE miembros AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE clases AUTO_INCREMENT = 1');

  await prisma.clase.createMany({
    data: [
      { id: 1, nombre: 'Yoga' },
      { id: 2, nombre: 'Spinning' },
    ],
  });

  await prisma.horario.createMany({
    data: [
      { id: 1, claseId: 1, dia: 'lunes', horaInicio: '07:00', cupoMaximo: 2, entrenador: 'Ana Robles' },
      { id: 2, claseId: 1, dia: 'miercoles', horaInicio: '07:00', cupoMaximo: 3, entrenador: 'Ana Robles' },
      { id: 3, claseId: 2, dia: 'martes', horaInicio: '19:00', cupoMaximo: 4, entrenador: 'Luis Fierro' },
    ],
  });

  await prisma.miembro.createMany({
    data: [
      { id: 1, nombre: 'Karla Duarte', correo: 'karla@itson.mx', membresia: 'premium', activo: true },
      { id: 2, nombre: 'Omar Valdez', correo: 'omar@itson.mx', membresia: 'plus', activo: true },
      { id: 3, nombre: 'Sofia Ibarra', correo: 'sofia@itson.mx', membresia: 'basica', activo: true },
    ],
  });

  // Las tres cuentas que usa el front de la Unidad III.
  const passwordHash = await bcrypt.hash('gimnasio2026', 10);
  await prisma.usuario.createMany({
    data: [
      { correo: 'karla@itson.mx', passwordHash, rol: 'miembro', miembroId: 1 },
      { correo: 'ana@itson.mx', passwordHash, rol: 'entrenador' },
      { correo: 'admin@itson.mx', passwordHash, rol: 'admin' },
    ],
  });

  console.log(
    `Seed listo: ${await prisma.clase.count()} clases, ` +
    `${await prisma.horario.count()} horarios, ` +
    `${await prisma.miembro.count()} miembros.`,
  );
}

main()
  .catch((e) => {
    console.error('El seed fallo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

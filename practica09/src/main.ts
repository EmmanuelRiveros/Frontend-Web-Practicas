// Primera linea: carga el .env en process.env. `prisma.config.ts`
// hace lo mismo pero solo para el CLI de Prisma (migrate, studio);
// la app corriendo con `npm run start:dev` lo necesita por su
// cuenta, o PrismaService no encuentra DATABASE_URL.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DominioExceptionFilter } from './comun/filtros/dominio.filter';
import { LoggingInterceptor } from './comun/interceptores/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Solo estos dos origenes de desarrollo pueden llamar a la API
  // desde un navegador. Un cliente sin navegador (curl, Postman, el
  // propio peticiones.http) nunca pasa por CORS: esa proteccion la
  // aplica el navegador, no el servidor.
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    exposedHeaders: ['Location', 'X-Request-Id'],
  });

  // whitelist: quita del body cualquier campo que no este en el DTO.
  // forbidNonWhitelisted: si mandan un campo de mas, 400 en vez de
  // ignorarlo en silencio.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalFilters(new DominioExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

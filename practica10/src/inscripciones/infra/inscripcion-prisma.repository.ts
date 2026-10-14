import { Injectable } from '@nestjs/common';
import { Inscripcion, NuevaInscripcion } from '../dominio/entidades';
import { InscripcionRepository } from '../dominio/inscripcion.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InscripcionPrismaRepository implements InscripcionRepository {
  constructor(private readonly prisma: PrismaService) {}

  listar(): Promise<Inscripcion[]> {
    return this.prisma.inscripcion.findMany() as Promise<Inscripcion[]>;
  }

  buscarPorId(id: number): Promise<Inscripcion | null> {
    return this.prisma.inscripcion.findUnique({ where: { id } }) as Promise<Inscripcion | null>;
  }

  buscarPorHorario(horarioId: number): Promise<Inscripcion[]> {
    return this.prisma.inscripcion.findMany({ where: { horarioId } }) as Promise<Inscripcion[]>;
  }

  buscarHorario(horarioId: number) {
    return this.prisma.horario.findUnique({ where: { id: horarioId } });
  }

  buscarMiembro(miembroId: number) {
    return this.prisma.miembro.findUnique({ where: { id: miembroId } });
  }

  guardar(datos: NuevaInscripcion): Promise<Inscripcion> {
    // Una cancelación libera el lugar. El índice único conserva una sola
    // fila por pareja, así que la reactivamos en lugar de duplicarla.
    return this.prisma.inscripcion.upsert({
      where: {
        horarioId_miembroId: { horarioId: datos.horarioId, miembroId: datos.miembroId },
      },
      create: { horarioId: datos.horarioId, miembroId: datos.miembroId, estado: 'confirmada' },
      update: { estado: 'confirmada', creadaEn: new Date() },
    }) as Promise<Inscripcion>;
  }

  async cancelar(id: number): Promise<Inscripcion | null> {
    const existe = await this.prisma.inscripcion.findUnique({ where: { id } });
    if (!existe) return null;
    return this.prisma.inscripcion.update({
      where: { id },
      data: { estado: 'cancelada' },
    }) as Promise<Inscripcion>;
  }
}

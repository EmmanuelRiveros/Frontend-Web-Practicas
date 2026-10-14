import { Injectable } from '@nestjs/common';
import { Miembro } from '../dominio/entidades';
import { MiembroRepository } from '../dominio/miembro.repository';
import { CrearMiembroDto } from '../dto/crear-miembro.dto';
import { ActualizarMiembroDto } from '../dto/actualizar-miembro.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MiembroPrismaRepository implements MiembroRepository {
  constructor(private readonly prisma: PrismaService) {}

  listar(): Promise<Miembro[]> {
    return this.prisma.miembro.findMany();
  }

  buscarPorId(id: number): Promise<Miembro | null> {
    return this.prisma.miembro.findUnique({ where: { id } });
  }

  crear(datos: CrearMiembroDto): Promise<Miembro> {
    return this.prisma.miembro.create({ data: { ...datos, activo: true } });
  }

  async actualizar(id: number, datos: ActualizarMiembroDto): Promise<Miembro | null> {
    const existe = await this.prisma.miembro.findUnique({ where: { id } });
    if (!existe) return null;
    return this.prisma.miembro.update({ where: { id }, data: datos });
  }

  async eliminar(id: number): Promise<Miembro | null> {
    const existe = await this.prisma.miembro.findUnique({ where: { id } });
    if (!existe) return null;
    return this.prisma.miembro.delete({ where: { id } });
  }
}

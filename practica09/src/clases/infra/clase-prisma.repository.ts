import { Injectable } from '@nestjs/common';
import { Clase } from '../dominio/entidades';
import { ClaseRepository } from '../dominio/clase.repository';
import { CrearClaseDto } from '../dto/crear-clase.dto';
import { ActualizarClaseDto } from '../dto/actualizar-clase.dto';
import { PrismaService } from '../../prisma/prisma.service';

// Misma interfaz que ClaseMemoriaRepository. Cambia el "detras": ahora
// es MySQL a traves de Prisma, no un arreglo.
@Injectable()
export class ClasePrismaRepository implements ClaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  listar(): Promise<Clase[]> {
    return this.prisma.clase.findMany();
  }

  buscarPorId(id: number): Promise<Clase | null> {
    return this.prisma.clase.findUnique({ where: { id } });
  }

  crear(datos: CrearClaseDto): Promise<Clase> {
    return this.prisma.clase.create({ data: datos });
  }

  async actualizar(id: number, datos: ActualizarClaseDto): Promise<Clase | null> {
    const existe = await this.prisma.clase.findUnique({ where: { id } });
    if (!existe) return null;
    return this.prisma.clase.update({ where: { id }, data: datos });
  }

  async eliminar(id: number): Promise<Clase | null> {
    const existe = await this.prisma.clase.findUnique({ where: { id } });
    if (!existe) return null;
    return this.prisma.clase.delete({ where: { id } });
  }
}

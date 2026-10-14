// NUEVO (Paso 7): el mismo contrato que el de memoria, pero contra MySQL.
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NuevoUsuario, Rol, Usuario } from '../dominio/usuario';
import { UsuarioRepository } from '../dominio/usuario.repository';

@Injectable()
export class UsuarioPrismaRepository implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {} // PrismaModule es @Global()

  async buscarPorCorreo(correo: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({
      // findUnique porque correo es @unique en el esquema
      where: { correo: correo.toLowerCase() },
    });
    // En la base rol es texto; en el dominio es el enum Rol.
    return fila ? { ...fila, rol: fila.rol as Rol } : null;
  }

  async guardar(nuevo: NuevoUsuario): Promise<Usuario> {
    // id y creadoEn no se mandan: los pone MySQL.
    try {
      const correo = nuevo.correo.toLowerCase();
      const miembro = nuevo.rol === Rol.miembro
        ? await this.prisma.miembro.findUnique({ where: { correo } }) : null;
      const fila = await this.prisma.usuario.create({
        data: { ...nuevo, correo, miembroId: miembro?.id ?? nuevo.miembroId },
      });
      return { ...fila, rol: fila.rol as Rol };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Ese correo ya esta registrado');
      }
      throw error;
    }
  }
}

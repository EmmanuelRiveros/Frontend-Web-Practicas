import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Publico } from '../auth/decoradores/publico.decorator'; // NUEVO (Paso 4)
import { HorariosService } from './horarios.service';
import { CrearHorarioDto } from './dto/crear-horario.dto';
import { ActualizarHorarioDto } from './dto/actualizar-horario.dto';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  /** GET /horarios */
  @Publico() // NUEVO (Paso 4): el catalogo lo ve cualquiera, sin cuenta
  @Get()
  listar() {
    return this.horariosService.listar();
  }

  /** GET /horarios/2 */
  @Publico() // NUEVO (Paso 4)
  @Get(':id')
  async buscar(@Param('id') id: string) {
    const horario = await this.horariosService.buscar(Number(id));
    if (!horario) {
      throw new NotFoundException(`No existe el horario ${id}`);
    }
    return horario;
  }

  /** POST /horarios */
  @Post()
  @HttpCode(201)
  crear(@Body() dto: CrearHorarioDto) {
    return this.horariosService.crear(dto);
  }

  /** PATCH /horarios/2 */
  @Patch(':id')
  async actualizar(@Param('id') id: string, @Body() dto: ActualizarHorarioDto) {
    const horario = await this.horariosService.actualizar(Number(id), dto);
    if (!horario) {
      throw new NotFoundException(`No existe el horario ${id}`);
    }
    return horario;
  }

  /** DELETE /horarios/2 */
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    const horario = await this.horariosService.eliminar(Number(id));
    if (!horario) {
      throw new NotFoundException(`No existe el horario ${id}`);
    }
    return horario;
  }
}

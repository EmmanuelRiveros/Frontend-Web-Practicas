import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

type ClaseGimnasio = {
  identificador: string;
  nombre: string;
};

@Controller()
export class AppController {
  private readonly clases: ClaseGimnasio[] = [
    { identificador: 'CL-001', nombre: 'Yoga matutino' },
    { identificador: 'CL-002', nombre: 'Entrenamiento funcional' },
  ];

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('clases')
  obtenerClases(): ClaseGimnasio[] {
    return this.clases;
  }

  @Post('clases')
  agregarClase(@Body() clase: ClaseGimnasio): ClaseGimnasio {
    this.clases.push(clase);
    return clase;
  }
}
import { Component } from '@angular/core';
import { CLASES_LOCALES } from './datos/clases-locales';
import type { Clase } from './modelos/clase';
import { TarjetaClase } from './componentes/tarjeta-clase/tarjeta-clase';

@Component({
  selector: 'app-root',
  imports: [TarjetaClase],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected clases: Clase[] = CLASES_LOCALES;

  protected get minutosTotales(): number {
    return this.clases.reduce((suma, c) => suma + c.duracionMin, 0);
  }

  protected get clasesLargas(): number {
    return this.clases.filter((c) => c.duracionMin >= 60).length;
  }

  protected vaciar(): void {
    this.clases = [];
  }

  protected restaurar(): void {
    this.clases = CLASES_LOCALES;
  }
}

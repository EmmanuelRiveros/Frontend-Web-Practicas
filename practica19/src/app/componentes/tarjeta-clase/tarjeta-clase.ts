import { TitleCasePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { Clase } from '../../modelos/clase';

@Component({
  selector: 'app-tarjeta-clase',
  imports: [TitleCasePipe],
  templateUrl: './tarjeta-clase.html',
  styleUrl: './tarjeta-clase.css',
})
export class TarjetaClase {
  readonly clase = input.required<Clase>();
}

import { Component, inject } from '@angular/core';
import { CATEGORIAS } from '../../modelos/clase';
import { Catalogo } from '../../servicios/catalogo';

@Component({
  selector: 'app-filtro-categoria',
  templateUrl: './filtro-categoria.html',
  styleUrl: './filtro-categoria.css',
})
export class FiltroCategoria {
  protected readonly catalogo = inject(Catalogo);

  protected readonly opciones = ['todas' as const, ...CATEGORIAS];
}

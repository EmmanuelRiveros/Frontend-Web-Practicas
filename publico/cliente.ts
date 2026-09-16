// =====================================================================
//  cliente/cliente.ts   —   el frontend, tipado con el MISMO contrato
// =====================================================================
//  ESTE ES EL MOMENTO CLAVE DE LA PRACTICA.
//
//  Fijense en el primer import: `import type`. Es una importacion de
//  SOLO TIPOS, asi que desaparece por completo al compilar. Si abren
//  `dist/cliente/cliente.js` van a ver que no hay ni un import: el
//  contrato existio en tiempo de compilacion y se borro despues.
//
//  Resultado: el navegador recibe JavaScript puro sin dependencias,
//  pero mientras escribiamos el codigo teniamos autocompletado y
//  verificacion del backend. El mismo tipo en las dos puntas del cable.
//
//  PRUEBA A HACER EN VIVO (checkpoint 5):
//  cambiar `folio` por `id` en contratos/prestamo.dto.ts y guardar.
//  Este archivo deja de compilar de inmediato. Eso es lo que uno quiere:
//  enterarse al compilar, no cuando el usuario ve la pantalla en blanco.
// =====================================================================

import type {
  PrestamoResponseDto,
  CrearPrestamoRequestDto,
  ErrorResponseDto,
} from '../contratos/prestamo.dto.js';

// ---------------------------------------------------------------------
//  Referencias al DOM
// ---------------------------------------------------------------------
const $ = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (el === null) throw new Error(`Falta el elemento #${id}`);
  return el;
};

const form = $('form-prestamo') as HTMLFormElement;
const inputLibro = $('libroId') as HTMLInputElement;
const inputSocio = $('socioId') as HTMLInputElement;
const inputEjemplares = $('ejemplares') as HTMLInputElement;
const salida = $('salida');
const lista = $('lista');

// ---------------------------------------------------------------------
//  Pinta el codigo de estado con color segun la familia
// ---------------------------------------------------------------------
function mostrarEstado(codigo: number, cuerpo: unknown): void {
  const clase = codigo < 300 ? 'ok' : codigo < 500 ? 'aviso' : 'mal';
  salida.className = clase;
  salida.textContent = `HTTP ${codigo}\n\n${JSON.stringify(cuerpo, null, 2)}`;
}

// ---------------------------------------------------------------------
//  POST /api/prestamos
// ---------------------------------------------------------------------
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  //  El cuerpo se arma con el tipo del contrato: si al backend le falta
  //  un campo o le cambia el nombre, esto no compila.
  const cuerpo: CrearPrestamoRequestDto = {
    libroId: inputLibro.value,
    socioId: inputSocio.value,
    ejemplares: inputEjemplares.value
      .split(',')
      .map((t) => Number(t.trim()))
      .filter((n) => !Number.isNaN(n)),
  };

  const res = await fetch('/api/prestamos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });

  //  Segun el codigo, el cuerpo tiene una forma distinta. Las dos
  //  formas estan en el contrato, asi que las dos estan tipadas.
  if (res.status === 201) {
    const creado = (await res.json()) as PrestamoResponseDto;
    mostrarEstado(201, creado);
    await recargarLista(creado.libroId);
  } else {
    const error = (await res.json()) as ErrorResponseDto;
    mostrarEstado(res.status, error);
  }
});

// ---------------------------------------------------------------------
//  GET /api/prestamos?libroId=...
// ---------------------------------------------------------------------
async function recargarLista(libroId: string): Promise<void> {
  const res = await fetch(`/api/prestamos?libroId=${encodeURIComponent(libroId)}`);
  if (!res.ok) {
    lista.innerHTML = '<li class="vacio">No se pudo consultar</li>';
    return;
  }

  //  Aqui esta el autocompletado real: al escribir `p.` el editor
  //  ofrece folio, libroId, ejemplares, socioId, estado y creadoEn.
  //  Y NO ofrece costoReposicion, porque el contrato no lo expone.
  const prestamos = (await res.json()) as PrestamoResponseDto[];

  if (prestamos.length === 0) {
    lista.innerHTML = '<li class="vacio">Sin prestamos para ese libro</li>';
    return;
  }

  lista.innerHTML = prestamos
    .map(
      (p) => `<li>
        <strong>${p.folio}</strong>
        <span class="chip ${p.estado}">${p.estado}</span>
        ejemplares ${p.ejemplares.join(', ')} &middot; socio ${p.socioId}
      </li>`,
    )
    .join('');
}

$('btn-consultar').addEventListener('click', () => {
  void recargarLista(inputLibro.value);
});

//  Carga inicial
void recargarLista(inputLibro.value);

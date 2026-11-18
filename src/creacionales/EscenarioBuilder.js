'use strict';

// PATRÓN CREACIONAL: BUILDER
// Un escenario tiene muchas partes opcionales (varios ingresos, gastos, ahorros, obligaciones actuales y la
// obligación nueva). El Builder lo arma paso a paso con una interfaz fluida y valida todo en build().

const { Escenario } = require('../dominio/Escenario');
const { Movimiento } = require('../dominio/Movimiento');
const { ObligacionNueva } = require('../dominio/ObligacionNueva');
const { ErrorValidacion } = require('../dominio/ErrorValidacion');

class EscenarioBuilder {
  constructor() {
    this.reiniciar();
  }

  reiniciar() {
    this._id = 'SIN_ID';
    this._descripcion = '';
    this._movimientos = [];
    this._obligacion = null;
    return this;
  }

  conId(id) { this._id = id; return this; }
  conDescripcion(descripcion) { this._descripcion = descripcion; return this; }
  conMovimiento(tipo, valor, categoria = '') { this._movimientos.push(new Movimiento(tipo, valor, categoria)); return this; }
  conIngreso(valor, categoria = '') { return this.conMovimiento('ingreso', valor, categoria); }
  conGasto(valor, categoria = '') { return this.conMovimiento('gasto', valor, categoria); }
  conAhorro(valor, categoria = '') { return this.conMovimiento('ahorro', valor, categoria); }
  conObligacionActual(valor, categoria = '') { return this.conMovimiento('obligacion', valor, categoria); }
  conObligacionNueva(datos) { this._obligacion = new ObligacionNueva(datos); return this; }

  /** Entrega el producto terminado y deja el builder listo para otro escenario. */
  build() {
    if (this._obligacion === null) {
      throw new ErrorValidacion('obligacionNueva es obligatoria');
    }
    const escenario = new Escenario(this._id, this._descripcion, this._movimientos, this._obligacion);
    this.reiniciar();
    return escenario;
  }

  /** Atajo: arma un escenario desde el formato JSON de los escenarios semilla. */
  static desdeObjeto({ id = 'SIN_ID', descripcion = '', movimientos, obligacionNueva }) {
    if (!Array.isArray(movimientos)) throw new ErrorValidacion('movimientos debe ser una lista');
    const b = new EscenarioBuilder().conId(id).conDescripcion(descripcion);
    movimientos.forEach((m) => b.conMovimiento(m.tipo, m.valor, m.categoria));
    if (obligacionNueva) b.conObligacionNueva(obligacionNueva);
    return b.build();
  }
}

module.exports = { EscenarioBuilder };

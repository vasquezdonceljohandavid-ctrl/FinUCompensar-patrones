'use strict';

const { TIPOS } = require('./Movimiento');

/** Periodo mensual de un estudiante más la obligación que desea simular. Se construye con EscenarioBuilder. */
class Escenario {
  constructor(id, descripcion, movimientos, obligacionNueva) {
    this.id = id;
    this.descripcion = descripcion;
    this.movimientos = Object.freeze([...movimientos]);
    this.obligacionNueva = obligacionNueva;
    Object.freeze(this);
  }

  /** RG-01: suma de valores por tipo de movimiento. */
  totales() {
    const totales = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    for (const m of this.movimientos) totales[m.tipo] += m.valor;
    return totales;
  }
}

module.exports = { Escenario };

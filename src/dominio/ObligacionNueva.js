'use strict';

const { ErrorValidacion } = require('./ErrorValidacion');

function enteroPositivo(valor, campo) {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new ErrorValidacion(`${campo} debe ser un entero mayor que 0`);
  }
}

/**
 * Obligación que el estudiante quiere simular.
 * La cuota es opcional: si no se indica, una estrategia de cálculo de cuota la estima (patrón Strategy).
 */
class ObligacionNueva {
  constructor({ valor, plazoMeses, cuota = null, tasaMensual = 0 }) {
    enteroPositivo(valor, 'obligacionNueva.valor');
    enteroPositivo(plazoMeses, 'obligacionNueva.plazoMeses');
    if (cuota !== null) enteroPositivo(cuota, 'obligacionNueva.cuota');
    if (typeof tasaMensual !== 'number' || tasaMensual < 0) {
      throw new ErrorValidacion('obligacionNueva.tasaMensual debe ser un número mayor o igual a 0');
    }
    this.valor = valor;
    this.plazoMeses = plazoMeses;
    this.cuota = cuota;
    this.tasaMensual = tasaMensual;
    Object.freeze(this);
  }
}

module.exports = { ObligacionNueva };

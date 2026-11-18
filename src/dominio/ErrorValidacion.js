'use strict';

/** Error que detiene el cálculo cuando una entrada no cumple las reglas v1.0.0. */
class ErrorValidacion extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorValidacion';
  }
}

module.exports = { ErrorValidacion };

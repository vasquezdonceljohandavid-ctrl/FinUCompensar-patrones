'use strict';

const { ErrorValidacion } = require('./ErrorValidacion');

const TIPOS = Object.freeze(['ingreso', 'gasto', 'ahorro', 'obligacion']);

/** Un ingreso, gasto, ahorro u obligación del periodo, en pesos colombianos enteros. */
class Movimiento {
  constructor(tipo, valor, categoria = '') {
    if (!TIPOS.includes(tipo)) {
      throw new ErrorValidacion(`tipo de movimiento no válido: ${tipo}`);
    }
    if (!Number.isInteger(valor) || valor < 0) {
      throw new ErrorValidacion('el valor del movimiento debe ser un entero mayor o igual a 0 (pesos COP)');
    }
    this.tipo = tipo;
    this.valor = valor;
    this.categoria = categoria;
    Object.freeze(this);
  }
}

module.exports = { Movimiento, TIPOS };

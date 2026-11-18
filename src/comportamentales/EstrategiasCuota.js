'use strict';

// PATRÓN COMPORTAMENTAL: STRATEGY
// La cuota de la obligación nueva se puede obtener de varias formas: la que escribe el estudiante (regla
// v1.0.0), dividir el valor entre el plazo, o una cuota fija con interés (sistema francés). Cada forma es
// una estrategia intercambiable; la calculadora no cambia cuando se agrega otra.

const { ErrorValidacion } = require('../dominio/ErrorValidacion');

/** Estrategia por defecto (reglas v1.0.0): usa la cuota que ingresa el usuario. */
class CuotaIngresada {
  nombre() { return 'Cuota ingresada por el usuario'; }
  calcular(obligacion) {
    if (obligacion.cuota === null) {
      throw new ErrorValidacion('obligacionNueva.cuota es obligatoria con la estrategia CuotaIngresada');
    }
    return obligacion.cuota;
  }
}

/** Valor dividido entre el plazo, redondeado hacia arriba al peso. */
class CuotaSinInteres {
  nombre() { return 'Cuota sin interés'; }
  calcular(obligacion) {
    return Math.ceil(obligacion.valor / obligacion.plazoMeses);
  }
}

/** Cuota fija con interés mensual: C = V · i / (1 − (1 + i)^−n), redondeada al peso. */
class CuotaFrancesa {
  nombre() { return 'Cuota fija con interés (sistema francés)'; }
  calcular(obligacion) {
    const { valor: v, plazoMeses: n, tasaMensual: i } = obligacion;
    if (i === 0) return Math.ceil(v / n);
    return Math.round((v * i) / (1 - (1 + i) ** -n));
  }
}

module.exports = { CuotaIngresada, CuotaSinInteres, CuotaFrancesa };

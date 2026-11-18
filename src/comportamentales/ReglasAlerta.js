'use strict';

// PATRÓN COMPORTAMENTAL: CHAIN OF RESPONSIBILITY
// Las 5 alertas educativas se evalúan en orden. Cada regla decide si agrega su alerta y si la evaluación
// continúa: SIN_INGRESOS y DEFICIT_ACTUAL siempre pasan al siguiente eslabón; DEFICIT_SIMULADO,
// MARGEN_ESTRECHO y MARGEN_POSITIVO son excluyentes, así que la primera que aplica corta la cadena.

/** Manejador abstracto. */
class ReglaAlerta {
  constructor() {
    this.siguiente = null;
  }

  /** Enlaza el siguiente eslabón y lo devuelve para encadenar: a.enlazar(b).enlazar(c). */
  enlazar(regla) {
    this.siguiente = regla;
    return regla;
  }

  evaluar(contexto, alertas = []) {
    const continuar = this.aplicar(contexto, alertas);
    if (continuar && this.siguiente) this.siguiente.evaluar(contexto, alertas);
    return alertas;
  }

  /** @returns {boolean} true si la evaluación debe seguir con el siguiente eslabón. */
  aplicar() {
    throw new Error('aplicar() debe implementarse en la subclase');
  }
}

class ReglaSinIngresos extends ReglaAlerta {
  aplicar({ totales }, alertas) {
    if (totales.ingreso === 0) alertas.push('SIN_INGRESOS');
    return true;
  }
}

class ReglaDeficitActual extends ReglaAlerta {
  aplicar({ margenActual }, alertas) {
    if (margenActual < 0) alertas.push('DEFICIT_ACTUAL');
    return true;
  }
}

class ReglaDeficitSimulado extends ReglaAlerta {
  aplicar({ margenSimulado }, alertas) {
    if (margenSimulado < 0) {
      alertas.push('DEFICIT_SIMULADO');
      return false;
    }
    return true;
  }
}

class ReglaMargenEstrecho extends ReglaAlerta {
  aplicar({ totales, margenSimulado, umbral }, alertas) {
    if (totales.ingreso > 0 && margenSimulado < totales.ingreso * umbral) {
      alertas.push('MARGEN_ESTRECHO');
      return false;
    }
    return true;
  }
}

class ReglaMargenPositivo extends ReglaAlerta {
  aplicar({ totales }, alertas) {
    if (totales.ingreso > 0) alertas.push('MARGEN_POSITIVO');
    return false;
  }
}

/** Arma la cadena en el orden de la especificación de reglas v1.0.0 y devuelve el primer eslabón. */
function crearCadenaAlertas() {
  const inicio = new ReglaSinIngresos();
  inicio
    .enlazar(new ReglaDeficitActual())
    .enlazar(new ReglaDeficitSimulado())
    .enlazar(new ReglaMargenEstrecho())
    .enlazar(new ReglaMargenPositivo());
  return inicio;
}

module.exports = {
  ReglaAlerta, ReglaSinIngresos, ReglaDeficitActual, ReglaDeficitSimulado,
  ReglaMargenEstrecho, ReglaMargenPositivo, crearCadenaAlertas,
};

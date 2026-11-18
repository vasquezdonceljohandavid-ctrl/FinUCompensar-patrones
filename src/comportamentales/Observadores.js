'use strict';

// PATRÓN COMPORTAMENTAL: OBSERVER
// Cuando termina un análisis, varias partes quieren enterarse: la bitácora (trazabilidad), el contador de
// alertas (métricas para el informe de validación) y la consola (aviso inmediato de déficit). El publicador
// les notifica sin conocer sus clases concretas; se pueden suscribir o retirar en tiempo de ejecución.

/** Sujeto. */
class PublicadorAnalisis {
  #observadores = new Set();

  suscribir(observador) {
    if (typeof observador?.actualizar !== 'function') {
      throw new TypeError('el observador debe implementar actualizar(resultado)');
    }
    this.#observadores.add(observador);
  }

  desuscribir(observador) {
    this.#observadores.delete(observador);
  }

  get cantidad() {
    return this.#observadores.size;
  }

  notificar(resultado) {
    for (const o of this.#observadores) o.actualizar(resultado);
  }
}

/** Observador concreto: guarda un registro de cada análisis. */
class BitacoraAnalisis {
  constructor(reloj = () => new Date().toISOString()) {
    this.reloj = reloj;
    this.registros = [];
  }

  actualizar(r) {
    this.registros.push({ fecha: this.reloj(), escenario: r.escenarioId, condicion: r.condicion, alertas: [...r.alertas] });
  }
}

/** Observador concreto: cuenta cuántas veces aparece cada alerta. */
class ContadorAlertas {
  constructor() {
    this.conteo = {};
  }

  actualizar(r) {
    for (const a of r.alertas) this.conteo[a] = (this.conteo[a] ?? 0) + 1;
  }
}

/** Observador concreto: avisa de inmediato cuando el margen simulado queda negativo. */
class AvisoDeficitConsola {
  constructor(salida = console.log) {
    this.salida = salida;
  }

  actualizar(r) {
    if (r.condicion === 'NEGATIVO') {
      this.salida(`[Aviso] Escenario ${r.escenarioId}: con la nueva cuota el margen queda negativo.`);
    }
  }
}

module.exports = { PublicadorAnalisis, BitacoraAnalisis, ContadorAlertas, AvisoDeficitConsola };

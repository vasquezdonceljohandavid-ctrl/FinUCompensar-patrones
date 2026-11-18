'use strict';

/** Resultado inmutable del análisis de un escenario. Mismos campos que el motor v1.0.0 más la cuota aplicada. */
class ResultadoAnalisis {
  constructor(datos) {
    this.escenarioId = datos.escenarioId;
    this.versionReglas = datos.versionReglas;
    this.totales = Object.freeze({ ...datos.totales });
    this.cuotaAplicada = datos.cuotaAplicada;
    this.margenActual = datos.margenActual;
    this.margenSimulado = datos.margenSimulado;
    this.variacion = datos.variacion;
    this.condicion = datos.condicion;
    this.proporcionObligacionesActual = datos.proporcionObligacionesActual;
    this.proporcionObligacionesSimulada = datos.proporcionObligacionesSimulada;
    this.alertas = Object.freeze([...datos.alertas]);
    this.aviso = datos.aviso;
    Object.freeze(this);
  }
}

module.exports = { ResultadoAnalisis };

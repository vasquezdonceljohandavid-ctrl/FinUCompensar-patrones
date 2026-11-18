'use strict';

// Implementación nueva de la interfaz ServicioAnalisis. Es el contexto del patrón Strategy (estrategia de
// cuota) y el cliente del patrón Chain of Responsibility (reglas de alerta). Aplica las reglas RG-02 a RG-06.

const { ConfiguracionReglas } = require('../creacionales/ConfiguracionReglas');
const { ResultadoAnalisis } = require('../dominio/ResultadoAnalisis');
const { CuotaIngresada } = require('./EstrategiasCuota');
const { crearCadenaAlertas } = require('./ReglasAlerta');

const proporcion = (numerador, ingreso) => (ingreso > 0 ? numerador / ingreso : null);

class CalculadoraMargen {
  constructor({ estrategiaCuota = new CuotaIngresada(), cadenaAlertas = crearCadenaAlertas() } = {}) {
    this.estrategiaCuota = estrategiaCuota;
    this.cadenaAlertas = cadenaAlertas;
    this.config = ConfiguracionReglas.obtenerInstancia();
  }

  /** Cambia la estrategia en tiempo de ejecución. */
  establecerEstrategiaCuota(estrategia) {
    this.estrategiaCuota = estrategia;
  }

  analizar(escenario) {
    const totales = escenario.totales();
    const cuota = this.estrategiaCuota.calcular(escenario.obligacionNueva);
    const margenActual = totales.ingreso - totales.gasto - totales.obligacion - totales.ahorro; // RG-02
    const margenSimulado = margenActual - cuota; // RG-03
    const alertas = this.cadenaAlertas.evaluar({ totales, margenActual, margenSimulado, umbral: this.config.umbralMargenEstrecho });

    return new ResultadoAnalisis({
      escenarioId: escenario.id,
      versionReglas: this.config.versionReglas,
      totales,
      cuotaAplicada: cuota,
      margenActual,
      margenSimulado,
      variacion: margenSimulado - margenActual, // RG-04
      condicion: margenSimulado < 0 ? 'NEGATIVO' : 'POSITIVO_O_CERO', // RG-05
      proporcionObligacionesActual: proporcion(totales.obligacion, totales.ingreso), // RG-06
      proporcionObligacionesSimulada: proporcion(totales.obligacion + cuota, totales.ingreso),
      alertas,
      aviso: this.config.aviso,
    });
  }
}

module.exports = { CalculadoraMargen };

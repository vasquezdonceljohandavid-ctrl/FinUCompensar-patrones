'use strict';

// PATRÓN ESTRUCTURAL: FACADE
// Para simular una cuota hay que construir el escenario, elegir la estrategia de cuota, calcular, evaluar
// la cadena de alertas, avisar a los observadores y exportar el informe. La fachada ofrece una sola
// operación simular() y oculta esos subsistemas a la consola, a la web o a cualquier otro cliente.

const { EscenarioBuilder } = require('../creacionales/EscenarioBuilder');
const { ExportadorTexto, ExportadorJson } = require('../creacionales/ExportadorInforme');
const { CalculadoraMargen } = require('../comportamentales/CalculadoraMargen');
const { PublicadorAnalisis } = require('../comportamentales/Observadores');
const { ErrorValidacion } = require('../dominio/ErrorValidacion');

const EXPORTADORES = { texto: () => new ExportadorTexto(), json: () => new ExportadorJson() };

class SimuladorFinanciero {
  constructor({ servicio = new CalculadoraMargen(), publicador = new PublicadorAnalisis() } = {}) {
    this.servicio = servicio;
    this.publicador = publicador;
  }

  suscribir(observador) {
    this.publicador.suscribir(observador);
    return this;
  }

  /**
   * @param {object} datos escenario en el formato JSON de los escenarios semilla
   * @param {{formato?: 'texto'|'json', estrategia?: object}} opciones
   */
  simular(datos, { formato = 'texto', estrategia = null } = {}) {
    const crearExportador = EXPORTADORES[formato];
    if (!crearExportador) throw new ErrorValidacion(`formato no soportado: ${formato}`);
    if (estrategia) {
      if (typeof this.servicio.establecerEstrategiaCuota !== 'function') {
        throw new ErrorValidacion('el servicio configurado no admite estrategias de cuota');
      }
      this.servicio.establecerEstrategiaCuota(estrategia);
    }
    const escenario = EscenarioBuilder.desdeObjeto(datos);
    const resultado = this.servicio.analizar(escenario);
    this.publicador.notificar(resultado);
    return { resultado, informe: crearExportador().exportar(resultado) };
  }
}

module.exports = { SimuladorFinanciero };

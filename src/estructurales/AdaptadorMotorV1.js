'use strict';

// PATRÓN ESTRUCTURAL: ADAPTER
// El motor v1.0.0 de la prueba de concepto recibe objetos planos y devuelve otro objeto plano. El sistema
// nuevo trabaja con la interfaz ServicioAnalisis: analizar(Escenario) -> ResultadoAnalisis.
// El adaptador traduce entre ambos para reutilizar el código legado sin modificarlo (por ejemplo, para
// comparar el motor nuevo contra el anterior en la prueba de regresión).

const motorV1 = require('../legado/motor_v1');
const { ResultadoAnalisis } = require('../dominio/ResultadoAnalisis');
const { ErrorValidacion } = require('../dominio/ErrorValidacion');

class AdaptadorMotorV1 {
  constructor(adaptado = motorV1) {
    this.adaptado = adaptado;
  }

  /** Implementa ServicioAnalisis.analizar(escenario). */
  analizar(escenario) {
    const o = escenario.obligacionNueva;
    if (o.cuota === null) {
      throw new ErrorValidacion('el motor v1.0.0 exige que la cuota venga indicada');
    }
    const entradaPlana = {
      movimientos: escenario.movimientos.map((m) => ({ tipo: m.tipo, valor: m.valor })),
      obligacionNueva: { valor: o.valor, cuota: o.cuota, plazoMeses: o.plazoMeses },
    };
    const r = this.adaptado.analizarEscenario(entradaPlana);
    return new ResultadoAnalisis({ ...r, escenarioId: escenario.id, cuotaAplicada: o.cuota });
  }
}

module.exports = { AdaptadorMotorV1 };

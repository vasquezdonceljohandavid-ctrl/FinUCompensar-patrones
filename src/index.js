'use strict';

module.exports = {
  ...require('./dominio/ErrorValidacion'),
  ...require('./dominio/Movimiento'),
  ...require('./dominio/ObligacionNueva'),
  ...require('./dominio/Escenario'),
  ...require('./dominio/ResultadoAnalisis'),
  ...require('./creacionales/ConfiguracionReglas'),
  ...require('./creacionales/EscenarioBuilder'),
  ...require('./creacionales/ExportadorInforme'),
  ...require('./estructurales/DecoradoresInforme'),
  ...require('./estructurales/AdaptadorMotorV1'),
  ...require('./estructurales/SimuladorFinanciero'),
  ...require('./comportamentales/EstrategiasCuota'),
  ...require('./comportamentales/ReglasAlerta'),
  ...require('./comportamentales/Observadores'),
  ...require('./comportamentales/CalculadoraMargen'),
};

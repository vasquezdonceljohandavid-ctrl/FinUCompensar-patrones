'use strict';

// Regresión: el motor refactorizado con patrones debe dar exactamente lo mismo que el motor v1.0.0
// en los 10 escenarios semilla (desviación permitida: 0 pesos).
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { escenarios } = require('./helpers');
const { EscenarioBuilder, CalculadoraMargen, AdaptadorMotorV1 } = require('../src');

const CAMPOS = ['margenActual', 'margenSimulado', 'variacion', 'condicion', 'alertas',
  'proporcionObligacionesActual', 'proporcionObligacionesSimulada', 'versionReglas', 'aviso'];

describe('Regresión contra el motor v1.0.0 y los valores esperados', () => {
  const nuevo = new CalculadoraMargen();
  const legado = new AdaptadorMotorV1();
  for (const datos of escenarios) {
    test(`${datos.id} ${datos.descripcion}`, () => {
      const escenario = EscenarioBuilder.desdeObjeto(datos);
      const rNuevo = nuevo.analizar(escenario);
      const rLegado = legado.analizar(escenario);
      for (const k of Object.keys(datos.esperado)) assert.deepEqual(rNuevo[k], datos.esperado[k], `esperado.${k}`);
      for (const k of CAMPOS) assert.deepEqual(rNuevo[k], rLegado[k], `igual al legado: ${k}`);
      assert.deepEqual(rNuevo.totales, rLegado.totales);
    });
  }
});

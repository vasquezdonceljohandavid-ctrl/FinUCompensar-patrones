'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { escenarios } = require('./helpers');
const {
  ConfiguracionReglas, EscenarioBuilder, ErrorValidacion, CalculadoraMargen,
  ExportadorInforme, ExportadorTexto, ExportadorJson,
} = require('../src');

describe('Singleton: ConfiguracionReglas', () => {
  test('siempre devuelve la misma instancia', () => {
    assert.equal(ConfiguracionReglas.obtenerInstancia(), ConfiguracionReglas.obtenerInstancia());
  });
  test('el constructor no se puede usar directamente', () => {
    assert.throws(() => new ConfiguracionReglas(), /obtenerInstancia/);
  });
  test('la configuración es inmutable y trae las reglas v1.0.0', () => {
    const c = ConfiguracionReglas.obtenerInstancia();
    assert.equal(c.versionReglas, '1.0.0');
    assert.equal(c.umbralMargenEstrecho, 0.10);
    assert.ok(Object.isFrozen(c));
    assert.throws(() => { 'use strict'; c.umbralMargenEstrecho = 0.5; }, TypeError);
  });
});

describe('Builder: EscenarioBuilder', () => {
  test('arma un escenario paso a paso con interfaz fluida', () => {
    const e = new EscenarioBuilder()
      .conId('B01').conDescripcion('prueba')
      .conIngreso(2000000).conGasto(1200000).conObligacionActual(300000).conAhorro(200000)
      .conObligacionNueva({ valor: 4000000, cuota: 350000, plazoMeses: 18 })
      .build();
    assert.equal(e.movimientos.length, 4);
    assert.deepEqual(e.totales(), { ingreso: 2000000, gasto: 1200000, ahorro: 200000, obligacion: 300000 });
    assert.equal(new CalculadoraMargen().analizar(e).margenSimulado, -50000);
  });
  test('exige la obligación nueva y valida los valores', () => {
    assert.throws(() => new EscenarioBuilder().conIngreso(100).build(), ErrorValidacion);
    assert.throws(() => new EscenarioBuilder().conGasto(-1), ErrorValidacion);
    assert.throws(() => new EscenarioBuilder().conMovimiento('prestamo', 10), ErrorValidacion);
  });
  test('después de build() queda listo para otro escenario', () => {
    const b = new EscenarioBuilder().conIngreso(100).conObligacionNueva({ valor: 10, cuota: 5, plazoMeses: 2 });
    b.build();
    assert.throws(() => b.build(), ErrorValidacion);
  });
  test('el escenario producido es inmutable', () => {
    const e = EscenarioBuilder.desdeObjeto(escenarios[0]);
    assert.ok(Object.isFrozen(e) && Object.isFrozen(e.movimientos));
  });
});

describe('Factory Method: ExportadorInforme', () => {
  const r = new CalculadoraMargen().analizar(EscenarioBuilder.desdeObjeto(escenarios[0]));
  test('el creador abstracto no fabrica productos', () => {
    assert.throws(() => new ExportadorInforme().exportar(r), /crearFormateador/);
  });
  test('ExportadorTexto crea un informe de texto con encabezado y aviso', () => {
    const txt = new ExportadorTexto().exportar(r);
    assert.match(txt, /^INFORME COMPARATIVO/);
    assert.match(txt, /\[DEFICIT_SIMULADO\]/);
    assert.match(txt, /AVISO: Estimación educativa/);
  });
  test('ExportadorJson crea un JSON con las mismas cifras', () => {
    const obj = JSON.parse(new ExportadorJson().exportar(r));
    assert.equal(obj.margenSimulado, -50000);
    assert.deepEqual(obj.alertas, ['DEFICIT_SIMULADO']);
  });
});

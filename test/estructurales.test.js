'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { escenarios } = require('./helpers');
const {
  EscenarioBuilder, CalculadoraMargen, AdaptadorMotorV1, ResultadoAnalisis, ErrorValidacion,
  SimuladorFinanciero, BitacoraAnalisis, CuotaSinInteres,
  InformeTextoBase, ConEncabezado, ConAvisoEducativo, ConNotaDatosSinteticos,
} = require('../src');

describe('Adapter: AdaptadorMotorV1', () => {
  test('expone la interfaz analizar(Escenario) y devuelve un ResultadoAnalisis', () => {
    const r = new AdaptadorMotorV1().analizar(EscenarioBuilder.desdeObjeto(escenarios[0]));
    assert.ok(r instanceof ResultadoAnalisis);
    assert.equal(r.escenarioId, 'S01');
    assert.equal(r.margenSimulado, -50000);
  });
  test('traduce el escenario al formato plano que espera el código legado', () => {
    let recibido = null;
    const falso = { analizarEscenario: (e) => { recibido = e; return { versionReglas: 'x', totales: {}, alertas: [] }; } };
    new AdaptadorMotorV1(falso).analizar(EscenarioBuilder.desdeObjeto(escenarios[0]));
    assert.deepEqual(recibido.obligacionNueva, { valor: 4000000, cuota: 350000, plazoMeses: 18 });
    assert.deepEqual(Object.keys(recibido.movimientos[0]), ['tipo', 'valor']);
  });
  test('rechaza escenarios sin cuota, que el motor v1 no soporta', () => {
    const e = new EscenarioBuilder().conIngreso(1000).conObligacionNueva({ valor: 600, plazoMeses: 6 }).build();
    assert.throws(() => new AdaptadorMotorV1().analizar(e), ErrorValidacion);
  });
});

describe('Facade: SimuladorFinanciero', () => {
  test('una sola llamada construye, calcula, notifica y exporta', () => {
    const bitacora = new BitacoraAnalisis(() => '2026-11-18');
    const { resultado, informe } = new SimuladorFinanciero().suscribir(bitacora).simular(escenarios[2]);
    assert.equal(resultado.margenSimulado, 50000);
    assert.match(informe, /MARGEN_ESTRECHO/);
    assert.deepEqual(bitacora.registros, [{ fecha: '2026-11-18', escenario: 'S03', condicion: 'POSITIVO_O_CERO', alertas: ['MARGEN_ESTRECHO'] }]);
  });
  test('permite elegir el formato y la estrategia sin conocer los subsistemas', () => {
    const datos = { id: 'F01', movimientos: [{ tipo: 'ingreso', valor: 1000000 }], obligacionNueva: { valor: 1200000, plazoMeses: 12 } };
    const { resultado, informe } = new SimuladorFinanciero().simular(datos, { formato: 'json', estrategia: new CuotaSinInteres() });
    assert.equal(resultado.cuotaAplicada, 100000);
    assert.equal(JSON.parse(informe).margenSimulado, 900000);
  });
  test('puede trabajar con el motor legado detrás de la misma fachada', () => {
    const { resultado } = new SimuladorFinanciero({ servicio: new AdaptadorMotorV1() }).simular(escenarios[0]);
    assert.equal(resultado.margenSimulado, -50000);
  });
  test('rechaza formatos desconocidos', () => {
    assert.throws(() => new SimuladorFinanciero().simular(escenarios[0], { formato: 'pdf' }), ErrorValidacion);
  });
});

describe('Decorator: decoradores del informe', () => {
  const r = new CalculadoraMargen().analizar(EscenarioBuilder.desdeObjeto(escenarios[0]));
  test('el componente base no trae encabezado ni aviso', () => {
    const base = new InformeTextoBase().formatear(r);
    assert.doesNotMatch(base, /INFORME COMPARATIVO|AVISO/);
  });
  test('cada decorador agrega su sección sin modificar al envuelto', () => {
    const base = new InformeTextoBase().formatear(r);
    const conEncabezado = new ConEncabezado(new InformeTextoBase()).formatear(r);
    assert.ok(conEncabezado.startsWith('INFORME COMPARATIVO') && conEncabezado.endsWith(base));
    const completo = new ConAvisoEducativo(new ConNotaDatosSinteticos(new ConEncabezado(new InformeTextoBase()))).formatear(r);
    assert.ok(completo.includes(base));
    assert.ok(completo.indexOf('Nota:') < completo.indexOf('AVISO:'));
  });
});

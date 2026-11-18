'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { escenarios } = require('./helpers');
const {
  EscenarioBuilder, CalculadoraMargen, ErrorValidacion,
  CuotaIngresada, CuotaSinInteres, CuotaFrancesa,
  ReglaAlerta, ReglaDeficitSimulado, ReglaMargenPositivo, crearCadenaAlertas,
  PublicadorAnalisis, BitacoraAnalisis, ContadorAlertas, AvisoDeficitConsola,
} = require('../src');

const credito = (extra = {}) => new EscenarioBuilder()
  .conIngreso(2000000).conGasto(1000000)
  .conObligacionNueva({ valor: 1200000, plazoMeses: 12, ...extra })
  .build();

describe('Strategy: estrategias de cálculo de cuota', () => {
  test('CuotaIngresada usa la cuota del usuario (regla v1.0.0) y la exige', () => {
    assert.equal(new CuotaIngresada().calcular(credito({ cuota: 150000 }).obligacionNueva), 150000);
    assert.throws(() => new CuotaIngresada().calcular(credito().obligacionNueva), ErrorValidacion);
  });
  test('CuotaSinInteres divide valor entre plazo y redondea hacia arriba', () => {
    assert.equal(new CuotaSinInteres().calcular(credito().obligacionNueva), 100000);
    assert.equal(new CuotaSinInteres().calcular({ valor: 1000, plazoMeses: 3 }), 334);
  });
  test('CuotaFrancesa aplica C = V·i / (1 − (1 + i)^−n)', () => {
    assert.equal(new CuotaFrancesa().calcular(credito({ tasaMensual: 0.02 }).obligacionNueva), 113472);
    assert.equal(new CuotaFrancesa().calcular(credito({ tasaMensual: 0 }).obligacionNueva), 100000);
  });
  test('la calculadora cambia de estrategia en tiempo de ejecución', () => {
    const calc = new CalculadoraMargen({ estrategiaCuota: new CuotaSinInteres() });
    const e = credito({ tasaMensual: 0.02 });
    assert.equal(calc.analizar(e).margenSimulado, 900000);
    calc.establecerEstrategiaCuota(new CuotaFrancesa());
    assert.equal(calc.analizar(e).margenSimulado, 1000000 - 113472);
  });
});

describe('Chain of Responsibility: reglas de alerta', () => {
  const evaluar = (datos) => new CalculadoraMargen().analizar(EscenarioBuilder.desdeObjeto(datos)).alertas;
  test('S06: las reglas no excluyentes se acumulan', () => {
    assert.deepEqual(evaluar(escenarios[5]), ['SIN_INGRESOS', 'DEFICIT_ACTUAL', 'DEFICIT_SIMULADO']);
  });
  test('un déficit simulado corta la cadena antes de las reglas de margen', () => {
    assert.deepEqual(evaluar(escenarios[0]), ['DEFICIT_SIMULADO']);
  });
  test('los casos frontera S04 (margen 0) y S09 (margen −1) caen en el eslabón correcto', () => {
    assert.deepEqual(evaluar(escenarios[3]), ['MARGEN_ESTRECHO']);
    assert.deepEqual(evaluar(escenarios[8]), ['DEFICIT_SIMULADO']);
  });
  test('enlazar() devuelve el siguiente eslabón y la cadena se puede reordenar', () => {
    const a = new ReglaDeficitSimulado();
    const b = new ReglaMargenPositivo();
    assert.equal(a.enlazar(b), b);
    assert.deepEqual(a.evaluar({ totales: { ingreso: 100 }, margenSimulado: 50 }), ['MARGEN_POSITIVO']);
    assert.ok(crearCadenaAlertas() instanceof ReglaAlerta);
  });
});

describe('Observer: notificación de análisis', () => {
  test('todos los observadores suscritos reciben el resultado', () => {
    const pub = new PublicadorAnalisis();
    const bitacora = new BitacoraAnalisis(() => 't');
    const contador = new ContadorAlertas();
    const mensajes = [];
    pub.suscribir(bitacora); pub.suscribir(contador); pub.suscribir(new AvisoDeficitConsola((m) => mensajes.push(m)));
    const calc = new CalculadoraMargen();
    for (const d of escenarios) pub.notificar(calc.analizar(EscenarioBuilder.desdeObjeto(d)));
    assert.equal(bitacora.registros.length, 10);
    assert.deepEqual(contador.conteo, { DEFICIT_SIMULADO: 4, MARGEN_POSITIVO: 3, MARGEN_ESTRECHO: 3, DEFICIT_ACTUAL: 2, SIN_INGRESOS: 1 });
    assert.equal(mensajes.length, 4);
  });
  test('un observador retirado deja de recibir notificaciones', () => {
    const pub = new PublicadorAnalisis();
    const contador = new ContadorAlertas();
    pub.suscribir(contador);
    pub.desuscribir(contador);
    pub.notificar({ alertas: ['MARGEN_POSITIVO'] });
    assert.deepEqual(contador.conteo, {});
    assert.equal(pub.cantidad, 0);
  });
  test('rechaza observadores sin actualizar()', () => {
    assert.throws(() => new PublicadorAnalisis().suscribir({}), TypeError);
  });
});

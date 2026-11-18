'use strict';

// Demostración en consola: node src/cli.js [S01..S10] [texto|json]
const fs = require('node:fs');
const path = require('node:path');
const { SimuladorFinanciero, BitacoraAnalisis, ContadorAlertas, AvisoDeficitConsola } = require('./index');

const id = process.argv[2] || 'S01';
const formato = process.argv[3] || 'texto';
const { escenarios } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'datos', 'escenarios_semilla.json'), 'utf8'));
const datos = escenarios.find((e) => e.id === id);
if (!datos) {
  console.error(`No existe el escenario ${id}. Disponibles: ${escenarios.map((e) => e.id).join(', ')}`);
  process.exit(1);
}

const bitacora = new BitacoraAnalisis();
const contador = new ContadorAlertas();
const simulador = new SimuladorFinanciero().suscribir(bitacora).suscribir(contador).suscribir(new AvisoDeficitConsola());

const { informe } = simulador.simular(datos, { formato });
console.log(`Escenario ${datos.id}: ${datos.descripcion}\n`);
console.log(informe);
console.log(`\nBitácora: ${bitacora.registros.length} análisis registrado(s). Alertas: ${JSON.stringify(contador.conteo)}`);

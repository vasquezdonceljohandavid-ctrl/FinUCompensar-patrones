'use strict';

// PATRÓN ESTRUCTURAL: DECORATOR
// El informe en texto se compone de un núcleo (cifras y alertas) al que se le agregan secciones
// envolviéndolo con decoradores. Cada decorador tiene la misma interfaz formatear(resultado) y se pueden
// combinar en cualquier orden sin crear una subclase por cada combinación.

const { ConfiguracionReglas } = require('../creacionales/ConfiguracionReglas');

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const pct = (v) => (v === null ? 'no aplica (sin ingresos)' : `${(v * 100).toFixed(1).replace('.', ',')} %`);

/** Componente concreto: núcleo del informe. */
class InformeTextoBase {
  formatear(r) {
    const config = ConfiguracionReglas.obtenerInstancia();
    const t = r.totales;
    return [
      `Ingresos:               ${pesos.format(t.ingreso)}`,
      `Gastos:                 ${pesos.format(t.gasto)}`,
      `Obligaciones actuales:  ${pesos.format(t.obligacion)}`,
      `Ahorro programado:      ${pesos.format(t.ahorro)}`,
      `Cuota simulada:         ${pesos.format(r.cuotaAplicada)}`,
      '',
      `Margen actual:          ${pesos.format(r.margenActual)}`,
      `Margen simulado:        ${pesos.format(r.margenSimulado)}`,
      `Variación:              ${pesos.format(r.variacion)}`,
      `Obligaciones/ingresos:  ${pct(r.proporcionObligacionesActual)} -> ${pct(r.proporcionObligacionesSimulada)}`,
      '',
      'Alertas educativas:',
      ...r.alertas.map((c) => `  - [${c}] ${config.mensaje(c)}`),
    ].join('\n');
  }
}

/** Decorador abstracto: guarda el componente envuelto y le delega el trabajo. */
class DecoradorInforme {
  constructor(componente) {
    this.componente = componente;
  }

  formatear(resultado) {
    return this.componente.formatear(resultado);
  }
}

class ConEncabezado extends DecoradorInforme {
  formatear(r) {
    return `INFORME COMPARATIVO - FinUCompensar\nReglas v${r.versionReglas} · Escenario ${r.escenarioId}\n\n${super.formatear(r)}`;
  }
}

class ConNotaDatosSinteticos extends DecoradorInforme {
  formatear(r) {
    return `${super.formatear(r)}\n\nNota: los datos de este informe son sintéticos y se usan con fines académicos.`;
  }
}

class ConAvisoEducativo extends DecoradorInforme {
  formatear(r) {
    return `${super.formatear(r)}\n\nAVISO: ${r.aviso}`;
  }
}

module.exports = { InformeTextoBase, DecoradorInforme, ConEncabezado, ConNotaDatosSinteticos, ConAvisoEducativo };

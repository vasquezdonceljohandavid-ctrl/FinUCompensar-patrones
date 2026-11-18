'use strict';

// PATRÓN CREACIONAL: SINGLETON
// Las reglas v1.0.0 (versión, umbral del 10 %, mensajes y aviso educativo) deben ser únicas en toda la
// aplicación: si dos partes del sistema usaran umbrales distintos, el informe y las alertas no coincidirían.

const TOKEN = Symbol('ConfiguracionReglas');

class ConfiguracionReglas {
  static #instancia = null;

  constructor(token) {
    if (token !== TOKEN) {
      throw new Error('Use ConfiguracionReglas.obtenerInstancia(); el constructor es privado.');
    }
    this.versionReglas = '1.0.0';
    this.umbralMargenEstrecho = 0.10;
    this.aviso =
      'Estimación educativa basada únicamente en los datos que registraste. ' +
      'No es una aprobación ni un rechazo de crédito, no consulta centrales de riesgo ' +
      'y no sustituye la asesoría de un profesional.';
    this.mensajes = Object.freeze({
      SIN_INGRESOS: 'No registraste ingresos en este periodo; no es posible estimar un margen disponible.',
      DEFICIT_ACTUAL: 'Antes de la nueva cuota, tus egresos ya superan tus ingresos.',
      DEFICIT_SIMULADO: 'Con esta cuota, tus egresos superarían tus ingresos.',
      MARGEN_ESTRECHO: 'Con esta cuota te quedaría menos del 10 % de tus ingresos como margen.',
      MARGEN_POSITIVO: 'Con esta cuota conservarías un margen positivo.',
    });
    Object.freeze(this);
  }

  /** Punto de acceso global: crea la instancia la primera vez y luego devuelve siempre la misma. */
  static obtenerInstancia() {
    if (ConfiguracionReglas.#instancia === null) {
      ConfiguracionReglas.#instancia = new ConfiguracionReglas(TOKEN);
    }
    return ConfiguracionReglas.#instancia;
  }

  mensaje(codigo) {
    return this.mensajes[codigo];
  }
}

module.exports = { ConfiguracionReglas };

'use strict';

// PATRÓN CREACIONAL: FACTORY METHOD
// ExportadorInforme define el algoritmo de exportación pero delega en sus subclases la creación del
// formateador concreto (crearFormateador). Agregar un formato nuevo (CSV, HTML) no obliga a tocar el código
// que exporta: basta con una subclase nueva.

const { InformeTextoBase, ConEncabezado, ConAvisoEducativo, ConNotaDatosSinteticos } = require('../estructurales/DecoradoresInforme');

/** Creador abstracto. */
class ExportadorInforme {
  /** Factory method: cada subclase decide qué producto (Formateador) crear. */
  crearFormateador() {
    throw new Error('crearFormateador() debe implementarse en la subclase');
  }

  exportar(resultado) {
    const formateador = this.crearFormateador();
    return formateador.formatear(resultado);
  }
}

/** Creador concreto: informe en texto, decorado con encabezado, nota y aviso (patrón Decorator). */
class ExportadorTexto extends ExportadorInforme {
  crearFormateador() {
    return new ConAvisoEducativo(new ConNotaDatosSinteticos(new ConEncabezado(new InformeTextoBase())));
  }
}

/** Producto concreto para JSON. */
class FormateadorJson {
  formatear(resultado) {
    return JSON.stringify(resultado, null, 2);
  }
}

/** Creador concreto: informe en JSON para otros sistemas. */
class ExportadorJson extends ExportadorInforme {
  crearFormateador() {
    return new FormateadorJson();
  }
}

module.exports = { ExportadorInforme, ExportadorTexto, ExportadorJson, FormateadorJson };

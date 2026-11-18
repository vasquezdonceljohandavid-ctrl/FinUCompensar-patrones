# FinUCompensar · Patrones de diseño

Refactorización del motor de simulación financiera de **FinUCompensar** aplicando patrones de diseño creacionales, estructurales y comportamentales.

**Fundación Universitaria Compensar · Ingeniería de Software · Patrones de Diseño · 2026-2**

Integrantes:
- Johan David Vásquez Doncel
- Alejandro Forero Saavedra
- Rolando Stiven Ramírez Rozo

## Qué es FinUCompensar

Prototipo web educativo para que estudiantes de UCompensar en práctica empresarial vean, antes de aceptar una nueva cuota, cómo cambiaría su margen mensual. El sistema no aprueba créditos, no consulta centrales de riesgo y trabaja solo con datos sintéticos.

Este repositorio toma el motor de cálculo v1.0.0 de la prueba de concepto ([FinUCompensar-evidencias](https://github.com/vasquezdonceljohandavid-ctrl/FinUCompensar-evidencias)) y lo reorganiza con 9 patrones de diseño, sin cambiar sus resultados: la prueba de regresión compara el motor nuevo con el anterior en los 10 escenarios semilla y exige desviación de 0 pesos.

## Cómo ejecutarlo

Requiere Node.js 20 o superior. No usa dependencias externas.

```bash
npm test                 # 40 pruebas automáticas (regresión + una suite por patrón)
npm run demo             # informe del escenario S01 en texto
node src/cli.js S06 json # otro escenario, en JSON
```

## Patrones implementados

| Tipo | Patrón | Archivo | Para qué se usa |
|---|---|---|---|
| Creacional | Singleton | `src/creacionales/ConfiguracionReglas.js` | Una sola fuente para la versión de reglas, el umbral del 10 %, los mensajes y el aviso educativo. |
| Creacional | Builder | `src/creacionales/EscenarioBuilder.js` | Arma paso a paso un escenario con varios movimientos y la obligación nueva, y lo valida al final. |
| Creacional | Factory Method | `src/creacionales/ExportadorInforme.js` | Cada exportador (texto, JSON) decide qué formateador crear; un formato nuevo es una subclase nueva. |
| Estructural | Adapter | `src/estructurales/AdaptadorMotorV1.js` | Reutiliza el motor v1.0.0 legado detrás de la interfaz nueva `analizar(Escenario)`. |
| Estructural | Facade | `src/estructurales/SimuladorFinanciero.js` | Una sola operación `simular()` oculta construcción, cálculo, alertas, notificación y exportación. |
| Estructural | Decorator | `src/estructurales/DecoradoresInforme.js` | Agrega encabezado, nota de datos sintéticos y aviso educativo al informe sin subclases por combinación. |
| Comportamental | Strategy | `src/comportamentales/EstrategiasCuota.js` | Cuota ingresada, sin interés o sistema francés, intercambiables en tiempo de ejecución. |
| Comportamental | Chain of Responsibility | `src/comportamentales/ReglasAlerta.js` | Las 5 alertas educativas se evalúan como eslabones; las excluyentes cortan la cadena. |
| Comportamental | Observer | `src/comportamentales/Observadores.js` | Bitácora, contador de alertas y aviso en consola se enteran de cada análisis sin acoplarse. |

## Arquitectura general

```mermaid
classDiagram
direction LR
class Cliente["cli.js / interfaz web"]
class SimuladorFinanciero {
  <<Facade>>
  +simular(datos, opciones) Object
}
class EscenarioBuilder { <<Builder>> }
class ServicioAnalisis {
  <<interface>>
  +analizar(escenario) ResultadoAnalisis
}
class CalculadoraMargen
class AdaptadorMotorV1 { <<Adapter>> }
class EstrategiaCuota { <<Strategy>> }
class ReglaAlerta { <<Chain of Responsibility>> }
class PublicadorAnalisis { <<Observer>> }
class ExportadorInforme { <<Factory Method>> }
class DecoradorInforme { <<Decorator>> }
class ConfiguracionReglas { <<Singleton>> }
Cliente --> SimuladorFinanciero
SimuladorFinanciero --> EscenarioBuilder
SimuladorFinanciero --> ServicioAnalisis
SimuladorFinanciero --> PublicadorAnalisis
SimuladorFinanciero --> ExportadorInforme
ServicioAnalisis <|.. CalculadoraMargen
ServicioAnalisis <|.. AdaptadorMotorV1
CalculadoraMargen --> EstrategiaCuota
CalculadoraMargen --> ReglaAlerta
CalculadoraMargen ..> ConfiguracionReglas
ExportadorInforme ..> DecoradorInforme
```

## Diagramas de clases por patrón

### Singleton (creacional)

Una sola fuente para la versión de reglas, el umbral del 10 %, los mensajes y el aviso educativo.

Código: `src/creacionales/ConfiguracionReglas.js` · Diagrama: [`docs/uml/01_singleton.svg`](docs/uml/01_singleton.svg)

```mermaid
classDiagram
class ConfiguracionReglas {
  <<Singleton>>
  -instancia$ ConfiguracionReglas
  +versionReglas: String
  +umbralMargenEstrecho: Number
  +aviso: String
  +mensajes: Map
  -ConfiguracionReglas(token)
  +obtenerInstancia()$ ConfiguracionReglas
  +mensaje(codigo) String
}
class CalculadoraMargen
class InformeTextoBase
ConfiguracionReglas --> ConfiguracionReglas : instancia única
CalculadoraMargen ..> ConfiguracionReglas : obtenerInstancia()
InformeTextoBase ..> ConfiguracionReglas : obtenerInstancia()
```

### Builder (creacional)

Arma paso a paso un escenario con varios movimientos y la obligación nueva, y lo valida al final.

Código: `src/creacionales/EscenarioBuilder.js` · Diagrama: [`docs/uml/02_builder.svg`](docs/uml/02_builder.svg)

```mermaid
classDiagram
class EscenarioBuilder {
  <<Builder>>
  -id: String
  -descripcion: String
  -movimientos: Movimiento[]
  -obligacion: ObligacionNueva
  +reiniciar() EscenarioBuilder
  +conId(id) EscenarioBuilder
  +conIngreso(valor) EscenarioBuilder
  +conGasto(valor) EscenarioBuilder
  +conAhorro(valor) EscenarioBuilder
  +conObligacionActual(valor) EscenarioBuilder
  +conObligacionNueva(datos) EscenarioBuilder
  +build() Escenario
  +desdeObjeto(json)$ Escenario
}
class Escenario {
  <<Producto>>
  +id: String
  +movimientos: Movimiento[]
  +obligacionNueva: ObligacionNueva
  +totales() Object
}
class Movimiento {
  +tipo: String
  +valor: Integer
}
class ObligacionNueva {
  +valor: Integer
  +plazoMeses: Integer
  +cuota: Integer
  +tasaMensual: Number
}
class SimuladorFinanciero { <<Director>> }
SimuladorFinanciero ..> EscenarioBuilder : usa
EscenarioBuilder ..> Escenario : crea
Escenario "1" *-- "0..*" Movimiento
Escenario "1" *-- "1" ObligacionNueva
```

### Factory Method (creacional)

Cada exportador (texto, JSON) decide qué formateador crear; un formato nuevo es una subclase nueva.

Código: `src/creacionales/ExportadorInforme.js` · Diagrama: [`docs/uml/03_factory_method.svg`](docs/uml/03_factory_method.svg)

```mermaid
classDiagram
class ExportadorInforme {
  <<abstract>>
  +crearFormateador()* Formateador
  +exportar(resultado) String
}
class ExportadorTexto {
  +crearFormateador() Formateador
}
class ExportadorJson {
  +crearFormateador() Formateador
}
class Formateador {
  <<interface>>
  +formatear(resultado) String
}
class FormateadorJson {
  +formatear(resultado) String
}
class InformeTextoDecorado["ConAvisoEducativo (cadena de decoradores)"] {
  +formatear(resultado) String
}
ExportadorInforme <|-- ExportadorTexto
ExportadorInforme <|-- ExportadorJson
Formateador <|.. FormateadorJson
Formateador <|.. InformeTextoDecorado
ExportadorTexto ..> InformeTextoDecorado : crea
ExportadorJson ..> FormateadorJson : crea
ExportadorInforme ..> Formateador : usa
```

### Adapter (estructural)

Reutiliza el motor v1.0.0 legado detrás de la interfaz nueva `analizar(Escenario)`.

Código: `src/estructurales/AdaptadorMotorV1.js` · Diagrama: [`docs/uml/04_adapter.svg`](docs/uml/04_adapter.svg)

```mermaid
classDiagram
class ServicioAnalisis {
  <<interface>>
  +analizar(escenario) ResultadoAnalisis
}
class AdaptadorMotorV1 {
  <<Adapter>>
  -adaptado: motor_v1
  +analizar(escenario) ResultadoAnalisis
}
class motor_v1 {
  <<Adaptee - código legado>>
  +analizarEscenario(entradaPlana) Object
}
class CalculadoraMargen {
  +analizar(escenario) ResultadoAnalisis
}
class SimuladorFinanciero { <<Cliente>> }
SimuladorFinanciero --> ServicioAnalisis
ServicioAnalisis <|.. AdaptadorMotorV1
ServicioAnalisis <|.. CalculadoraMargen
AdaptadorMotorV1 --> motor_v1 : traduce y delega
```

### Facade (estructural)

Una sola operación `simular()` oculta construcción, cálculo, alertas, notificación y exportación.

Código: `src/estructurales/SimuladorFinanciero.js` · Diagrama: [`docs/uml/05_facade.svg`](docs/uml/05_facade.svg)

```mermaid
classDiagram
class Cliente["cli.js / interfaz web"]
class SimuladorFinanciero {
  <<Facade>>
  -servicio: ServicioAnalisis
  -publicador: PublicadorAnalisis
  +suscribir(observador) SimuladorFinanciero
  +simular(datos, opciones) Object
}
class EscenarioBuilder
class ServicioAnalisis { <<interface>> }
class PublicadorAnalisis
class ExportadorInforme
Cliente --> SimuladorFinanciero : una sola llamada
SimuladorFinanciero ..> EscenarioBuilder : 1. construye
SimuladorFinanciero --> ServicioAnalisis : 2. analiza
SimuladorFinanciero --> PublicadorAnalisis : 3. notifica
SimuladorFinanciero ..> ExportadorInforme : 4. exporta
```

### Decorator (estructural)

Agrega encabezado, nota de datos sintéticos y aviso educativo al informe sin subclases por combinación.

Código: `src/estructurales/DecoradoresInforme.js` · Diagrama: [`docs/uml/06_decorator.svg`](docs/uml/06_decorator.svg)

```mermaid
classDiagram
class Formateador {
  <<interface>>
  +formatear(resultado) String
}
class InformeTextoBase {
  <<Componente concreto>>
  +formatear(resultado) String
}
class DecoradorInforme {
  <<abstract>>
  #componente: Formateador
  +formatear(resultado) String
}
class ConEncabezado {
  +formatear(resultado) String
}
class ConNotaDatosSinteticos {
  +formatear(resultado) String
}
class ConAvisoEducativo {
  +formatear(resultado) String
}
Formateador <|.. InformeTextoBase
Formateador <|.. DecoradorInforme
DecoradorInforme o--> Formateador : envuelve
DecoradorInforme <|-- ConEncabezado
DecoradorInforme <|-- ConNotaDatosSinteticos
DecoradorInforme <|-- ConAvisoEducativo
```

### Strategy (comportamental)

Cuota ingresada, sin interés o sistema francés, intercambiables en tiempo de ejecución.

Código: `src/comportamentales/EstrategiasCuota.js` · Diagrama: [`docs/uml/07_strategy.svg`](docs/uml/07_strategy.svg)

```mermaid
classDiagram
class CalculadoraMargen {
  <<Contexto>>
  -estrategiaCuota: EstrategiaCuota
  +establecerEstrategiaCuota(estrategia)
  +analizar(escenario) ResultadoAnalisis
}
class EstrategiaCuota {
  <<interface>>
  +nombre() String
  +calcular(obligacion) Integer
}
class CuotaIngresada {
  +calcular(obligacion) Integer
}
class CuotaSinInteres {
  +calcular(obligacion) Integer
}
class CuotaFrancesa {
  +calcular(obligacion) Integer
}
CalculadoraMargen o--> EstrategiaCuota
EstrategiaCuota <|.. CuotaIngresada
EstrategiaCuota <|.. CuotaSinInteres
EstrategiaCuota <|.. CuotaFrancesa
```

### Chain of Responsibility (comportamental)

Las 5 alertas educativas se evalúan como eslabones; las excluyentes cortan la cadena.

Código: `src/comportamentales/ReglasAlerta.js` · Diagrama: [`docs/uml/08_chain.svg`](docs/uml/08_chain.svg)

```mermaid
classDiagram
class CalculadoraMargen { <<Cliente>> }
class ReglaAlerta {
  <<abstract>>
  -siguiente: ReglaAlerta
  +enlazar(regla) ReglaAlerta
  +evaluar(contexto, alertas) String[]
  +aplicar(contexto, alertas)* Boolean
}
class ReglaSinIngresos
class ReglaDeficitActual
class ReglaDeficitSimulado
class ReglaMargenEstrecho
class ReglaMargenPositivo
CalculadoraMargen --> ReglaAlerta : primer eslabón
ReglaAlerta --> ReglaAlerta : siguiente
ReglaAlerta <|-- ReglaSinIngresos
ReglaAlerta <|-- ReglaDeficitActual
ReglaAlerta <|-- ReglaDeficitSimulado
ReglaAlerta <|-- ReglaMargenEstrecho
ReglaAlerta <|-- ReglaMargenPositivo
```

### Observer (comportamental)

Bitácora, contador de alertas y aviso en consola se enteran de cada análisis sin acoplarse.

Código: `src/comportamentales/Observadores.js` · Diagrama: [`docs/uml/09_observer.svg`](docs/uml/09_observer.svg)

```mermaid
classDiagram
class PublicadorAnalisis {
  <<Sujeto>>
  -observadores: Set
  +suscribir(observador)
  +desuscribir(observador)
  +notificar(resultado)
}
class ObservadorAnalisis {
  <<interface>>
  +actualizar(resultado)
}
class BitacoraAnalisis {
  +registros: Object[]
  +actualizar(resultado)
}
class ContadorAlertas {
  +conteo: Map
  +actualizar(resultado)
}
class AvisoDeficitConsola {
  +actualizar(resultado)
}
class SimuladorFinanciero
SimuladorFinanciero --> PublicadorAnalisis : notificar()
PublicadorAnalisis o--> "0..*" ObservadorAnalisis
ObservadorAnalisis <|.. BitacoraAnalisis
ObservadorAnalisis <|.. ContadorAlertas
ObservadorAnalisis <|.. AvisoDeficitConsola
```

## Estructura

```
src/
  dominio/           Movimiento, ObligacionNueva, Escenario, ResultadoAnalisis, ErrorValidacion
  creacionales/      Singleton, Builder, Factory Method
  estructurales/     Adapter, Facade, Decorator
  comportamentales/  Strategy, Chain of Responsibility, Observer, CalculadoraMargen
  legado/motor_v1.js motor v1.0.0 original (sin cambios)
  cli.js             demostración por consola
test/                regresión y pruebas por patrón (node:test)
datos/               10 escenarios semilla sintéticos
docs/uml/            diagramas de clases (Mermaid .mmd y .svg)
```

Datos 100 % sintéticos. El repositorio no contiene datos personales ni credenciales.

# Agent Factory

Agent Factory convierte una descripcion en lenguaje natural en un proyecto
BX Agents compilable. El flujo actual integra Analyst, AgentSpec, Generator,
Validator, Shell y Evaluator.

## Requisitos

- Java 21 o posterior.
- BoxLang CLI 1.18.0+66.
- `bx-ai` 3.5.0+19.
- `bx-agents` 1.0.0-snapshot.
- Variable `GEMINI_API_KEY` configurada en la terminal para los flujos que
  consultan Gemini.

La configuracion detallada de Windows esta en [SETUP.md](SETUP.md).

## Flujo principal

```text
Descripcion del usuario
        |
        v
Analyst -> JSON AgentSpec
        |
        v
AgentSpec -> contrato validado
        |
        v
Generator -> proyecto BX Agents
        |
        v
Validator/Shell -> doctor y build
        |
        +--> reparacion controlada opcional
        |
        +--> Evaluator opcional: 3 pruebas + juez Gemini
```

## Uso rapido

Desde la raiz del repositorio:

```powershell
boxlang factory.bxs --help
```

Probar la interpretacion de argumentos sin usar Gemini ni crear archivos:

```powershell
boxlang factory.bxs --description="Crea un agente que explique SQL" --name=SQLTutorRevision --preview
```

Generar y compilar un agente:

```powershell
boxlang factory.bxs --description="Crea un agente que explique SQL" --name=SQLTutorRevision
```

Evaluarlo despues del build:

```powershell
boxlang factory.bxs --description="Crea un agente que explique SQL" --name=SQLTutorEvaluado --evaluate
```

La evaluacion ejecuta tres invocaciones reales y utiliza Gemini como juez.
Puede consumir cuota adicional de la API.

## Probar Un Agente Generado

Cada proyecto se crea en `output/<NombreAgente>/`. El generador no sobrescribe
una carpeta existente.

```powershell
cd .\output\SQLTutorRevision
boxlang module:bxagents doctor
boxlang module:bxagents build
boxlang module:bxagents invoke --message="Hola" --json
```

Tambien se puede inspeccionar la configuracion:

```powershell
boxlang module:bxagents inspect --json
```

## Capacidades

`AgentSpec` mantiene ocho campos de nivel raiz:

```text
name, description, instructions, provider, model, tools, skills, subagents
```

La version actual permite:

- `text_metrics`: cuenta caracteres y palabras.
- `arithmetic`: suma dos numeros.
- `skills`: genera archivos `skills/<name>/SKILL.md`.
- `subagents`: genera agentes delegados en `subagents/<name>/`.

Las herramientas pertenecen a un catalogo cerrado. No se acepta codigo `.bx`
libre generado por Gemini. Cada lista admite como maximo tres elementos y las
tools soportadas son solamente `text_metrics` y `arithmetic`.

Ejemplo completo:

```powershell
boxlang test-capabilities.bxs
```

Tambien puedes usar la especificacion de referencia:

`examples/capabilities-demo.json`

## Reparacion De Builds

La reparacion esta desactivada para codigo generado por IA salvo que se pida
explicitamente.

```powershell
boxlang factory.bxs --description="Crea un tutor de redes" --name=RedesTutor --ai-repair
```

Caracteristicas:

- Maximo tres builds por agente.
- Nunca modifica el proyecto fallido.
- Crea copias `_Repair2` y `_Repair3`.
- Restaura primero desde plantillas confiables.
- Solo con `--ai-repair` puede solicitar a Gemini una correccion limitada de
  `Agent.bx`.
- Registra la estrategia en `repair-diagnostics.json`.

Pruebas disponibles:

```powershell
boxlang test-repair.bxs
boxlang test-repair-ai.bxs
```

`test-repair-ai.bxs` realiza llamadas reales a Gemini y puede consumir cuota.

## Pruebas

Las pruebas `.bxs` permanecen en la raiz porque sus rutas y comandos parten
del directorio del repositorio:

```powershell
boxlang test-agent-spec.bxs
boxlang test-agent-spec-generator.bxs
boxlang test-analyst.bxs
boxlang test-analyst-generator.bxs
boxlang test-capabilities.bxs
boxlang test-generator.bxs
boxlang test-shell.bxs
boxlang test-validator.bxs
boxlang test-evaluator.bxs
boxlang test-repair.bxs
```

Las pruebas `test-analyst.bxs`, `test-analyst-generator.bxs`,
`test-repair-ai.bxs` y `factory.bxs` requieren `GEMINI_API_KEY` en la terminal.

## Estructura

```text
agent_factory/
├── factory.bxs
├── lib/
│   ├── AgentSpec.bx
│   ├── Analyst.bx
│   ├── Evaluator.bx
│   ├── Generator.bx
│   ├── Shell.bx
│   └── Validator.bx
├── templates/
│   ├── Agent.bx.tpl
│   ├── instructions.md.tpl
│   ├── README.generated.tpl
│   ├── SKILL.md.tpl
│   └── tools/
├── examples/
├── docs/
├── test-*.bxs
└── output/                 # generada localmente e ignorada por Git
```

La documentacion de cada componente esta disponible en [docs/README.md](docs/README.md).

## Seguridad

- Nunca se escribe `GEMINI_API_KEY` en los agentes generados.
- `.env`, `output/`, `.build/`, `boxlang_modules/` y `.vscode/` estan ignorados.
- No se deben subir claves, tokens ni archivos de entorno.
- Las tools se generan unicamente desde plantillas revisadas.
- Las skills, instrucciones y respuestas de Gemini deben tratarse como texto no
  confiable.

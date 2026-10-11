# Agent Factory v1.6 — Generacion real de tools, skills y subagentes

## Compatibilidad

Reemplazar **solo** `lib/AgentSpec.bx`, `lib/Analyst.bx`, `lib/Generator.bx`. Agregar `templates/tools/*.bx.tpl`, `templates/SKILL.md.tpl`, `examples/capabilities-demo.json`, `test-capabilities.bxs`. **Conservar** los demas templates, `factory.bxs`, `Validator.bx`, `Shell.bx` y `Evaluator.bx` locales.

BoxLang 1.18.0+66, bx-ai 3.5.0+19 y BX Agents 1.0.0-snapshot son versiones observadas en el equipo. Esta revision no fue ejecutada en el equipo Windows: probar primero.

## Contrato extendido (mismas ocho claves)

- `tools`: array de cadenas de un catalogo **cerrado**, maximo tres. Soportadas: `text_metrics` (genera `tools/TextMetrics.bx` con `countCharacters`/`countWords`) y `arithmetic` (genera `tools/Arithmetic.bx` con `addNumbers`). No se permite que Gemini genere codigo ejecutable libre.
- `skills`: array de 0-3 objetos `{name, description, instructions}`, crea `skills/<name>/SKILL.md` siguiendo frontmatter YAML.
- `subagents`: array de 0-3 objetos `{name, description, instructions}`, crea `subagents/<name>/Agent.bx` y `instructions.md`; el `Agent.bx` raiz incluye `configure()` con `subAgents: [...]` (nombres de carpetas). Los nombres de subagentes deben ser unicos y distintos del nombre del agente raiz. No se permiten referencias entre subagentes en v1.6.
- Los nombres de skills/subagentes son slugs en minusculas `[a-z][a-z0-9-]{0,49}`.
- `provider` y `model` se mantienen `openai-compatible` / `gemini-3.5-flash-lite`.
- `AgentSpec.validate`, `Analyst.analyze`, `Generator.generate`, `Generator.repair` mantienen sus firmas.

## Prueba en PowerShell (raiz del repositorio)

```powershell
boxlang test-agent-spec.bxs
boxlang test-capabilities.bxs
```

El segundo genera un proyecto nuevo `output/CapabilityDemo_<id>` y prueba el build. Muestra su ruta final para inspeccion. **No borra proyectos previos.** No deberia consumir Gemini para crear o compilar el ejemplo; la invocacion real posterior si consume cuota.

Desde la ruta impresa al finalizar, ejecutar:

```powershell
cd .\output\CapabilityDemo_<id>
boxlang module:bxagents doctor
boxlang module:bxagents build
boxlang module:bxagents invoke --message="Cuenta exactamente los caracteres de Hola mundo usando la herramienta correspondiente" --json
```

`invoke` demuestra la respuesta del agente, pero no certifica por si solo que una tool fue invocada. Para esa verificacion habra que inspeccionar el registro de ejecucion o instrumentar la tool, y comprobar que BX Agents la haya registrado al arranque.

**Regresion:** `boxlang test-repair.bxs` y `boxlang test-repair-ai.bxs` deben seguir funcionando con un spec de arrays vacios. Si aparece incompatibilidad, detener integracion y corregir antes de realizar un merge.

## Comando por lenguaje natural

En una prueba nueva (nombre no usado):

```powershell
boxlang factory.bxs --description="Crea un agente para revisar textos. Incluye una herramienta para contar caracteres y palabras, una skill metodologica de revision textual y un subagente especialista en coherencia." --name=TextoFactoryV16 --evaluate
```

`Analyst` tiene instrucciones para generar listas no vacias **solo** cuando hagan falta. La salida depende de Gemini; `AgentSpec` rechazara tipos o herramientas fuera del catalogo.

## Limites de seguridad

Nunca aceptar codigo `.bx` escrito libremente por el modelo como una tool. Las skills y prompts son texto de usuario/IA que deben tratarse como contenido no confiable. No se concede acceso al shell, red, archivos locales ni base de datos a las herramientas incluidas. Cualquier nueva tool necesita plantilla revisada y prueba de seguridad. Las herramientas y subagentes se usan en tiempo de ejecucion solamente si el modelo decide llamarlos; generarlos y compilarlos no garantiza cada llamada.

## Fuentes oficiales

- https://bxagents.ai/conventions/tools/
- https://bxagents.ai/conventions/skills/
- https://bxagents.ai/conventions/subagents/

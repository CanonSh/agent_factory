# Agent Factory — Generator MVP

Esta entrega contiene únicamente la parte asignada al generador; no reemplaza `AgentSpec.bx`, `Analyst.bx`, `Validator.bx`, `Evaluator.bx`, `Shell.bx` ni `factory.bxs`.

## Cómo instalarla
1. Descomprime en la raíz de `agent_factory` conservando la estructura de carpetas. Si tus compañeros ya editaron alguno de los archivos, compara antes de sobrescribirlo.
2. Abre PowerShell en la raíz de `agent_factory`.
3. Ejecuta `boxlang test-generator.bxs`.
4. Entra en `output/LogGuardian` y ejecuta `boxlang module:bxagents doctor`, luego `boxlang module:bxagents build` y luego `boxlang module:bxagents invoke --message="Hola" --json`.

## Contrato del método
`new lib.Generator(raizDelRepositorio).generate(spec)` recibe `spec` como struct con `name`, `description`, `instructions`, `provider`, `model`, `tools`, `skills`, `subagents`; devuelve la ruta absoluta del proyecto generado.

## Limitaciones
- `tools`, `skills` y `subagents` deben ser arreglos vacíos. Si reciben elementos se devuelve un error descriptivo.
- Solo se soporta `provider: openai-compatible` en este MVP.
- No sobrescribe el directorio de salida si ya existe; para repetir con el mismo nombre usa otro nombre o elimina manualmente SOLO el proyecto generado.
- La clave Gemini NO se escribe en el proyecto, se toma de la variable de entorno en tiempo de ejecución.
- No se comprobó el código contra el runtime BoxLang 1.18 en esta sesión. Compílalo en tu máquina y comparte cualquier error literal para ajustar la implementación.

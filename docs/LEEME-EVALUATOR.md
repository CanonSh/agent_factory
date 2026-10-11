# Evaluator.bx v1.0 — Go Further

## Qué hace

Este componente es la fase opcional de evaluación de Agent Factory. Recibe la ruta de un proyecto **ya compilado** y el `struct` de especificación validado. Solicita **tres casos relevantes a Gemini**; acepta esas preguntas solo si cumplen una lista blanca estricta para ejecutar `bxagents invoke --message="..." --json` con `Shell.bx` en Windows. Si las preguntas no cumplen el formato, usa tres preguntas genéricas de respaldo e informa el hecho en el reporte.

Recoge las **respuestas reales** del agente. Envía preguntas y respuestas a un **juez Gemini**, que devuelve una puntuación global (0–100), resultado aprobado/reprobado por prueba, motivo y resumen.

**Contrato:**

```boxlang
report = new lib.Evaluator().evaluate( projectPath, spec );
```

**Retorno:**

```json
{
  "success": true,
  "projectPath": "C:/.../output/SQLTutorCorregido",
  "score": 85,
  "tests": [
    {"input":"...", "response":"...", "passed":true, "reason":"..."},
    {"input":"...", "response":"...", "passed":true, "reason":"..."},
    {"input":"...", "response":"...", "passed":false, "reason":"..."}
  ],
  "report": "Resumen de la evaluacion",
  "errors": []
}
```

Este JSON es **solo un ejemplo de formato**; los resultados y la puntuación deben proceder de ejecuciones reales, no de valores prefijados.

`success = true` significa que **se completó el proceso de evaluación**, no que el agente sea de alta calidad. Si alguna llamada a `invoke` o la evaluación del juez falla, `success = false`, `score = 0` y `errors` explica qué ocurrió; `score = 0` en ese escenario **no debe interpretarse como una calificación de calidad**.

## Instalar

1. Copiar `lib/Evaluator.bx` en `agent_factory/lib/`.
2. Copiar `test-evaluator.bxs` en la raíz.
3. Dejar intactos `AgentSpec.bx`, `Analyst.bx`, `Generator.bx`, `Shell.bx`, `Validator.bx` y `factory.bxs` **v1.2**.
4. Configurar `GEMINI_API_KEY` en la sesión de PowerShell y verificar sin imprimir la clave.

## Probar

Desde la raíz y con `SQLTutorCorregido` ya existente:

```powershell
boxlang test-evaluator.bxs
```

La prueba primero comprueba que se rechaza una ruta inexistente, luego vuelve a validar el build de `SQLTutorCorregido`, solicita tres casos de prueba a Gemini, ejecuta el agente y pide al juez la puntuación. Utiliza varias llamadas a la API y puede tardar.

## Seguridad y límites

- **No** se pasa una entrada libre del usuario a `cmd.exe` directamente. Los mensajes generados se restringen a caracteres ASCII seguros y, de no cumplir, se usan preguntas fijas.
- `Shell.bx` sigue ejecutando mediante `cmd.exe`; a futuro es preferible un método de ProcessBuilder con argumentos separados para permitir mensajes arbitrarios sin problemas de escapado.
- Se registra la evidencia de las respuestas, pero el puntaje del juez de IA es una **evaluación orientativa**, no una prueba objetiva de corrección funcional.
- Este MVP solo evalúa respuestas conversacionales. No mide herramientas, skills ni subagentes, que aún no están implementados.
- **No ejecuta autorreparación** ni elimina proyectos.
- Todavía no modifica `factory.bxs`. Una vez que el script supere las pruebas, integraremos el evaluador después del resultado exitoso de Validator.
- El componente no se ha verificado aún en la instalación BoxLang 1.18 del usuario; la prueba local confirma compatibilidad o identifica fallos para corregir.

# Agent Factory

Generador de proyectos BX Agents a partir de instrucciones en lenguaje natural.

## Crear un agente desde la consola

Configura `GEMINI_API_KEY` en la terminal y ejecuta el Factory desde la raiz:

```bash
export GEMINI_API_KEY="tu_clave"
boxlang factory.bxs
```

En PowerShell:

```powershell
$env:GEMINI_API_KEY = "tu_clave"
boxlang factory.bxs
```

El programa preguntara primero el nombre del agente y luego que debe hacer,
ambos directamente en la consola. El nombre debe empezar con una letra y usar
solo letras, numeros, guion o guion bajo (maximo 50 caracteres).

El Factory analiza la solicitud con Gemini, crea la especificacion y genera el
proyecto bajo `output/<Nombre>/`. No sobrescribe proyectos existentes.

## Probar el agente generado

Usa la ruta mostrada al terminar la generacion:

```powershell
cd output/MathTutor
boxlang module:bxagents doctor
boxlang module:bxagents build
boxlang module:bxagents invoke --message="Hola, ¿en que puedes ayudarme?" --json
```

En este flujo se generan agentes configurados con `openai-compatible` y
`gemini-3.5-flash-lite`. La solicitud personaliza nombre, descripcion e
instrucciones. La generacion automatica de herramientas, skills y subagentes aun
no esta implementada. La clave nunca se guarda en el proyecto generado.

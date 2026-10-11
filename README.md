# Agent Factory

Generador MVP de proyectos BX Agents.

## Prueba rapida

Desde la raiz del repositorio:

```powershell
boxlang test-generator.bxs
```

La salida se crea en `output/LogGuardian`. El generador no sobrescribe una
salida existente. Para validar el flujo completo usa otro nombre en el JSON o
retira solamente la salida de prueba anterior.

Para ejecutar la orquestacion local:

```powershell
boxlang factory.bxs
```

El MVP soporta `openai-compatible` y requiere que `tools`, `skills` y
`subagents` sean arreglos vacios. La clave `GEMINI_API_KEY` solo se consulta
cuando se ejecuta el agente generado; nunca se escribe en el codigo.

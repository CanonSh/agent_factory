# {{NAME}}

{{DESCRIPTION}}

Generado automáticamente por Agent Factory (MVP).

## Modelo
- Proveedor: `openai-compatible`
- Modelo: `{{MODEL}}`

## Requisitos
- BoxLang 1.18+
- `bx-ai` y `bx-agents` instalados
- Variable de entorno `GEMINI_API_KEY` disponible en la terminal

## Comandos (PowerShell, desde esta carpeta)

```powershell
boxlang module:bxagents doctor
boxlang module:bxagents build
boxlang module:bxagents invoke --message="Hola, preséntate en español" --json
```

No subas tu clave API a Git. El archivo `.env.example` es solo una referencia.

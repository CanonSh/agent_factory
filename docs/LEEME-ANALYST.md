# Analyst v1.0 — Integración con Agent Factory

## ¿Qué hace?

`lib/Analyst.bx` convierte una descripción en lenguaje natural en un `struct` de BoxLang con **exactamente los ocho campos de `AgentSpec.bx`**. Usa Gemini con el proveedor `openai-compatible` probado en el proyecto y entrega los datos ya validados por `new lib.AgentSpec().validate(...)`.

La firma acordada es:

```boxlang
spec = new lib.Analyst().analyze( description );
```

- Entrada: `description` (string no vacío).
- Salida: `struct` de AgentSpec válido.
- Errores: lanza excepción con mensaje explicativo.
- No crea carpetas, no compila y no genera agentes: esas tareas siguen en otros módulos.

## Instalación

Copiar `lib/Analyst.bx` a `agent_factory/lib/Analyst.bx` y `test-analyst.bxs` a la raíz de `agent_factory`.

No modificar los archivos de `Generator` ni `AgentSpec` ya probados.

## Configuración

La terminal que ejecuta BoxLang debe tener `GEMINI_API_KEY` en su entorno. El archivo `.env` **no se carga automáticamente**; seguir `SETUP.md`. Nunca guardar la clave en el repositorio.

## Probar

```powershell
cd "C:\Users\argue\Documents\Boxlang\agent_factory"
boxlang test-analyst.bxs
```

Resultado esperado: `[OK] Analyst devolvio un AgentSpec valido`, un nombre generado por el modelo y el objeto de ocho campos. **El nombre exacto y los textos cambiarán entre llamadas**, incluso cuando el prompt sea igual. La prueba consume una llamada a la API.

## Uso en el siguiente paso

```boxlang
spec = new lib.Analyst().analyze( descripcionUsuario );
// AgentSpec ya valida dentro de Analyst. Validar otra vez no hace dano.
spec = new lib.AgentSpec().validate( spec );
ruta = new lib.Generator( rootPath ).generate( spec );
```

**Advertencia:** `Generator.generate()` no sobrescribe una carpeta ya existente. Para probar el flujo completo, utiliza un nombre nuevo o conserva la ruta generada; no borres salidas automáticamente.

## Limitaciones de la v1.0

- `tools`, `skills` y `subagents` permanecen vacíos, porque Generator todavía no implementa esas capacidades.
- El proveedor y el modelo están fijados a los verificados con el equipo (`openai-compatible` y `gemini-3.5-flash-lite`).
- Si la API falla, informa el error. Si produce un JSON inválido, reintenta solo una vez (máximo 2 peticiones).
- Este código se preparó para BoxLang 1.18.0 y bx-ai 3.5.0, pero **debe validarse ejecutando `boxlang test-analyst.bxs` en la computadora del equipo**.

# Validator v1.0 — Agent Factory

## Qué implementa

`lib/Validator.bx` recibe la ruta del proyecto que devolvió `Generator.bx`, verifica que existe el directorio y `Agent.bx`, llama a `Shell.bx` para ejecutar `boxlang module:bxagents build` **dentro de ese directorio** y devuelve el resultado acordado en `CONTRATO_AGENT_FACTORY.md`.

### Interfaz estable

```boxlang
result = new lib.Validator().validate( projectPath );
```

Estructura de respuesta:

```json
{
  "success": true,
  "projectPath": "C:/.../output/JavaCodeHelper",
  "exitCode": 0,
  "output": "Build succeeded: ...",
  "errors": []
}
```

- Un **build fallido** devuelve `success: false`, un `exitCode` distinto de cero y detalles en `errors` (como mínimo un texto de diagnóstico).
- Un **directorio inexistente** o un proyecto sin `Agent.bx` causa una **excepción**: se trata de entradas inválidas, no de errores del compilador.
- Si `Shell.bx` no puede iniciar el proceso, su excepción se propaga; `factory.bxs` deberá capturarla.
- No se ejecuta `invoke`, no se evalúa calidad ni se modifica el proyecto.

## Instalación

Copia `lib/Validator.bx` a `agent_factory/lib/` y `test-validator.bxs` a la raíz. No reemplaces `Shell.bx`, `AgentSpec.bx`, `Analyst.bx` ni `Generator.bx`.

## Pruebas

Desde PowerShell, en la raíz del proyecto:

```powershell
boxlang test-validator.bxs
```

Requisitos: Windows, `boxlang` invocable desde `cmd.exe`, `Shell.bx` v1.0 funcionando, y al menos un proyecto ya generado en `output/`: `JavaCodeHelper`, `LogGuardianIntegracion` o `LogGuardian`.

El script comprueba:

1. `Validator` ejecuta un build válido y reconoce `exitCode=0`.
2. Rechaza un proyecto que no existe.
3. Crea una carpeta **temporal y única** dentro de `output/`, escribe código BoxLang deliberadamente inválido y verifica que el build falla. Después intenta eliminar **solamente** esa carpeta temporal. Los proyectos reales no se editan.

Salida esperada (el texto exacto puede variar):

```text
=== TEST VALIDATOR v1.0 ===
[INFO] Compilando: .../output/JavaCodeHelper
[OK] Build exitoso, exitCode=0, errors=[].
[OK] Rechaza un proyecto inexistente: ...
[INFO] Compilando fixture invalido: ...
[OK] Build invalido detectado, exitCode=..., errores capturados.
=== RESUMEN: 3 pruebas correctas ===
```

**Todavía no probado en tu instalación**. Si el caso 3 falla, conserva la salida real; podría indicar que `bxagents build` no detecta esa clase de error o que hay un ajuste pendiente del `Shell`/`Validator`.

## Siguiente integración

Cuando la prueba pase:

```boxlang
spec = new lib.Analyst().analyze( description );
spec = new lib.AgentSpec().validate( spec );
projectPath = new lib.Generator( root ).generate( spec );
buildResult = new lib.Validator().validate( projectPath );

if ( buildResult.success ) {
    println( "[OK] Agente construido: " & projectPath );
} else {
    println( "[ERROR] Build fallido: " & buildResult.output );
}
```

El script anterior ilustra la integración; `factory.bxs` todavía debe implementarse y capturar excepciones. **No implementar aún el bucle de tres intentos**: el `Generator` actual rechaza sobrescrituras y carece de método de reparación.

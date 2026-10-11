# Agent Factory — Shell.bx v1.0 (Windows)

## Qué hace

Ejecuta procesos externos desde BoxLang para que `Validator.bx` construya agentes con BX Agents y `Evaluator.bx` los invoque.

**Contrato**: `new lib.Shell().run(command, workingDir)` devuelve siempre un struct en ejecución normal con `success` (boolean), `exitCode` (numérico), `stdout`, `stderr` y `output` (strings). Lanza una excepción si falta el directorio o no puede iniciar el proceso.

- Ejecuta desde `workingDir`, no cambia el directorio del proceso padre.
- Usa Java `ProcessBuilder` con `cmd.exe` y guarda stdout/stderr en archivos temporales para evitar bloqueos por buffers llenos.
- Tiempo límite inicial: 120 segundos. Si expira, `success=false`, `exitCode=-1` y un mensaje de timeout en `stderr`.
- **Seguridad**: los comandos deben construirse dentro de Agent Factory. **Nunca interpolar una descripción del usuario ni texto arbitrario en `command`**. Para `Evaluator.invoke`, habrá que diseñar la codificación y paso de argumentos de forma segura antes de aceptar mensajes variables.

## Instalación

Copiar `lib/Shell.bx` y `test-shell.bxs` a la raíz correspondiente de `agent_factory` (conservar `lib/` dentro de esa raíz).

```powershell
cd "C:\Users\argue\Documents\Boxlang\agent_factory"
boxlang test-shell.bxs
```

Salida esperada:

```
=== TEST SHELL v1.0 ===
[OK] Ejecuta comando correcto, lee stdout y exitCode=0.
[OK] Detecta error y exitCode=7.
[OK] Rechaza directorio inexistente: Shell: no existe el directorio de trabajo: ...
=== RESUMEN: 3 pruebas correctas ===
```

## Cómo lo usará Validator

```boxlang
var shell = new lib.Shell();
var result = shell.run( "boxlang module:bxagents build", projectPath );
if ( result.success ) {
    println( "Build OK" );
} else {
    println( "Build fallo: " & result.output );
}
```

**Estado:** implementación propuesta, todavía no ejecutada en la instalación BoxLang 1.18.0+66 del usuario. Verificar antes de integrar.

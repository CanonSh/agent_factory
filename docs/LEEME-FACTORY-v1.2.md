# Agent Factory v1.2 — Corrección de argumentos de la CLI

## Por qué se corrige

En una ejecución de `factory.bxs`, la fábrica generó y compiló `SQLTutorDemo`, pero el propósito informado por Gemini fue «asistir y gestionar operaciones relacionadas con factory.bxs», no explicar consultas SQL. La versión anterior usaba directamente `CLIGetArgs().positionals[1]` como solicitud. La versión 1.2 prioriza el argumento explícito `--description` y evita interpretar `factory.bxs` como la descripción.

## Archivos

- `factory.bxs`: reemplaza **solo** este archivo en la raíz de `agent_factory` (conserva una copia del archivo anterior).
- Los archivos `lib/*.bx` **no cambian**.

## Prueba sin IA (primero)

Desde la raíz del repositorio en PowerShell:

```powershell
boxlang factory.bxs --help
boxlang factory.bxs --description="Crea un agente especializado en explicar consultas SQL y corregir errores de sintaxis" --name=SQLTutorCorregido --preview
```

Debe mostrar exactamente la descripción indicada, el nombre `SQLTutorCorregido` y un mensaje de vista previa. **No invoca Gemini ni escribe en `output/`.**

Opcionalmente, para comprobar el modo posicional que falló en la versión anterior:

```powershell
boxlang factory.bxs "Crea un agente especializado en explicar consultas SQL y corregir errores de sintaxis" --name=SQLTutorCorregido --preview
```

Si ambos muestran la descripción correcta, puedes ejecutar la fábrica real:

```powershell
boxlang factory.bxs --description="Crea un agente especializado en explicar consultas SQL y corregir errores de sintaxis" --name=SQLTutorCorregido
```

No uses el nombre `SQLTutorDemo` porque ese proyecto ya existe y el Generator evita sobrescribirlo. No hace falta borrar el anterior.

## Qué verificar

- La línea `[INFO] Descripcion recibida:` coincide con tu solicitud.
- La línea `[OK] Proposito:` habla de SQL y no de `factory.bxs`.
- Se crea `output/SQLTutorCorregido`.
- Validator informa `Build correcto (exitCode=0)`.

Luego puedes ejecutar:

```powershell
cd .\output\SQLTutorCorregido
boxlang module:bxagents invoke --message="Explica la diferencia entre WHERE y HAVING en SQL" --json
```

La respuesta de Gemini debe ser relevante; compilar por sí solo no garantiza la calidad semántica.

## Limitaciones

- Es una corrección preparada para BoxLang 1.18, pero no ejecutada en tu computadora. Verificar `--preview` primero.
- `Evaluator` y la autorreparación no están incorporados.
- `--preview` solo verifica la interpretación de la descripción y el nombre; no valida el futuro `AgentSpec` ni el build.

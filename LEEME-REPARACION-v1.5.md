# Agent Factory v1.5 — Reparación asistida por Gemini (opt-in)

## Objetivo

Mantener la v1.4 funcionando y añadir una alternativa cuando un agente **coincide con las plantillas pero no compila**: consultar Gemini usando `Agent.bx` y los diagnósticos reales del `Validator`, generar otra versión del proyecto y validar el nuevo build.

**Estado:** archivos preparados y revisados de forma estática. Requieren pruebas en BoxLang 1.18.0+66 del equipo. **No se afirma que la reparación IA funcione hasta ejecutar `test-repair-ai.bxs`.**

## Archivos

- `lib/Generator.bx`: conserva `generate(spec)` y amplía `repair(spec, errors, previousPath, attempt, allowAI=false)`.
- `factory.bxs`: conserva `--description`, `--name`, `--preview` y `--evaluate`; añade `--ai-repair`.
- `test-repair-ai.bxs`: rompe una copia temporal de la plantilla y prueba recuperación con Gemini.
- `test-repair.bxs`: prueba previa de restauración de plantillas, **no hace falta reemplazarla**.

## Decisiones de seguridad

1. Nunca se modifica el proyecto fallido. Cada reparación crea `output/<nombre>_Repair2` o `_Repair3`.
2. Máximo **tres compilaciones** en total. No se repiten builds sin cambio verificable.
3. Sin `--ai-repair` no se solicita a Gemini que genere código. La restauración de plantillas continúa siendo la opción por defecto.
4. Si cambió un archivo respecto de la plantilla original, el intento 2 lo regenera desde plantillas confiables (`restore_trusted_templates`). Esto preserva la v1.4.
5. Si el archivo corresponde a las plantillas pero falla el build y se autorizó `--ai-repair`, Gemini propone **solo el contenido de `Agent.bx`** (`gemini_agent_source`). El programa comprueba límites de tamaño, invariantes y operaciones prohibidas antes de escribirlo.
6. Una segunda propuesta IA está permitida en el intento 3 **solo si el intento 2 fue una propuesta IA que no compiló**.
7. `repair-diagnostics.json` documenta estrategia, errores, intento y ruta anterior.
8. Los filtros de texto **no constituyen un sandbox ni garantizan seguridad**. Usar en entorno de desarrollo aislado para código generado por IA; revisar cambios antes de ejecutarlos fuera del fixture. No proporcionar logs con secretos.
9. El diseño v1.5 no intenta corregir tools, skills, subagentes, ni plantillas del repositorio. Tampoco modifica otros archivos.

## Instalación

Desde la raíz `C:\Users\argue\Documents\Boxlang\agent_factory`:

1. Respalda `lib/Generator.bx` y `factory.bxs` que ya funcionan.
2. Copia los dos archivos nuevos desde el ZIP conservando la estructura.
3. Coloca `test-repair-ai.bxs` en la raíz del repositorio.
4. No reemplaces `lib/AgentSpec.bx`, `lib/Analyst.bx`, `lib/Shell.bx`, `lib/Validator.bx` ni `lib/Evaluator.bx`.
5. Mantén `GEMINI_API_KEY` cargada en la sesión PowerShell, sin mostrarla en consola.

## Comprobaciones en orden

Primero comprueba que los comandos habituales se mantienen:

```powershell
boxlang factory.bxs --help
boxlang test-repair.bxs
boxlang factory.bxs --description="Agente que explica SQL a principiantes" --name=SQLTutorVistaV15 --evaluate --ai-repair --preview
```

El flag `--preview` solo enseña la descripción y no llama a Gemini ni crea proyectos.

Para probar la reparación real de un proyecto temporal sin alterar otros proyectos:

```powershell
boxlang test-repair-ai.bxs
```

El script crea `output/RepairAIFixture_<UUID>/` con sus propias plantillas, introduce un error de sintaxis en la copia, verifica el primer build fallido, comprueba que no puede invocar IA sin autorización, solicita una corrección y compila el proyecto reparado. Si la primera propuesta no compila, puede realizar un tercer build. El script elimina **solo su carpeta temporal** al finalizar, incluso si falla, salvo que Windows bloquee su eliminación.

**Nota:** esta prueba realiza llamadas reales a Gemini y puede utilizar parte de la cuota de API. Gemini no tiene garantía de corregir el código en todos los casos; si la validación interna rechaza la propuesta, el sistema muestra el error y deja de reparar.

Si funciona, puedes comprobar la generación habitual con un nombre nuevo:

```powershell
boxlang factory.bxs --description="Crea un tutor de redes que explique direcciones IP y subredes" --name=RedesTutorV15 --evaluate --ai-repair
```

## Dudas frecuentes

**¿Por qué `--ai-repair` es opcional?** Porque reemplazar código fuente con texto generado por un modelo es diferente de restaurarlo desde plantillas ya probadas. Debe requerir una elección expresa.

**¿Cómo sabemos qué estrategia se usó?** Leer `repair-diagnostics.json` de la carpeta `_Repair2` o `_Repair3`. `factory.bxs` también imprime el campo `strategy`.

**¿Por qué un agente puede compilar pero luego responder mal?** `build` solo confirma compilación; `Evaluator` mide comportamiento aproximado mediante pruebas adicionales. La reparación no garantiza calidad, solo busca resolver el fallo de compilación.

**¿Por qué no se repara cualquier archivo?** El contrato del MVP restringe las capacidades y `Generator` conoce de forma segura únicamente sus archivos generados. Permitir cambios arbitrarios excede el alcance actual.

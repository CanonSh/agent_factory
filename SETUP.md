# Agent Factory — Guía de instalación y configuración (Windows)

> **Versión de referencia del equipo:** 11 de octubre de 2026  
> **Objetivo:** que los tres desarrolladores ejecuten Agent Factory con un entorno reproducible, sin subir credenciales ni modificar accidentalmente el trabajo de otros.  
> **Alcance:** PowerShell en Windows 10/11, BoxLang CLI y el MVP de `Generator.bx`.

## 1. Antes de comenzar

Agent Factory es un **proyecto BoxLang normal**. Los proyectos que produce dentro de `output/<NombreAgente>/` son **proyectos BX Agents**. No son lo mismo:

- **BoxLang:** lenguaje/runtime que ejecuta `.bx` y `.bxs`.
- **bx-ai:** módulo que conecta BoxLang con modelos como Gemini.
- **BX Agents (`bx-agents`):** módulo que valida, construye y ejecuta un agente.
- **Agent Factory:** nuestro repositorio; coordina `AgentSpec`, `Analyst`, `Generator`, `Validator` y `Evaluator` mediante `factory.bxs`.

### Versiones de referencia verificadas

| Componente | Versión probada en el equipo | ¿Obligatorio? |
|---|---|---|
| Java (JRE/JDK) | **21 o posterior**, requisito del runtime | Sí |
| BoxLang CLI | **1.18.0+66** | Sí |
| bx-ai | **3.5.0+19** | Sí para IA e invocación |
| BX Agents | **1.0.0-snapshot** | Sí para `doctor`, `build` e `invoke` |
| Google Gemini | **`gemini-3.5-flash-lite`** | Sí para la prueba en línea |
| CommandBox | **6.3.5+00887** | Opcional para este flujo CLI |
| Git | Versión reciente | Sí para trabajar en equipo |

**Política del equipo:** no actualizar BoxLang ni los módulos a `latest` o a otro `snapshot` durante la integración sin que los tres aprueben y repitan las pruebas. `1.0.0-snapshot` es una etiqueta de desarrollo: para reproducibilidad estricta haría falta inmovilizar también el artefacto exacto (checksum o binario aprobado por el equipo). La tabla registra lo que **funcionó en una máquina**, no garantiza que todo instalador siga sirviendo exactamente los mismos bytes.

## 2. Verificar si ya tienes el entorno

Abre **PowerShell** y ejecuta:

```powershell
java -version
boxlang --version
install-boxlang --help
install-bx-module --help
```

Si `boxlang --version` muestra `1.18.0+66` y ya están instalados los módulos, **no reinstales nada**. Pasa al apartado 4. Si no se reconoce alguno de los comandos, sigue con el apartado 3.

> La carpeta donde instalaste BoxLang puede variar. En el entorno usado para validar este proyecto, el directorio de módulos globales estuvo bajo `C:\boxlang\home\modules`. No copies rutas de otra computadora: usa las rutas reales de tu instalación.

## 3. Instalación inicial

### 3.1. Java 21+

Comprueba `java -version`. Si no está instalado o la versión es inferior a 21, instala una distribución JRE/JDK 21 (por ejemplo, [Eclipse Temurin](https://adoptium.net/temurin/releases/)) y vuelve a abrir PowerShell. BoxLang también dispone de instaladores que pueden preparar Java cuando es necesario.

### 3.2. BoxLang en Windows

Consulta primero la [guía oficial de instalación](https://boxlang.ortusbooks.com/getting-started/installation) y el [instalador oficial para Windows](https://github.com/ortus-boxlang/boxlang-quick-installer). El instalador rápido publicado por el proyecto es:

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/ortus-boxlang/boxlang-quick-installer/main/src/install-boxlang.ps1'))
```

**Seguridad:** el comando anterior descarga y ejecuta un script remoto. Revisa su procedencia/contenido antes de ejecutarlo; utiliza una sesión con los permisos que solicite el instalador. No ejecutes scripts copiados de enlaces no oficiales.

Después de la instalación y de abrir una nueva terminal:

```powershell
install-boxlang --help
install-boxlang 1.18.0
boxlang --version
```

El formato de instalación de una versión específica (`install-boxlang <versión>`) está documentado por el instalador oficial. Confirma la versión real con `boxlang --version`; si no coincide con la tabla, no continúes a ciegas: informa al equipo.

### 3.3. Instalar bx-ai y BX Agents

**Método recomendado para este equipo:** módulos globales del runtime CLI, sin `--local`. Ejecuta:

```powershell
install-bx-module "bx-ai@3.5.0+19"
install-bx-module "bx-agents@1.0.0-snapshot"
```

Comprueba lo que quedó instalado:

```powershell
install-bx-module --list
boxlang module:bxagents --help
```

Las versiones anteriores corresponden a las publicadas en ForgeBox y al entorno probado. Si el instalador no resuelve alguna versión o dependencia, **no sustituyas automáticamente por una versión distinta**: consulta el apartado 8.

**Importante:** existe también la instalación local mediante `--local`, que coloca módulos en `boxlang_modules/`. No mezcles instalaciones globales/locales sin acordarlo; BoxLang puede cargar primero los módulos locales y acabar usando una versión inesperada. `boxlang_modules/` está excluida de Git.

### 3.4. Sobre `bxAgents` y CommandBox

En algunas instalaciones `bxAgents` está disponible directamente en el `PATH`, pero **en nuestro Windows no lo estuvo**. Utiliza siempre esta forma, ya comprobada:

```powershell
boxlang module:bxagents --help
```

No necesitas ejecutar `box install` ni tener CommandBox para esta prueba si ya cuentas con `boxlang` e `install-bx-module`. CommandBox (`box`) es útil en otros flujos, pero no debemos confundirlo con el comando `boxlang`.

## 4. Descargar el repositorio y seleccionar la rama de pruebas

Para una computadora donde aún no existe el proyecto:

```powershell
git clone https://github.com/CanonSh/agent_factory.git
cd agent_factory
git fetch origin
git switch --track origin/feature/agent-generator
```

El último comando selecciona la rama que contiene nuestro **Generator MVP**, `test-generator.bxs` y el ejemplo `LogGuardian`. Si ya tienes una copia local y esa rama existe, utiliza:

```powershell
git fetch origin
git switch feature/agent-generator
git pull --ff-only
```

**No cambies de rama si tienes modificaciones locales sin guardar/commitear**; revisa antes `git status`. Los archivos del Generator MVP todavía pueden no existir en `master` hasta fusionar su Pull Request.

La estructura de referencia es:

```text
agent_factory/
├── factory.bxs
├── lib/
│   ├── AgentSpec.bx
│   ├── Analyst.bx
│   ├── Generator.bx
│   ├── Shell.bx
│   ├── Validator.bx
│   └── Evaluator.bx
├── templates/
│   ├── Agent.bx.tpl
│   ├── instructions.md.tpl
│   ├── SKILL.md.tpl
│   └── README.generated.tpl
├── examples/logguardian.json        # en la rama del Generator MVP
├── test-generator.bxs                # en la rama del Generator MVP
├── output/                           # generada localmente, ignorada por Git
├── .env.example
└── SETUP.md
```

Los nombres de componentes provienen de la guía original **«Agent Factory: guía de archivos y carpetas»**. `examples/` y `test-generator.bxs` fueron incorporados como apoyo para la prueba del generador.

## 5. Configurar Gemini de forma segura

Crea tu propia clave en [Google AI Studio](https://aistudio.google.com/apikey). **No compartas la clave por chat, capturas, commits ni Pull Requests.**

Para cargarla **solo en la ventana actual de PowerShell**, sin escribirla visiblemente en el comando ni en el historial:

```powershell
$secureKey = Read-Host "Introduce tu GEMINI_API_KEY" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
Remove-Variable secureKey, bstr -ErrorAction SilentlyContinue
```

Verifica **sin mostrar su contenido**:

```powershell
if ([string]::IsNullOrWhiteSpace($env:GEMINI_API_KEY)) {
    Write-Host "Falta GEMINI_API_KEY" -ForegroundColor Red
} else {
    Write-Host "GEMINI_API_KEY configurada en esta terminal" -ForegroundColor Green
}
```

La variable se perderá cuando cierres esa ventana de PowerShell, lo cual es intencional para las pruebas. **Crear un archivo `.env` no implica que PowerShell o BoxLang lo carguen automáticamente**. No dependas de ello a menos que el proyecto implemente explícitamente un cargador de `.env`.

### Configuración del proveedor que sí probamos

El agente generado usa `bx-ai` con el proveedor compatible con OpenAI, pero se conecta realmente a **Gemini**:

```boxlang
model: aiModel(
    provider: "openai-compatible",
    apiKey: server.system.environment.GEMINI_API_KEY,
    params: { model: "gemini-3.5-flash-lite" },
    options: {
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai"
    }
)
```

La URL termina en `/openai` **sin barra final**. No sustituir por `provider: "gemini"` durante estas pruebas: en nuestro entorno el proveedor nativo tuvo problemas con el formato de herramientas. Tampoco cambies el modelo por `gemini-2.5-flash` sin verificar acceso: ese modelo devolvió `404` con nuestra clave, mientras `gemini-3.5-flash-lite` respondió correctamente.

> El hecho de que un agente responda no confirma que haya ejecutado herramientas personalizadas. `tools`, `skills` y `subagents` aún no están implementados por el Generator MVP.

## 6. Prueba de humo obligatoria — Generator MVP

Desde la **raíz de `agent_factory`**, en una terminal donde `GEMINI_API_KEY` esté configurada:

```powershell
boxlang test-generator.bxs
```

Resultado esperado: un mensaje que comienza por `AGENTE GENERADO:` y señala `output/LogGuardian`.

**Atención:** el MVP **no sobrescribe un proyecto existente**. Si ya existe `output/LogGuardian/`, la ejecución puede fallar para evitar destruir archivos. No borres carpetas indiscriminadamente: confirma que ese directorio contiene únicamente una salida de prueba que no necesitas, o usa una especificación con otro nombre.

Después entra en el proyecto generado:

```powershell
cd .\output\LogGuardian
boxlang module:bxagents doctor
boxlang module:bxagents build
boxlang module:bxagents inspect --json
boxlang module:bxagents invoke --message="Hola, preséntate en español." --json
```

### Señales de éxito

- `doctor`: `Everything checks out.`
- `build`: `Build succeeded: .../.build/app`.
- `inspect --json`: el modelo aparece como `OpenAICompatible/gemini-3.5-flash-lite`.
- `invoke --json`: aparece un objeto JSON con la propiedad `response` y una respuesta del agente.

Prueba opcional de especialización:

```powershell
boxlang module:bxagents invoke --message='Analiza este log y propone tres soluciones: ERROR java.sql.SQLTimeoutException: Connection pool exhausted; active=20 idle=0 waiting=17' --json
```

Una respuesta pertinente debe reconocer el agotamiento de conexiones y diferenciar causas **probables** (por ejemplo, fugas o consultas lentas) de causas confirmadas. Esta prueba utiliza la API de Gemini y puede consumir cuota.

Para regresar al directorio raíz:

```powershell
cd ..\..
```

## 7. Reparto de componentes e integración

| Componente | Entrada → salida | Responsable propuesto |
|---|---|---|
| `AgentSpec.bx` | Define contrato común de agente | Dev 1 |
| `Analyst.bx` | Descripción → especificación | Dev 1 |
| `Generator.bx` y `templates/` | Especificación → proyecto BX Agents | Dev 2 |
| `Shell.bx` | Comando CLI → salida/estado | Dev 3 |
| `Validator.bx` | Proyecto → resultado del build | Dev 3 |
| `Evaluator.bx` | Proyecto validado → evaluación | Dev 3 |
| `factory.bxs` | Orquesta el flujo completo | Integración entre los tres |

Las **responsabilidades de los archivos** provienen del documento de arquitectura del proyecto. La **asignación entre desarrolladores es una propuesta**, no un requisito del framework.

Contrato JSON de referencia actual:

```json
{
  "name": "LogGuardian",
  "description": "Analiza logs de aplicaciones",
  "instructions": "Identifica errores y genera recomendaciones",
  "provider": "openai-compatible",
  "model": "gemini-3.5-flash-lite",
  "tools": [],
  "skills": [],
  "subagents": []
}
```

Antes de integrar `Analyst` con `Generator`, los tres deben confirmar que `AgentSpec.bx` use esos mismos campos y tipos. El Generator MVP **solo admite** `provider: "openai-compatible"` y listas vacías para `tools`, `skills` y `subagents`.

## 8. Problemas conocidos y soluciones

| Síntoma | Comprobación o medida |
|---|---|
| `boxlang` no se reconoce | Cierra y abre PowerShell; ejecuta `Get-Command boxlang`; revisa la instalación y el `PATH`. |
| Java no aparece o es anterior a 21 | Ejecuta `java -version`; instala Java 21+ y vuelve a abrir PowerShell. |
| `bxAgents` no se reconoce | Usa `boxlang module:bxagents <verbo>`; ese fue el comando funcional en Windows. |
| `Module bxagents not found` o falta `bx-ai` | Comprueba `install-bx-module --list` y si instalaste global o localmente; reinstala solo el módulo faltante en la versión acordada. |
| `install-bx-module` falla con URLs que contienen `%5E`/`^` en dependencias como `cbstorages` o `cbpaginator` | Es un problema de resolución de dependencias observado durante las pruebas; **no edites JARs ni cambies versiones sin coordinación**. Guarda el error y consulta al equipo o al mantenedor. |
| Logs repetitivos de `ExampleScheduler` | Se observaron en la snapshot de BX Agents; no implican por sí solos un fallo de `build`. No copies modificaciones manuales del JAR de otro integrante. |
| Gemini devuelve `401`/`403` | Verifica permisos, validez de la clave y su presencia en **esa** terminal; no pegues la clave en reportes. |
| Gemini devuelve `404` | Confirma el modelo (`gemini-3.5-flash-lite`) y el endpoint compatible; los modelos disponibles pueden variar por proyecto/clave. |
| Gemini devuelve `400` con `Unknown name type/function` | Suele indicar incompatibilidad del esquema de herramientas con el proveedor nativo; usa la configuración compatible validada en el apartado 5. |
| `Function [chr] not found` | En BoxLang usamos `char()`, no `chr()`. Confirma que estás usando la versión corregida del generador. |
| `cannot mix named and positional arguments` | Revisa llamadas con argumentos; no mezcles ambos estilos en una misma invocación interna. |
| `El proyecto ya existe` | `Generator.bx` no sobrescribe `output/LogGuardian`; verifica la carpeta antes de retirar una salida antigua. |
| `test-generator.bxs` no existe | Revisa `git branch --show-current`; el ejemplo se publicó en `feature/agent-generator`, no necesariamente en `master`. |
| El terminal devuelve una respuesta, pero no usa herramientas | `invoke` no prueba por sí solo el uso de funciones. Se requiere una prueba con herramienta instrumentada. |

### Diagnóstico mínimo para compartir con el equipo

Pega **solo la salida técnica, nunca la API Key** de estos comandos:

```powershell
java -version
boxlang --version
install-bx-module --list
boxlang module:bxagents --help
git branch --show-current
git status --short
```

Indica también si la instalación fue **global** o **local** y qué comando falló exactamente.

## 9. Buenas prácticas de Git y seguridad

- Cada desarrollador trabaja en su propia rama (`feature/...`); no hacer push directo a `master`.
- Antes de cada commit: `git status`, `git diff --cached --check` y revisar los archivos añadidos.
- No subir `.env`, variables secretas, `boxlang_modules/`, `.build/` ni `output/`.
- Las carpetas generadas bajo `output/` sirven para comprobar el funcionamiento, **no son el código fuente del Factory**.
- Si alguien necesita un agente de prueba, debe poder reconstruirlo desde `examples/logguardian.json` y `test-generator.bxs`.
- Una nueva versión de BoxLang, bx-ai o BX Agents debe quedar anotada aquí, junto con el resultado de `doctor`, `build` e `invoke`.

`.gitignore` recomendado (si ya contiene otras reglas, consérvalas):

```gitignore
output/
.env
.env.*
!.env.example
boxlang_modules/
.build/
**/.build/
*.backup
*.log
```

## 10. Checklist para cada integrante

- [ ] `java -version` indica Java 21 o superior.
- [ ] `boxlang --version` coincide con el runtime acordado.
- [ ] `install-bx-module --list` muestra bx-ai y BX Agents según las versiones acordadas.
- [ ] `boxlang module:bxagents --help` funciona.
- [ ] La rama del repositorio y el estado de Git se han comprobado.
- [ ] `GEMINI_API_KEY` está configurada en la terminal de prueba y **no se ha compartido**.
- [ ] `boxlang test-generator.bxs` genera LogGuardian (o se ha comprobado una salida previa válida).
- [ ] `doctor` y `build` se completan correctamente dentro del agente generado.
- [ ] `invoke --json` devuelve una respuesta real de Gemini.

## 11. Documentación oficial

- [Instalación de BoxLang](https://boxlang.ortusbooks.com/getting-started/installation)
- [BoxLang Quick Installer (Windows y otros sistemas)](https://github.com/ortus-boxlang/boxlang-quick-installer)
- [Gestión de módulos BoxLang](https://boxlang.ortusbooks.com/getting-started/installation/modules)
- [Módulo bx-ai / ForgeBox](https://www.forgebox.io/view/bx-ai)
- [Instalación oficial de BX Agents](https://bxagents.ai/getting-started/installation/index.html)
- [BX Agents en ForgeBox](https://www.forgebox.io/view/bx-agents)
- [Google AI Studio: obtener API Key](https://aistudio.google.com/apikey)

---

**Última prueba de referencia del equipo:** Generator MVP creó `LogGuardian`; en Windows, `boxlang module:bxagents doctor` devolvió `Everything checks out`, `build` devolvió `Build succeeded` e `invoke --json` respondió con Gemini usando `OpenAICompatible/gemini-3.5-flash-lite`. Estas comprobaciones fueron manuales; la orquestación completa de `factory.bxs` y la generación de herramientas/skills/subagentes siguen pendientes.

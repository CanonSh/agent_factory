# AGENT FACTORY STUDIO — ESPECIFICACIÓN MAESTRA PARA OPENCODE

> **Misión:** implementar, dentro del repositorio existente de Agent Factory, una aplicación web local **REALMENTE FUNCIONAL**, estilo developer workstation, modo oscuro con acentos neón, que permita crear agentes mediante la interfaz, ejecutar el flujo BoxLang ya existente, observar su progreso y consultar los resultados. **No entregar una maqueta ni una página con botones simulados.**
>
> **Destinatario:** OpenCode actuando como desarrollador full-stack. **Idioma de la interfaz, errores, comentarios funcionales y documentación: español**; nombres de variables/archivos y tecnologías pueden estar en inglés.
>
> **Prioridad 1:** integración real y estabilidad. **Prioridad 2:** acabado visual de alto nivel. Si una idea visual dificulta la integración, priorizar que funcione.

---

## 0. INSTRUCCIÓN DIRECTA PARA EL AGENTE CODIFICADOR

**Implementa todo lo descrito aquí; no te limites a explicar cómo hacerlo.** Estás trabajando sobre el repositorio abierto en el directorio actual (`agent_factory`). Antes de escribir código:

1. Inspecciona los archivos reales del repositorio, en particular `factory.bxs`, `lib/AgentSpec.bx`, `lib/Analyst.bx`, `lib/Generator.bx`, `lib/Validator.bx`, `lib/Evaluator.bx`, `templates/`, `.gitignore`, `README.md` y `package.json` si existe.
2. Comprueba qué comandos, flags y rutas existen **en esta copia local**. Lo documentado abajo refleja una versión probada del proyecto; si difiere, adapta la web **al contrato observado**, no alteres el núcleo por comodidad.
3. No modifiques el comportamiento público de los componentes BoxLang existentes; no elimines tests, plantillas ni proyectos dentro de `output/`. **La nueva aplicación debe vivir en `studio/`**.
4. Implementa frontend y servidor. Integra con BoxLang REAL; no uses `setTimeout`, respuestas predefinidas, porcentajes falsos ni datos hardcodeados como sustituto de la ejecución.
5. Incluye pruebas automáticas del servidor, una prueba end-to-end manual bien documentada y comandos de arranque reproducibles en PowerShell.
6. Al terminar, ejecuta instalación/build/tests si el entorno lo permite, corrige los fallos y entrega un resumen de archivos creados, pruebas ejecutadas y límites. Si BoxLang o la clave no están disponibles en tu entorno, dilo claramente, pero deja una integración ejecutable y un plan de verificación, sin afirmar que la probaste de verdad.
7. No instales ni conectes proveedores de IA adicionales: la aplicación usa el backend BoxLang y Gemini que el equipo ya tiene.

**Importante:** no crear un nuevo generador de agentes en Node.js, no recrear `Analyst`, `Generator`, `Validator` o `Evaluator` en TypeScript. **Node es solo un adaptador HTTP/procesos y React solo la interfaz.**

---

## 1. CONTEXTO CONFIRMADO DEL PROYECTO EXISTENTE

Sistema: **Agent Factory**. El usuario describe un agente y el orquestador existente lo genera con BoxLang y BX Agents.

Flujo comprobado:

```text
Descripción en español
      ↓
lib/Analyst.bx       → Gemini interpreta la solicitud
      ↓
lib/AgentSpec.bx     → Valida exactamente 8 campos
      ↓
lib/Generator.bx     → Crea output/<NombreDelAgente>/
      ↓
lib/Validator.bx     → Ejecuta BX Agents build
      ↓
lib/Evaluator.bx     → Opcional: pruebas + juez Gemini
      ↓
Proyecto BX Agents creado, compilado y opcionalmente evaluado
```

El proyecto admite generación de capacidades en v1.6:

- **Tools:** catálogo cerrado: `text_metrics` (genera `tools/TextMetrics.bx`: contar palabras/caracteres) y `arithmetic` (genera `tools/Arithmetic.bx`: suma). **No prometer herramientas de ejecución arbitraria, scraping, shell, base de datos o APIs.**
- **Skills:** objetos `{name, description, instructions}` generados como `skills/<slug>/SKILL.md`.
- **Subagentes:** objetos `{name, description, instructions}` generados como `subagents/<slug>/Agent.bx` e `instructions.md`.
- Modelo/proveedor probados: `gemini-3.5-flash-lite` / `openai-compatible`, conectado a Google Gemini usando la variable `GEMINI_API_KEY`.
- La reparación normal usa plantillas; la reparación sugerida por Gemini se habilita **solo con `--ai-repair`**. Máximo **3 intentos de build**, sin sobrescribir el proyecto original.
- Los nombres existentes en `output/` **NO deben sobrescribirse**.
- Un proyecto se genera en `output/<Nombre>`, y las reparaciones pueden generar `output/<Nombre>_Repair2` o `_Repair3`.

### 1.1. Contrato exacto de especificación (ocho campos)

```json
{
  "name": "TextAnalyzerDemo",
  "description": "Analiza textos y ofrece recomendaciones",
  "instructions": "Revisa coherencia y ortografía",
  "provider": "openai-compatible",
  "model": "gemini-3.5-flash-lite",
  "tools": ["text_metrics"],
  "skills": [
    {
      "name": "revision-textual",
      "description": "Método de revisión de textos",
      "instructions": "Evalúa claridad, coherencia y correcciones."
    }
  ],
  "subagents": [
    {
      "name": "coherencia-claridad",
      "description": "Especialista en coherencia",
      "instructions": "Revisa la conexión lógica entre ideas."
    }
  ]
}
```

**No confundir** `tools` con objetos: son cadenas admitidas del catálogo. No exigir al usuario llenar manualmente este JSON; lo genera Gemini. La interfaz muestra el JSON cuando ya exista.

### 1.2. Comandos BoxLang reales, previamente comprobados

Ejecutados **desde la raíz del repositorio**:

```powershell
boxlang factory.bxs --help
boxlang factory.bxs --description="Crea un agente que explique SQL" --name=SQLTutorDemo
boxlang factory.bxs --description="Crea un agente que explique SQL" --name=SQLTutorEvaluado --evaluate
boxlang factory.bxs --description="Crea un agente que analice textos" --name=TextoSeguro --evaluate --ai-repair
boxlang factory.bxs --description="Crea un agente que explique SQL" --preview
```

Ejecutados **dentro de una carpeta de agente generado**:

```powershell
boxlang module:bxagents build
boxlang module:bxagents inspect --json
boxlang module:bxagents invoke --message="Hola, preséntate" --json
```

`--preview` en el orquestador actual **solo valida la entrada CLI y no genera el AgentSpec ni una vista previa enriquecida**. No mostrar un JSON especulativo en la UI de preview.

El CLI imprime mensajes verificables:

```text
=== AGENT FACTORY v1.5 ===
[1/5] Analyst: generando especificacion con Gemini...
[2/5] AgentSpec: validando los ocho campos...
[OK] Nombre: TextAnalyzerV16B
[3/5] Generator: creando proyecto BX Agents...
[OK] Proyecto creado: C:/.../agent_factory/output/TextAnalyzerV16B
[4/5] Validator: compilando proyecto BX Agents...
[OK] Build correcto (exitCode=0, intento 1/3).
[5/5] Evaluator: ejecutando 3 pruebas reales y el juez Gemini...
[OK] Evaluacion completada. Puntaje orientativo: 90/100
  Prueba 1: APROBADA
  Prueba 2: APROBADA
  Prueba 3: APROBADA
=== AGENTE CREADO, COMPILADO Y EVALUADO ===
Nombre: TextAnalyzerV16B
Ruta: C:/.../agent_factory/output/TextAnalyzerV16B
```

Si la evaluación está desactivada, el flujo es de **4 etapas**, no de 5. Si la evaluación falla, el CLI puede salir con código **2** aunque el agente ya se haya generado/compilado; mostrar estado **“generado, evaluación incompleta”**, no éxito total ni fallo absoluto. Código 1 es fallo general/build; código 0 éxito confirmado. Determinar el estado final preferentemente por **exit code** y marcadores observados, nunca por temporizadores.

**Artefactos disponibles** dentro del agente generado:

- `agent-spec.json` — JSON exacto del agente, incluidos `tools`, `skills`, `subagents`.
- `Agent.bx`, `instructions.md`, `README.md`.
- `tools/`, `skills/`, `subagents/` con archivos de capacidades.
- `.build/` después del build. Para leer lo descubierto por BX Agents, ejecutar `boxlang module:bxagents inspect --json` en el directorio del agente. **No asumir que `.build/manifest.json` está siempre en una ubicación determinada.**
- `repair-diagnostics.json` en versiones reparadas, si se aplicó una reparación.

Versiones probadas en el equipo: Windows + PowerShell, BoxLang `1.18.0+66`, bx-ai `3.5.0+19`, bx-agents `1.0.0-snapshot`. Node.js es **nuevo para Studio**; exigir Node.js 20 LTS o superior y npm.

---

## 2. RESULTADO DESEADO: PRODUCTO Y EXPERIENCIA

Nombre del producto en pantalla: **AGENT FACTORY**. Submarca: **STUDIO // BX AGENTS**.

La página debe sentirse como un **IDE/control center de agentes de IA**: moderna, con estructura cuidada, efectos visuales discretos y usabilidad real. El usuario no debe abrir la terminal para crear agentes: solo para **iniciar el servidor la primera vez**.

Inspiración visual del usuario: `https://claude.ai/artifact/YUtrRpyuPA1pFreCjUTfQn`. Si no es accesible, **no bloquearte**: usa las especificaciones visuales de esta guía. No copiar código, imágenes o una UI privada desde el enlace.

### 2.1. Identidad visual — obligatoria

Tema: **dark only** en el MVP, un control opcional de tema queda fuera del alcance.

Tokens CSS sugeridos (ajustar contraste sin perder identidad):

```css
:root {
  color-scheme: dark;
  --bg: #070B12;
  --bg-raised: #0C1220;
  --surface: #10192A;
  --surface-hover: #152137;
  --border: #263249;
  --text: #EAF3FF;
  --muted: #8D9CB3;
  --neon-cyan: #42F5E9;
  --neon-lime: #B5FF5A;
  --neon-purple: #A77BFF;
  --neon-pink: #FF5AA5;
  --warning: #FFC46B;
  --danger: #FF738F;
}
```

Diseño:

- Fondo oscuro con **retícula tenue** (CSS, sin imágenes pesadas), halos difuminados cian y púrpura, textura técnica sutil.
- Header con logomarca geométrica original (SVG/CSS), nombre AGENT FACTORY y subtítulo `BUILD • COMPILE • EVALUATE`.
- Tipografía principal moderna con fallback `Inter, ui-sans-serif, system-ui`; código/logs con `JetBrains Mono, Consolas, monospace`. Funcionar aunque no carguen fuentes externas.
- Paneles con `backdrop-filter` discreto, borde fino, esquinas 12–18px, sombras suaves; glassmorphism **sutil, no borroso ni ilegible**.
- Neón **reservado a botones primarios, progreso y elementos seleccionados**, no a todos los textos.
- Botón principal cian/lima con hover luminoso moderado; animación de spinner solamente mientras hay ejecución real.
- Acentos microvisuales: números monoespaciados, separadores, estados LIVE/READY, líneas técnicas y tarjetas visualmente distintas.
- Contraste WCAG razonable, focus rings visibles, etiquetas accesibles, teclado, `prefers-reduced-motion`, nada que parpadee.
- Desktop prioritario 1440×900, responsive real desde 375px; nunca scroll horizontal general.
- **No** copiar branding de Anthropic/Claude, no usar fotografías stock, no dependencia de un servicio de diseño externo.

### 2.2. Wireframe propuesto

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  ◈ AGENT FACTORY / STUDIO                             BX AGENTS  •  LOCAL ● READY │
│  Turn ideas into executable AI agents                         Docs  /  GitHub (*) │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  BUILD INTELLIGENT AGENTS                       [01] DESCRIPTION ───────────────┐    │
│  From natural language to                       Describe tu agente...          │    │
│  runnable BoxLang projects                      [textarea real]                 │    │
│                                                                                 │    │
│  [STATS: Build status / Tools / Skills / Agents] [Sugerencias clickables]       │    │
│                                              [Name] [Evaluate ✓] [AI Repair ○]  │    │
│                                              [ ⚡ GENERAR AGENTE ]               │    │
│                                                                                 │    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  BUILD PIPELINE                                                               │    │
│  [Analyst] ─── [AgentSpec] ─── [Generator] ─── [Validator] ─── [Evaluator*]    │    │
│   running       pending           pending        pending         optional       │    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  EXECUTION CONSOLE                                  LIVE ● [copiar] [limpiar vista]   │
│  > [INFO] Descripcion recibida...                                                   │
│  > [1/5] Analyst...                                                                │
│  > [OK] Proyecto creado...                                                         │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  RESULTADOS                                                                      │
│  Overview | Especificación | Capacidades | Evaluación | Archivos (solo lectura)     │
│  ┌ Agent  ┐ ┌ Score  ┐ ┌ Tools  ┐ ┌ Skills  ┐ ┌ Subagents ┐                        │
│  │ Name...│ │ 90/100 │ │ 1      │ │ 1       │ │ 1         │                        │
│  └────────┘ └────────┘ └────────┘ └─────────┘ └───────────┘                        │
│  [Copiar ruta]  [Copiar comando invoke]                                             │
└──────────────────────────────────────────────────────────────────────────────────────┘
(*) Mostrar enlaces solamente si funcionan y apuntan a URLs verificadas en el proyecto.
```

Desktop: compositor y explicación en dos columnas o una composición asimétrica convincente; pipeline/log/resultados debajo. Mobile: una columna, tabs scrollables, paneles compactos, botón de generar visible.

---

## 3. FUNCIONES OBLIGATORIAS DE LA WEB

### 3.1. Formulario real

Campos:

1. **Descripción del agente (obligatoria)**: textarea multilinea, 10–2000 caracteres, contador, errores inline, placeholder útil en español. Este texto se pasa a `--description` sin transformaciones semánticas.
2. **Nombre del agente (opcional en UI)**: si se especifica, validar `^[A-Za-z][A-Za-z0-9_-]{0,49}$`. Si se omite, **el servidor asigna un nombre único y válido** `Agent_<timestamp>_<hex>`; mostrarlo al usuario antes/durante el build. No confiar en el cliente para garantizar unicidad.
3. **Evaluar agente:** toggle activo por defecto. Envía `--evaluate` solo si true. Mostrar que consume llamadas extra a Gemini.
4. **Autorreparación con IA:** toggle desactivado por defecto. Envía `--ai-repair` **solo** si true, con advertencia clara de que propone modificaciones limitadas y consume Gemini. Reparación básica por plantillas sigue activa sin este toggle.
5. Presets o chips de **prompts de ejemplo** que llenan el textarea, no crean el agente solos: “Revisor de textos” (text_metrics + skill + subagente), “Asistente matemático” (arithmetic), “Analizador de errores” (instrucciones y quizá skills). Evitar prometer herramientas no soportadas.
6. Botón **GENERAR AGENTE**: inicia **una ejecución real**. Desactivado durante trabajo y si formulario inválido. Indicar errores de nombre duplicado y proponer nombre diferente **sin borrar la descripción**.
7. En progreso: mostrar que salir/refrescar no interrumpe automáticamente el proceso del backend. Al reabrir, recuperar último job en memoria del servidor si sigue vivo.

No implementar `--preview` como si produjera una especificación. Si hay botón de Vista previa, debe llamarse **“Revisar configuración”** y limitarse a datos que sí conocemos del formulario, o dejarlo fuera.

### 3.2. Pipeline visible y honesto

Etapas: **Analyst → AgentSpec → Generator → Validator → Evaluator**.

Estados por etapa: `pending`, `running`, `success`, `error`, `skipped`. Cuando `evaluate=false`, `Evaluator=skipped`. Mostrar intento de compilación `intento 1/3`, `2/3` o `3/3` solo cuando los logs lo informen. Si aparece un mensaje de reparación, mostrar un subestado real “Reparación en curso”.

**No calcular porcentajes ficticios**. Se permite un indicador indeterminado `Trabajando...`; la línea de etapas se ilumina a medida que el CLI confirma avances. El backend es la fuente de verdad.

### 3.3. Consola integrada en vivo

- Stream de stdout y stderr mientras BoxLang ejecuta. Un log por línea con timestamp, nivel y contenido.
- Resaltar `[INFO]`, `[OK]`, `[ERROR]`, `[AVISO]` y `[1/5]` sin alterar el texto original.
- Mantener 500–1500 líneas recientes por job en memoria; no congelar UI con logs enormes. Auto-scroll configurable; copiar salida y descargar `.txt` generado en navegador (Blob) si procede.
- Errores de conexión, BoxLang no encontrado, falta de API key y cierre inesperado deben mostrarse con mensaje accionable.
- No mostrar `GEMINI_API_KEY`, encabezados Authorization, cookies, `.env`, variables completas del entorno ni tokens, aunque accidentalmente aparezcan en stderr. Aplicar redacción básica y nunca agregar logs de `process.env`.
- SSE reconectable o flujo equivalente; no confundir demo de frontend con ejecución real.

### 3.4. Resultado verificable

Al concluir, mostrar:

- **Estado real**: compilado, compilado/evaluado, generado pero no compilado, evaluación incompleta, fallido.
- Nombre exacto, ruta real del proyecto bajo `output/`, código de salida, intentos, score **solo** si la evaluación ocurrió y completó (puntaje *orientativo*), observaciones y las 3 pruebas cuando estén disponibles.
- **Especificación**: contenido de `agent-spec.json`, legible con syntax highlighting sencillo, botón copiar JSON.
- **Capacidades**: listado y contadores de tools, skills y subagentes que provengan de `boxlang module:bxagents inspect --json` tras un build exitoso; si la inspección falla, mostrar `No se pudo comprobar el manifiesto`, no inventar componentes.
- **Archivos**: árbol básico obtenido del directorio generado, con lectura **solo de archivos permitidos** y vista monospace. No abrir archivos arbitrarios del disco.
- Si hay reparación, mostrar cuál proyecto final se obtuvo (`_Repair2` / `_Repair3`) y `repair-diagnostics.json` cuando exista.
- Botón “Copiar ruta” y botón “Copiar comando para probar” usando:

  ```powershell
  cd "C:\ruta\del\agente"
  boxlang module:bxagents invoke --message="Hola, presentate en espanol" --json
  ```

- **No incluir “Abrir carpeta”** que pretenda lanzar Explorer directamente desde un navegador sin soporte real; copiar ruta es suficiente. No abrir ventanas/ejecutables arbitrarios desde una petición web.

### 3.5. Estado de preparación

`GET /api/health` debe mostrar si están listos: servidor, runtime BoxLang y configuración `GEMINI_API_KEY` **solo como booleano**. Mostrar en la barra superior: `Sistema listo`, `Falta GEMINI_API_KEY`, `BoxLang no detectado`, etc. La UI sigue cargando aun cuando falte BoxLang y explica qué verificar. Evitar ejecutar procesos por cada render; cachear la comprobación brevemente.

---

## 4. ARQUITECTURA TÉCNICA ELEGIDA

**No hacer preguntas sobre stack. Implementar exactamente este enfoque, salvo incompatibilidad encontrada en el repositorio:**

- **Frontend:** React 18 o 19 + TypeScript + Vite + CSS modular o CSS tradicional con variables; iconos Lucide React. Se permite Framer Motion solo si añade valor y no complica el build. Nada de dependencias de pago.
- **Backend:** Node.js 20+ + Express (ES modules, JavaScript claro). Sin base de datos para este MVP.
- **Comunicación:** `fetch` para REST y **SSE / EventSource** para salida en vivo. Sin WebSockets si SSE basta.
- **Proceso BoxLang:** Node `child_process.spawn` con ejecución real; Windows PowerShell adaptador local **sin `shell: true`**. Backend **solo** en `127.0.0.1`, no exponerlo en red pública.
- **Almacenamiento:** jobs y su log reciente en memoria; proyectos persistentes en el `output/` original. No migrar nada a una base de datos.
- **Modo desarrollo:** Vite `127.0.0.1:5173`, proxy `/api` a Express `127.0.0.1:4317`; **mismo origen** para frontend en producción.
- **Producción local:** `npm run build` y `npm start`; Express sirve `studio/client/dist` y `/api` en `http://127.0.0.1:4317`.

### 4.1. Árbol de archivos que debes crear

```text
agent_factory/                       # RAÍZ ACTUAL; NO MOVER EL CORE
├── factory.bxs                     # EXISTE; CONSERVAR
├── lib/                            # EXISTE; CONSERVAR
├── templates/                      # EXISTE; CONSERVAR
├── output/                         # EXISTE; NO SOBRESCRIBIR NI BORRAR
├── studio/                         # NUEVO
│   ├── package.json               # npm workspaces / scripts de arranque
│   ├── package-lock.json           # generar npm install y versionar
│   ├── .gitignore                  # node_modules, dist, temporales, .env
│   ├── README.md                   # instalación, funcionamiento, demo, seguridad
│   ├── client/
│   │   ├── package.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── styles/
│   │   │   │   ├── tokens.css
│   │   │   │   ├── globals.css
│   │   │   │   └── animations.css
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── AgentComposer.tsx
│   │   │   │   ├── PresetPrompts.tsx
│   │   │   │   ├── Pipeline.tsx
│   │   │   │   ├── LiveConsole.tsx
│   │   │   │   ├── StatusPill.tsx
│   │   │   │   ├── ResultsDashboard.tsx
│   │   │   │   ├── SpecViewer.tsx
│   │   │   │   ├── CapabilitiesPanel.tsx
│   │   │   │   ├── EvaluationPanel.tsx
│   │   │   │   ├── ProjectFilesPanel.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useJob.ts
│   │   │   │   └── useHealth.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── format.ts
│   │   │   └── test/             # pruebas frontend si procede
│   └── server/
│       ├── package.json
│       ├── scripts/
│       │   └── run-factory.ps1  # puente PowerShell a CLI BoxLang
│       ├── src/
│       │   ├── index.js          # Express + estáticos + lifecycle
│       │   ├── config.js         # rutas ABSOLUTAS calculadas desde import.meta.url
│       │   ├── routes.js         # API endpoints
│       │   ├── jobManager.js     # ejecución y estado de los jobs
│       │   ├── boxlangRunner.js  # spawn seguro + procesos + timeout
│       │   ├── logParser.js      # parser de stdout/stderr
│       │   ├── resultReader.js   # agent-spec, inspect JSON, archivos
│       │   ├── validation.js     # schema inputs y nombres
│       │   └── redact.js         # filtrado de credenciales/logs
│       └── test/
│           ├── validation.test.js
│           ├── logParser.test.js
│           ├── security.test.js
│           └── jobs.test.js      # ejecutar con runner simulado por inyección
└── .gitignore                    # revisar/actualizar SOLO si falta ignorar studio/
                                    # node_modules y dist, sin ignorar studio/ completo
```

Se permite reorganizar **dentro de `studio/`** para mejorar calidad, pero mantener las responsabilidades y los comandos descritos. Usar npm workspaces o scripts equivalentes que funcionen en Windows desde `studio/`.

### 4.2. `studio/package.json` — scripts mínimos

```json
{
  "name": "agent-factory-studio",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["client", "server"],
  "scripts": {
    "dev": "concurrently -k \"npm run dev -w client\" \"npm run dev -w server\"",
    "build": "npm run build -w client",
    "start": "npm run start -w server",
    "test": "npm run test -w server && npm run test -w client"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

No asumir que el ejemplo fija todas las dependencias: especificar versiones compatibles para Express/Vite/React/lucide-react en los `package.json` correspondientes y mantener `npm run test` operable (crear script real de test en frontend o ajustarlo, **nunca script ficticio**).

---

## 5. CONTRATO DE API (BACKEND REAL)

### 5.1. Salud

`GET /api/health` → HTTP 200:

```json
{
  "ok": true,
  "boxlangAvailable": true,
  "geminiConfigured": true,
  "busy": false,
  "version": "studio-1.0"
}
```

`ok` significa que **el servidor web está funcionando**, no que Gemini está listo. Si falta BoxLang o la key, mantener 200 y booleanos false con indicaciones legibles. **Nunca enviar valor de la clave ni el entorno completo**.

### 5.2. Crear generación

`POST /api/jobs` con `Content-Type: application/json`:

```json
{
  "description": "Crea un agente que analice textos con tool de conteo, skill de revisión y subagente de coherencia.",
  "name": "TextAnalyzerStudio",
  "evaluate": true,
  "aiRepair": false
}
```

Validaciones en servidor (aunque React valide):

- `description`: string real, `trim`, de 10 a 2000 caracteres, sin controles NUL; límite de cuerpo Express 16–32 KB.
- `name`: si viene vacío, generar identificador único seguro. Si viene, regex `^[A-Za-z][A-Za-z0-9_-]{0,49}$`.
- `evaluate`, `aiRepair`: booleanos reales, default `true`/`false`. Rechazar strings como `"true"`.
- Rechazar campos no admitidos para esta ruta (no aceptar `command`, `cwd`, `args`, `path`, `model`, `provider`, `apiKey` desde el cliente).
- Verificar `output/<nombre>` **sin crear ni sobrescribir**; devolver `409 NAME_EXISTS` con nombre alternativo sugerido si ya existe. Si aparece conflicto entre la validación y la ejecución, preservar el error original y sugerir nombre nuevo.
- Aceptar **solo una generación simultánea** (HTTP 409 o 429 `BUSY`); no mezclar logs ni sobrecargar Gemini durante demo.
- Rechazar si faltan BoxLang o Gemini key con `503 NOT_READY` y mensaje específico, sin secretos.
- No hacer inyección de comandos ni permitir que `description` defina parámetros CLI adicionales.
- Generar UUID de job, almacenar estado y **responder inmediatamente** con HTTP 202:

```json
{
  "jobId": "random-uuid",
  "name": "TextAnalyzerStudio",
  "status": "queued",
  "eventsUrl": "/api/jobs/random-uuid/events"
}
```

Si `name` vino vacío, devolver el nombre generado.

### 5.3. Estado de un job

`GET /api/jobs/:id` → estado actual:

```json
{
  "id": "random-uuid",
  "name": "TextAnalyzerStudio",
  "status": "running",
  "createdAt": "2026-10-11T19:00:00.000Z",
  "startedAt": "2026-10-11T19:00:01.000Z",
  "finishedAt": null,
  "phase": "validator",
  "phases": {
    "analyst": "success",
    "agentSpec": "success",
    "generator": "success",
    "validator": "running",
    "evaluator": "pending"
  },
  "attempt": 1,
  "exitCode": null,
  "projectPath": null,
  "score": null,
  "error": null,
  "recentLogs": []
}
```

Estados globales: `queued | running | success | partial | failed`. Opcional `cancelled` **solo si implementar cancelación REAL y confiable**; de lo contrario omitir botón cancelar. En la respuesta final opcionalmente `spec`, `manifest`, `evaluation`, `files`, `repair`. Mantener un shape estable y tipado en TypeScript.

`GET /api/jobs` → lista de últimos jobs del **proceso actual**, tamaño limitado (por ejemplo 20), para recuperar la pantalla tras refresh. **No afirmar historial persistente**. Si reinicia Node, los jobs anteriores desaparecen; los agentes generados permanecen en `output/`.

### 5.4. Streaming en vivo (SSE)

`GET /api/jobs/:id/events` con `text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`; emitir eventos de forma progresiva:

```text
id: 1
event: log
data: {"timestamp":"...","level":"info","line":"[1/5] Analyst..."}

id: 2
event: phase
data: {"phase":"analyst","status":"running"}

id: 3
event: complete
data: {"status":"success","exitCode":0}

```

También eventos `snapshot`, `error` si aportan valor. Implementar `Last-Event-ID` y buffer acotado para evitar perder logs tras reconexión; no reenviar todos los logs en cada render. Corazones `: heartbeat` cada ~15 s. Limpiar listeners y timers cuando se cierra la conexión. Al recibir `complete`, frontend actualiza `GET /api/jobs/:id` y cierra `EventSource`.

### 5.5. Resultados y archivos

- `GET /api/jobs/:id/result`: retornar datos ya agregados del job: estado, score si lo hay, spec, manifest y evaluación.
- `GET /api/jobs/:id/files`: árbol relativo y seguro **del projectPath final**, limitado a nombres/tipos permitidos y profundidad razonable; sin claves/archivos `.env`/`.build`, ni symlinks.
- `GET /api/jobs/:id/files/content?path=...`: **solo lectura**, allowlist de extensiones `.bx`, `.md`, `.json`, `.txt` y archivos conocidos; máximo 200 KB por lectura; validar ruta resuelta bajo proyecto real y dentro de `output/` usando `realpath`/separador; rechazar `..`, rutas absolutas, symlinks y rutas de secretos (`.env`, `.git`, `.build`, `node_modules`, `logs`, credenciales). Responder `404/403` apropiadamente. No crear un endpoint de lectura genérica de disco.

Puedes simplificar el visor de archivos si el tiempo es muy corto, pero **no** sacrificar generación real, pipeline, logs y resumen de capacidades.

### 5.6. Errores coherentes

Ejemplo:

```json
{
  "error": {
    "code": "NAME_EXISTS",
    "message": "Ya existe un agente con este nombre. Prueba TextAnalyzerStudio2.",
    "suggestedName": "TextAnalyzerStudio2"
  }
}
```

Códigos sugeridos: `INVALID_INPUT` (400), `NAME_EXISTS` (409), `BUSY` (409), `NOT_READY` (503), `NOT_FOUND` (404), `PROCESS_FAILED` (500 en job; la creación ya respondió 202), `INTERNAL_ERROR` (500). Errores reales a UI; no falsos `success`.

---

## 6. LANZADOR DE BOXLANG PARA WINDOWS — PUNTO CRÍTICO

**El usuario trabaja en Windows PowerShell**, ruta de referencia: `C:\Users\argue\Documents\Boxlang\agent_factory`. No codificar esta ruta; calcular la raíz relativa al archivo fuente con `import.meta.url` y `path.resolve` para permitir mover el repositorio.

### 6.1. NO ejecutar así

```js
// PROHIBIDO: susceptible a inyección, comillas y caracteres especiales.
exec(`boxlang factory.bxs --description="${description}" --name=${name}`);
spawn("boxlang", [`--description=${description}`], { shell: true });
```

**No** interpolar el prompt dentro de una cadena PowerShell o `cmd.exe`. **No** usar `eval`, ni ejecutar parámetros libres aportados por el navegador.

### 6.2. Enfoque obligatorio en Windows

Para evitar los problemas de `.cmd`/PATH de Node Windows y de comillas en prompts:

1. El servidor valida `description`, `name` y flags.
2. Escribe un JSON UTF-8 en un subdirectorio temporal **del proceso**, con nombre aleatorio e información **solo** del job; no incluir clave API.
3. Ejecuta con `spawn("powershell.exe", ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", <ruta-absoluta-a-run-factory.ps1>, "-RequestFile", <ruta-JSON>], { cwd: <repoRoot>, env: process.env, shell:false, windowsHide:true })`.
4. El script `run-factory.ps1` carga el JSON a variables, construye una **lista de argumentos** y llama a `boxlang` por invocación de PowerShell (`& boxlang @args`). **Nunca** genera un string de código de PowerShell usando la descripción ni `Invoke-Expression`.
5. Transmite stdout/stderr al backend, mantiene y comunica `exitCode`, borra el JSON temporal al terminar, haya habido éxito o fallo.
6. Verifica especialmente prompts con espacios, acentos, comillas o caracteres especiales. Los caracteres que el shim de BoxLang no pueda pasar de manera segura deben rechazarse claramente (400) o tratarse de forma probadamente segura; no permitir metacaracteres que ocasionen ejecución de comandos ajenos.

Ejemplo orientativo de `run-factory.ps1`; **ajustarlo y probarlo**, no asumir que este pseudocódigo sustituye tests:

```powershell
param([Parameter(Mandatory=$true)][string]$RequestFile)
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding

$request = Get-Content -LiteralPath $RequestFile -Raw -Encoding UTF8 | ConvertFrom-Json
$arguments = @(
    'factory.bxs',
    "--description=$($request.description)",
    "--name=$($request.name)"
)
if ($request.evaluate -eq $true) { $arguments += '--evaluate' }
if ($request.aiRepair -eq $true) { $arguments += '--ai-repair' }

# El proceso Node debe fijar cwd a la raíz del repositorio.
& boxlang @arguments 2>&1 | ForEach-Object {
    [Console]::Out.WriteLine($_.ToString())
    [Console]::Out.Flush()
}
$exitCode = $LASTEXITCODE
if ($null -eq $exitCode) { $exitCode = 1 }
exit [int]$exitCode
```

**Atención:** en algunos entornos PowerShell 5.1 + scripts `.cmd` la semántica de quoting difiere de PowerShell 7. No dar por segura la interpolación de `--description` por intuición: probar con entradas adversariales. Si descubres que el launcher no soporta entradas complejas, documentarlo, limitar la validación de entrada o implementar un puente más seguro con argumentos indirectos; **jamás usar `shell:true` con texto libre**.

### 6.3. Linux/macOS (opcional)

`spawn("boxlang", ["factory.bxs", "--description=...", "--name=...", ...], { cwd: repoRoot, shell:false })` si BoxLang es binario ejecutable. Windows es la plataforma obligatoria.

### 6.4. Robustez del proceso

- Recibir `data` de stdout/stderr, hacer buffering de líneas parciales (`\r\n`/`\n`), no cortar caracteres Unicode UTF-8 a mitad de chunk.
- Emitir logs incrementalmente durante proceso, no esperar a `close`.
- Capturar `error` del spawn (`ENOENT`, `EACCES`) y cierre inesperado.
- Timeout largo configurable (ejemplo 10 minutos) y mensaje visible; si expira, terminar árbol de procesos con cuidado en Windows y marcar error. **No cortar a los 30 segundos**: Gemini y las evaluaciones tardan.
- Solo un proceso `factory.bxs` simultáneo. La UI debe desactivar otro submit mientras esté ocupado.
- El proceso hijo hereda `GEMINI_API_KEY` del proceso Node sin nunca retornarla al frontend. No pedir API key en el formulario web.
- Validar que `factory.bxs` realmente existe antes de habilitar el botón.
- Al finalizar la app Node, gestionar trabajos activos sin dejarlos huérfanos cuando sea viable. **No** borrar ni sobrescribir el directorio `output/`.

### 6.5. Lectura de resultados tras el proceso

Analizar con expresiones tolerantes las líneas CLI observadas:

- Inicio `[1/5]` / `[1/4]`, `[2/5]`, `[3/5]`, `[4/5]`, `[5/5]`.
- `[OK] Proyecto creado: <ruta>`.
- `[OK] Build correcto (...)`.
- `[OK] Evaluacion completada. Puntaje orientativo: <n>/100`.
- `Prueba 1: APROBADA` / `NO APROBADA` y `Pregunta:`/`Criterio:`.
- `=== AGENTE CREADO... ===` y `Ruta: <ruta>`.
- `[ERROR] ...`, `Detalle: ...`, `Proyecto compilado: <ruta>`.
- Reparación: `Version de reparacion: <ruta>`, `Estrategia aplicada: ...`, `intento 2/3`.

**Nota de seguridad:** las rutas provenientes de stdout pueden ser manipulables: antes de usarlas para leer archivos, exigir que su `realpath` sea descendiente directo o indirecto de `<repoRoot>/output` y que el nombre/carpeta pertenezca a ese job o su sufijo `_Repair2`/`_Repair3`.

Tras salida exitosa:

1. Leer `agent-spec.json` con límites y validación de lectura.
2. Ejecutar `boxlang module:bxagents inspect --json` con **cwd=projectPath final**, mediante el mismo runner seguro; parsear exclusivamente JSON válido. Esta fase es posterior y no debe marcar la generación fallida si inspect falla.
3. Poblar capacidades usando el array `files` de inspect con categorías reales `tools`, `skills`, `subagents`, ejemplo:

```json
{
  "files": [
    { "category": "skills", "name": "revision-textual", "path": "skills/revision-textual" },
    { "category": "subagents", "name": "coherencia-claridad", "path": "subagents/coherencia-claridad" },
    { "category": "tools", "name": "TextMetrics", "path": "tools/TextMetrics.bx" }
  ]
}
```

4. Si inspect no devuelve JSON válido, mostrar fallo de inspección y permitir al usuario copiar la ruta / comando. **No** inventar resultados.

---

## 7. COMPONENTES Y COMPORTAMIENTO DEL FRONTEND

### 7.1. Header

Logo dibujado con SVG local/CSS, `AGENT FACTORY`, subtítulo `AI Agent Generation System` y `LOCAL ENVIRONMENT`. Estado backend API en una esquina con indicador discreto. Sin enlaces inertes.

### 7.2. Hero y AgentComposer

Titular impactante pero corto: **“Build agents. Not boilerplate.”** con una palabra en degradado cian/lima; subtítulo en español aclarando “Describe un agente y deja que BoxLang lo construya”. No saturar la página de texto. Textarea editorial de gran tamaño, con número de caracteres y sugerencias de prompts. Toggle de evaluación + autorreparación, input nombre con ejemplo y validación. CTA destacada con icono `Zap`.

### 7.3. Pipeline

5 tarjetas conectadas; usar íconos adecuados: cerebro/lupa para Analyst, escudo para Spec, cubos para Generator, terminal/martillo para Validator, gráfica para Evaluator. Indicadores `pendiente`, `ejecutando`, `completado`, `error`, `omitido` con color **y texto**. Animar conexión al cambiar etapa, respetando reduced motion.

### 7.4. LiveConsole

Título `EXECUTION STREAM`, punto LIVE solamente cuando el servidor tenga un job realmente ejecutándose; fondo #080E17, tipografía mono 12–13px, scrolling propio de ~270–360px, botón copiar, toggle autoscroll, mensaje útil si no hay salida. Diferenciar stderr sin confundir un warning con fallo del job.

### 7.5. Resultados

Después del cierre del job:

- Tarjeta visual del agente (nombre, resultado, modelo conocido de `agent-spec.json`).
- Contadores **reales** de tools/skills/subagentes del manifiesto, o `—` si no verificados.
- Si evaluación exitosa, nota `90/100` y etiqueta “puntuación orientativa”; listar pruebas reales que devolvió el evaluator.
- Tabs o segmentos `Resumen`, `Especificación`, `Capacidades`, `Evaluación`, `Archivos` con pantallas útiles y estados vacíos honestos.
- Botones copiar JSON, ruta y comando de invocación. Copiado real vía `navigator.clipboard.writeText` y fallback si necesario.
- Si falla, tarjeta de diagnóstico con último error real y botón **Editar descripción** (preservando el formulario). Reintentar genera **nombre nuevo** si ya existe el anterior; no sobrescribir.

### 7.6. Microinteracciones y ergonomía

- Validación instantánea, avisos de acciones realmente completadas, sin toast de éxito anticipado.
- Skeletons solo para carga real; nada de loader infinito si backend murió.
- Manejo de pérdida de conexión con reconexión SSE; `Esc` no borra los datos.
- Navegación accesible por teclado (labels y controles nativos), textarea con tamaño adaptativo.
- Vista mobile sin desbordar; consola monoespaciada con saltos de línea/break-word cuando convenga.
- `document.title`: `Agent Factory Studio — Build AI Agents`.

---

## 8. SEGURIDAD, PRIVACIDAD Y LÍMITES — OBLIGATORIO

1. Escuchar **solo** en `127.0.0.1` y no abrir CORS `*`; no publicar servidor de procesos en Internet. Un navegador local con acceso al puerto sigue siendo una superficie de ataque: para POST validar `Origin` cuando esté presente contra los orígenes locales autorizados, usar JSON y rechazar cross-site inesperados.
2. No exponer endpoints para comandos libres, abrir directorios, borrar proyectos, leer rutas arbitrarias, lanzar `invoke` con argumentos arbitrarios sin salvaguardas, ni subir archivos de código.
3. No concatenar cadenas del usuario a `shell`, PowerShell script, `cmd.exe` o un SQL. Comprobar que `--description` y `--name` se pasan como datos, no sintaxis de comandos.
4. Rate limit elemental para crear jobs: **uno a la vez**, tamaño máximo de cuerpo y de logs, límite de jobs en memoria. No requerir autenticación para un MVP solo localhost, pero explicitar que **no** está diseñado para una red pública.
5. Nunca persistir o mostrar `GEMINI_API_KEY`; tampoco guardar tokens en localStorage. El backend hereda el entorno desde PowerShell. Si no está, instruir al usuario a definirlo en la terminal que inicia `npm run dev`.
6. El frontend **no** accede directamente a filesystem, ni a BoxLang ni a claves API.
7. Proteger los endpoints de archivos de path traversal (`../`, Unicode, `\`, absolutos), rutas simbólicas, secrets y archivos grandes. Usar canonical paths y guardas `path.relative` con límites de carpeta, no solamente `startsWith` de strings.
8. No instalar nuevas tools ejecutables generadas por el modelo: el catálogo cerrado existente se mantiene.
9. La generación puede causar costos/cuotas de Gemini: avisar al activar evaluación/reparación; mostrar errores de cuota/conexión sin filtrar credenciales.
10. Los resultados del modelo y `instructions.md` pueden contener contenido no confiable. Mostrar texto como **texto escapado**; nunca `dangerouslySetInnerHTML` sin sanitización robusta, ni ejecutar código de archivos generados desde React.
11. No modificar/destruir trabajos previos en `output/`, ni sobrescribir `Agent.bx` original ni archivos de tests. La app solo crea proyectos mediante el flujo existente.
12. No subir `output/`, `.env`, `node_modules`, `dist`, `.build` ni credenciales a Git. Ajustar `.gitignore` apropiadamente, sin ignorar las fuentes de Studio.

---

## 9. TESTS AUTOMÁTICOS Y ACEPTACIÓN (NO OPCIONALES)

Usar `node:test` + `assert` en servidor, Vitest + Testing Library (u otra alternativa ligera y real) para React. Evitar mocks en las **pruebas manuales de integración real**; mocks sí son válidos para pruebas unitarias aisladas.

### 9.1. Pruebas mínimas backend

1. `POST /api/jobs` rechaza descripción vacía, `name=../bad`, nombre largo, tipos incorrectos y opciones extra.
2. Rechaza descripción con intentos de inyección de línea de comandos o la pasa como dato **sin ejecutarla**; verificar casos de comillas, `&`, `|`, `%`, `;`, saltos de línea. **Fallar de forma segura** antes que ejecutar comandos arbitrarios.
3. Un job activo bloquea el segundo; terminado libera el lock.
4. Dos inputs con mismo nombre ya existente devuelven `409 NAME_EXISTS`, no borran archivos.
5. Parser detecta Analyst/AgentSpec/Generator/Validator/Evaluator desde líneas exactas conocidas; 4 pasos cuando evaluación off.
6. Parser distingue `exitCode=0`, `1`, `2`, y build correcto + evaluación incompleta.
7. Parser de `90/100`, nombres, rutas de Windows, `Repair2`, evaluaciones y respuestas del juez; no confunde un mensaje `[OK]` del pasado con el estado final.
8. SSE reenvía eventos por `Last-Event-ID`, maneja desconexiones y emite `complete`.
9. Lectura de archivos bloquea `../`, absolutos, symlinks, `.env`, `.build`, `node_modules` y caminos externos a `output/`.
10. `/api/health` jamás retorna el valor de la key ni el objeto `process.env`.
11. Sin BoxLang instalado o sin key, `/api/health` responde y `POST /api/jobs` muestra `NOT_READY`, no causa crash.
12. `inspect --json` válido llena capacidades; inspección fallida **no** falsifica componentes ni cambia exitosamente compilado a fallido.

### 9.2. Prueba frontend

Formulario válido, estado busy, estados de pipeline, consola con eventos reales simulados en unit tests, error 409 con sugerencia de nombre, UI responsive básica, panel de resultados sin puntuación cuando evaluation=false, `EventSource` cerrado en complete/unmount, a11y labels.

### 9.3. PRUEBA MANUAL REAL EN WINDOWS (CRITERIO PARA ENTREGAR)

**Precondiciones:** `boxlang --version` funciona; BX Agents instalado; la sesión de PowerShell tiene `GEMINI_API_KEY`; el usuario ya ha generado agentes exitosamente desde CLI.

```powershell
cd "C:\Users\argue\Documents\Boxlang\agent_factory\studio"
npm install
npm run dev
```

Abrir `http://127.0.0.1:5173`.

- [ ] La pantalla dark/neón carga, sin errores en consola del navegador.
- [ ] `Sistema listo` si BoxLang + clave disponibles.
- [ ] Escribir el siguiente prompt, nombre **no usado** (`StudioDemo_<número>`):

  > Crea un agente para analizar textos. Debe incluir herramientas para contar caracteres y palabras, una skill para revisión textual y un subagente especializado en coherencia y claridad.

- [ ] Dejar `Evaluar` activo y `Reparación IA` desactivada; hacer clic en GENERAR AGENTE.
- [ ] Se crea job real; aparecen logs **en tiempo real** (mientras sigue ejecutándose); se actualizan etapas al llegar las salidas CLI.
- [ ] Se crea en `output/StudioDemo_<número>/` el proyecto real. Aparece `Build correcto (exitCode=0)` y evaluación si Gemini responde.
- [ ] Se ve `agent-spec.json` real con sus 8 campos y capacidades generadas.
- [ ] `inspect --json` detecta categorías `tools`, `skills`, `subagents`, igual que el CLI.
- [ ] Se muestran notas y pruebas reales; si el evaluador falla, la UI dice “evaluación incompleta”.
- [ ] Copiar ruta y comando de invoke funciona; ejecutar en otra terminal:

  ```powershell
  cd "C:\Users\argue\Documents\Boxlang\agent_factory\output\StudioDemo_..."
  boxlang module:bxagents invoke --message="Hola, qué puedes hacer?" --json
  ```

- [ ] Intentar generar el mismo nombre **no sobrescribe** el original y muestra `409 NAME_EXISTS`.
- [ ] Intentar una segunda generación mientras la primera está activa muestra `BUSY` sin lanzar otro proceso.
- [ ] Recargar el navegador con un job activo recupera el estado y vuelve a conectar el streaming sin repetir la generación.
- [ ] Comprobar que `npm run build` y `npm start` sirven la web en `http://127.0.0.1:4317`.
- [ ] Comprobar que `boxlang test-agent-spec.bxs`, `boxlang test-capabilities.bxs`, `boxlang test-repair.bxs`, `boxlang test-repair-ai.bxs` **no se rompieron** (el último consume Gemini).

**No afirmar “todo funcionando” si solo compila React.** La aceptación requiere al menos una ejecución real `POST /api/jobs` → `factory.bxs` → build → resultados. Si en el entorno del codificador no hay BoxLang, entregar los tests y documentar qué falta verificar en la máquina del usuario.

---

## 10. INSTRUCCIONES EXACTAS DE ARRANQUE Y DOCUMENTACIÓN

Crear `studio/README.md` con guía breve para Windows:

### Instalar

```powershell
cd "C:\Users\argue\Documents\Boxlang\agent_factory\studio"
node --version
npm install
```

### API key

Si ya está en la sesión PowerShell, **no hacer nada más**. Si falta, pedirla de forma privada para que el usuario la configure sin imprimirla ni incluirla en comandos versionados. Por ejemplo, indicar las instrucciones seguras que ya constan en `SETUP.md`. No pedir pegar la clave en el formulario ni en el chat.

### Desarrollo

```powershell
npm run dev
# Web: http://127.0.0.1:5173
# API local: http://127.0.0.1:4317/api/health
```

### Producción local

```powershell
npm run build
npm start
# Web + API: http://127.0.0.1:4317
```

### Pruebas

```powershell
npm test
```

### Resolución de problemas

- `BoxLang no detectado`: comprobar `boxlang --version` y `Get-Command boxlang` en la MISMA terminal donde arranca Node.
- `GEMINI_API_KEY no configurada`: cargar en PowerShell que ejecuta `npm run dev`; reiniciar servidor.
- `El proyecto ya existe`: elegir otro nombre; nunca borrar automáticamente output.
- `Gemini timeout/cuota`: se presentan logs reales, permitir volver a probar con nombre nuevo.
- `Build failed`: mostrar diagnostico y posible reparación; no ocultarlo.
- Windows antivirus/firewall y puertos ocupados: mensajes claros.
- No puede inspeccionar manifest: comprobar ruta final y `boxlang module:bxagents inspect --json` desde carpeta generada.

---

## 11. ORDEN DE TRABAJO REQUERIDO PARA OPENCODE

Implementa en orden; **no pases al siguiente bloque dejando el anterior como stub**:

**Fase A — Inspección y backend:**
1. Inspeccionar contrato CLI y archivos existentes.
2. Crear npm workspaces y servidor Express con health.
3. Implementar runner real PowerShell Windows; probar `boxlang factory.bxs --help` como chequeo inicial.
4. Implementar validaciones y job manager con exclusión mutua.
5. Implementar SSE y parser real de logs.
6. Implementar lectura protegida de `agent-spec.json` e `inspect --json`.
7. Tests unitarios de validación/seguridad/parser.

**Fase B — Frontend premium:**
8. Crear app React/Vite/TS y estilos dark/neón.
9. Composer conectado a POST /api/jobs.
10. Pipeline y consola conectados a SSE.
11. Resultados con spec, capacidades, evaluación y acciones reales.
12. Estados de error, empty state, mobile, teclado y reduced motion.

**Fase C — Integración y entrega:**
13. Ejecutar npm install, lint/typecheck si agregados, npm run build, npm test.
14. Probar desde Windows un job de verdad si hay BoxLang/key.
15. Documentar comandos y capturas recomendadas para demo.
16. Informar qué se verificó REALMENTE y qué depende del entorno.

---

## 12. CRITERIOS DE FIN (DEFINITION OF DONE)

La tarea está terminada solo cuando se cumple:

- [ ] `studio/` creado; el core BoxLang original permanece intacto.
- [ ] Interfaz oscura/neón original, excelente visualmente, responsive y accesible.
- [ ] Prompt + nombre + evaluar + AI repair están conectados a backend real.
- [ ] Un clic ejecuta **de verdad** `boxlang factory.bxs` y no simula datos.
- [ ] Logs en vivo y estado de las etapas sincronizados con stdout/stderr real.
- [ ] Se muestran errores, colisiones y fallos con mensajes útiles.
- [ ] Resultado lee proyecto generado, `agent-spec.json` y manifiesto real mediante inspect.
- [ ] Lista tools, skills y subagentes reales cuando BX Agents los reporta.
- [ ] Evaluación orientativa se muestra solo cuando está disponible.
- [ ] No hay exposición de clave API, inyección obvia ni acceso arbitrario al filesystem.
- [ ] `npm run dev`, `npm run build`, `npm start` y `npm test` cumplen lo que prometen.
- [ ] `studio/README.md` explica todo con PowerShell.
- [ ] Existe un reporte final breve de pruebas reales y pendientes, sin exagerar el resultado.

**Nota para la demo:** el diferencial es “Una descripción → AgentSpec → código de agente + tools/skills/subagentes → build → evaluación y posibles reparaciones”. La interfaz es la fachada de una implementación BoxLang auténtica, no una demostración aislada de React.

---

## 13. PROMPT FINAL QUE EL USUARIO PUEDE PEGAR EN OPENCODE

```text
Lee AGENT_FACTORY_STUDIO_OPENCODE.md completo y ejecuta la especificación como una tarea de desarrollo full-stack dentro del repositorio actual. Empieza inspeccionando factory.bxs y lib/ para confirmar el contrato real. Crea la aplicación funcional en studio/ (React/Vite/TS + Express + runner seguro de BoxLang para Windows). No modifiques el core, no simules las respuestas ni el progreso, no borres output/, ni expongas GEMINI_API_KEY. Prioriza el flujo real con logs SSE, resultado/spec/manifest y manejo correcto de errores; después completa el diseño dark/neón de alto nivel. Instala dependencias, ejecuta tests y build, corrige errores y termina indicándome exactamente cómo arrancar la aplicación en PowerShell y qué verificaste de verdad.
```

**FIN DE LA ESPECIFICACIÓN.**

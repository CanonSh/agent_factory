# Agent Factory Studio

Interfaz local para ejecutar el flujo real de `factory.bxs` y consultar sus resultados. Node solo actúa como adaptador HTTP/procesos; la generación, compilación, evaluación y reparación siguen perteneciendo al núcleo BoxLang.

## Requisitos

- Windows PowerShell
- Node.js 20 LTS o superior y npm
- BoxLang disponible como `boxlang` en la misma terminal
- `GEMINI_API_KEY` configurada en esa sesión de PowerShell

La aplicación escucha únicamente en `127.0.0.1`. No está diseñada para una red pública. La clave no se solicita al navegador, no se guarda y nunca se devuelve por la API.

## Desarrollo

```powershell
cd "C:\Users\argue\Documents\Boxlang\agent_factory\studio"
node --version
npm install
npm run dev
```

Abrir `http://127.0.0.1:5173`. La API de salud queda disponible en `http://127.0.0.1:4317/api/health`.

## Producción local

```powershell
npm run build
npm start
```

Abrir `http://127.0.0.1:4317`.

## Pruebas

```powershell
npm test
```

Las pruebas automáticas cubren validación, parser del CLI, exclusión mutua de jobs y rutas de archivos. Para la prueba real, usar un nombre nuevo y este prompt:

> Crea un agente para analizar textos. Debe incluir herramientas para contar caracteres y palabras, una skill para revisión textual y un subagente especializado en coherencia y claridad.

Comprobar que aparecen logs mientras corre `factory.bxs`, que se crea `output/<nombre>/`, que el build y `inspect --json` devuelven datos reales y que los botones copian la ruta y el comando `invoke`. Intentar el mismo nombre debe devolver `NAME_EXISTS`; una segunda generación simultánea debe devolver `BUSY`.

## Diagnóstico

- `BoxLang no detectado`: ejecutar `boxlang --version` y `Get-Command boxlang` en la misma terminal que inicia Node.
- `Falta GEMINI_API_KEY`: configurar la variable en esa terminal y reiniciar el servidor.
- `El proyecto ya existe`: elegir otro nombre; Studio nunca borra ni sobrescribe `output/`.
- Un fallo de build o evaluación se conserva como diagnóstico real, sin mostrar un éxito ficticio.

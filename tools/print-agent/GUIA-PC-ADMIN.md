# Guía para Claude Code en la PC de administración

> Este documento es para el Claude Code instalado **temporalmente** en la PC de administración (Windows).
> Léelo completo antes de ejecutar nada y sigue los pasos en orden.

## Objetivo
Dejar funcionando el **agente local de impresión** (`server.mjs`) para que el panel web de Corrales
imprima en dos impresoras térmicas **3nStar RPT004** (80 mm, ESC/POS, USB + LAN):
- `caja` → boleta con **todos** los productos del pedido.
- `cocina`, `horno`, `barra` → comanda con solo los productos de esa estación (sin precios).
  Si una estación no tiene impresora propia, apunta a la IP de otra (pueden compartir).

## Reglas (obligatorias)
1. Trabaja **solo** dentro de `tools/print-agent/`. No modifiques `src/`, `package.json` ni nada fuera de esa carpeta.
2. **No** leas, copies ni imprimas archivos `.env*`, claves ni tokens del sitio.
3. No instales programas globales sin pedir confirmación al usuario (excepto lo indicado en el paso 1).
4. Antes de cada comando que cambie el sistema (tarea programada, firewall, compartir impresora), explica qué hace en una línea.
5. Si algo falla 2 veces, **detente y pregunta** al usuario. No improvises soluciones largas.
6. Responde siempre en español, con pasos cortos.

## Paso 1 — Verificar Node
```powershell
node --version
```
Debe ser 18 o superior. Si no está instalado, pide al usuario instalar la versión LTS desde nodejs.org y espera.

## Paso 2 — Averiguar cómo está conectada cada impresora
Pregunta al usuario, una por una (impresoras de **caja, cocina, horno y barra**; puede que alguna estación comparta impresora):
- ¿Está conectada por **cable de red (LAN)** o por **USB**?
- Si es LAN: ¿cuál es su IP? Si no la sabe: apagar la impresora, mantener presionado el botón **FEED** y encenderla;
  imprime una hoja de autotest con la IP. (La IP debería ser fija; recomendar reservarla en el router.)
- Si es USB: el nombre con el que aparece en *Configuración → Impresoras y escáneres*.

Prueba de conectividad en LAN:
```powershell
Test-NetConnection -ComputerName <IP> -Port 9100
```
`TcpTestSucceeded : True` significa que se puede imprimir por red.

## Paso 3 — Crear `config.json`
Copia `config.example.json` a `config.json` y edítalo:
- `token`: genera uno aleatorio largo (por ejemplo con `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`)
  y **muéstraselo al usuario**: lo necesitará para la web.
- `allowedOrigins`: pregunta al usuario el dominio del panel (ej. `https://corrales.com`) y déjalo junto a `http://localhost:3000`.
- `columns`: `48` (si el texto sale cortado o con saltos raros, probar `42`).
- `printers.caja`, `printers.cocina`, `printers.horno` y `printers.barra`:
  - **LAN:** `{ "type": "network", "host": "<IP>", "port": 9100 }`
  - **USB (Windows):** primero compartir la impresora (Propiedades de impresora → Compartir, nombre sin espacios, ej. `BOLETA`),
    y usar `{ "type": "windows", "share": "BOLETA" }`. Verificar que existe `\\localhost\BOLETA`.

## Paso 4 — Arrancar y probar
```powershell
cd tools\print-agent
node server.mjs
```
En otra terminal:
```powershell
curl http://localhost:9101/health
```
Debe listar las impresoras configuradas (`caja`, `cocina`, `horno`, `barra`).

Imprime una prueba en **cada** impresora (reemplaza `TOKEN`; para horno/barra cambia `printer` y `station`):
```powershell
$body = '{"printer":"cocina","type":"kitchen","station":"cocina","order":{"order_number":999,"delivery_type":"dine_in","table_label":"1","created_at":"2026-01-01T12:00:00Z","customer_name":"Prueba","customer_notes":"Sin aji","payment_method":"cash","total":25.5,"invoice":null,"items":[{"quantity":2,"product_name":"Pollo a la brasa","variant_label":"1/4","unit_price":10},{"quantity":1,"product_name":"Chicha morada","variant_label":null,"unit_price":5.5}]}}'
Invoke-RestMethod -Uri http://localhost:9101/print -Method Post -ContentType "application/json" -Headers @{ "x-print-token" = "TOKEN" } -Body $body
```
Repite con `"printer":"horno"` / `"barra"` (con su `station`) y con `"printer":"caja","type":"receipt"`.

Pide al usuario que **confirme visualmente** cada ticket:
- ¿Se ven bien las tildes y la ñ?
- ¿El texto cabe sin cortarse? (si no, ajustar `columns`)
- ¿Corta el papel al final?
- ¿Salió en la impresora correcta (cada comanda en su estación, la boleta completa en caja)?

## Paso 5 — Que arranque solo con Windows
Con confirmación del usuario, crear una tarea programada (ajusta la ruta de `node.exe` con `where node`):
```powershell
$action  = New-ScheduledTaskAction -Execute "C:\Program Files\nodejs\node.exe" -Argument "server.mjs" -WorkingDirectory "<RUTA>\tools\print-agent"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "AgenteImpresionCorrales" -Action $action -Trigger $trigger -RunLevel Limited
```
Reiniciar la sesión y comprobar de nuevo `curl http://localhost:9101/health`.

## Paso 6 — Conectar con la web
El agente ya funciona; falta que la web lo use. Indica al usuario (no lo hagas tú) que en el entorno del sitio
agregue estas variables y vuelva a desplegar:
```
NEXT_PUBLIC_PRINT_AGENT_URL=http://localhost:9101
NEXT_PUBLIC_PRINT_AGENT_TOKEN=<el token del paso 3>
```
Luego, desde el panel de administración en **esa misma PC**, abrir un pedido y usar los botones **Comanda** y **Boleta**.

## Problemas frecuentes
| Síntoma | Causa probable |
|---|---|
| El panel dice "No se pudo conectar con el agente" | El agente no está corriendo, o el panel se abre en otra PC (solo funciona en la PC del agente). |
| Error 403 "Origen no permitido" | Falta el dominio del panel en `allowedOrigins`. |
| Error 401 "Token inválido" | El token de la web no coincide con `config.json`. |
| `Tiempo de espera agotado` | IP incorrecta, impresora apagada o en otra red. Repetir `Test-NetConnection`. |
| Imprime símbolos raros | La impresora no usa CP858; probar otra página de códigos en `escpos.mjs` (`ESC t n`). |
| Una impresora USB no imprime | Verificar que esté compartida y que el nombre en `share` sea exacto. |

## Al terminar
1. Resume al usuario: IPs/nombres configurados, ubicación de `config.json`, el token y qué pruebas salieron bien.
2. Recuérdale **cerrar sesión de Claude Code** y desinstalarlo si ya no se necesita. El agente sigue funcionando solo con Node.
3. No hagas commit ni push de `config.json` (contiene el token; ya está en `.gitignore`).

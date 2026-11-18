# Agente de impresión (3nStar RPT004 / ESC-POS)

Corre en la PC de administración y recibe pedidos desde el panel web para imprimirlos
en estas impresoras:
- `caja`: boleta con **todos** los productos.
- `cocina`, `horno`, `barra`: comanda con solo los productos de esa estación (se define por producto en el admin).

Varias estaciones pueden compartir una impresora física: basta repetir la misma IP en `config.json`.

## Instalación
1. Instalar Node 18+ en la PC.
2. Copiar `config.example.json` a `config.json` y editar IPs, `token` y `allowedOrigins`.
   - **Por LAN:** `{ "type": "network", "host": "IP", "port": 9100 }`. La IP sale en la hoja de autotest
     (mantener FEED al encender). Conviene fijarla en el router.
   - **Por USB (Windows):** instalar el driver, compartir la impresora y usar
     `{ "type": "windows", "share": "NombreCompartido" }`.
3. `node server.mjs`. Para que arranque con Windows, crear una tarea programada
   "Al iniciar sesión" que ejecute ese comando.
4. En el `.env.local` de la web: `NEXT_PUBLIC_PRINT_AGENT_URL=http://localhost:9101`
   y `NEXT_PUBLIC_PRINT_AGENT_TOKEN=<mismo token>`.

Prueba: `curl http://localhost:9101/health`

// ─────────────────────────────────────────────────────────────────────────────
//  Mini-backend Vercel — api/[...path].js
//  Catch-all serverless function que replica server.js para producción en Vercel.
//
//  Rutas mockeadas (en memoria, se resetean en cold-start):
//    POST   /api/mis-pedidos
//    GET    /api/admin/reportes/pedidos
//    GET    /api/admin/reportes/pedidos/:id
//    PUT    /api/admin/reportes/pedidos/:id/estado
//    POST   /api/pagos/crear-preferencia
//    POST   /api/pagos/webhook
//
//  Resto → proxy transparente al backend real (Render).
// ─────────────────────────────────────────────────────────────────────────────

const RENDER_BASE = 'https://y2kvault-backend.onrender.com';

// ── Estado en memoria (mock) ──────────────────────────────────────────────────
// Persiste mientras la instancia esté caliente; se resetea en cold-start.
let pedidos = [];
let nextPedId = 1;

// ── Helpers ───────────────────────────────────────────────────────────────────
function decodeJwtPayload(authHeader) {
  const token = (authHeader ?? '').replace(/^Bearer\s+/i, '');
  const parts = token.split('.');
  if (parts.length !== 3) return {};
  try {
    const json = Buffer.from(
      parts[1].replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf8');
    return JSON.parse(json);
  } catch {
    return {};
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  setCors(res);

  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url  = req.url;   // ej. /api/mis-pedidos?foo=bar
  const path = url.split('?')[0]; // solo el pathname
  const method = req.method;

  // ── 1. POST /api/mis-pedidos ─────────────────────────────────────────────
  if (path === '/api/mis-pedidos' && method === 'POST') {
    const claims = decodeJwtPayload(req.headers.authorization);
    const { NumeroYape, CodigoAprobacion, Items = [] } = req.body ?? {};

    const items = Items.map((it) => ({
      varId:    it.VarId,
      cantidad: Number(it.Cantidad ?? it.cantidad ?? 0),
      precio:   Number(it.Precio ?? it.precio ?? 0),
      nombre:   String(it.Nombre ?? it.nombre ?? ''),
      talla:    String(it.Talla  ?? it.talla  ?? ''),
      color:    String(it.Color  ?? it.color  ?? ''),
    }));

    const total = items.reduce(
      (sum, it) => sum + it.precio * it.cantidad,
      0
    );

    const pedido = {
      pedId:             nextPedId++,
      cliente: {
        cli_nombre:   claims.cli_nombre   || claims.nombre      || '',
        cli_apellido: claims.cli_apellido || claims.apellido    || '',
      },
      email:            claims.cli_email || claims.email || claims.unique_name || '',
      pedEstado:        'pendiente',
      pedTotal:         total,
      pedFechaCompra:   new Date().toISOString(),
      pedFechaEntrega:  '',
      metodoPago:       'Yape',
      numeroYape:       NumeroYape        ?? '',
      codigoAprobacion: CodigoAprobacion  ?? '',
      direccionEnvio:   '',
      items,
    };

    pedidos.push(pedido);
    return res.status(201).json({ success: true, pedId: pedido.pedId });
  }

  // ── 2. GET /api/admin/reportes/pedidos ───────────────────────────────────
  if (path === '/api/admin/reportes/pedidos' && method === 'GET') {
    return res.json(pedidos);
  }

  // ── 3. GET /api/admin/reportes/pedidos/:id ───────────────────────────────
  const pedDetailMatch = path.match(/^\/api\/admin\/reportes\/pedidos\/(\d+)$/);
  if (pedDetailMatch && method === 'GET') {
    const id  = Number(pedDetailMatch[1]);
    const ped = pedidos.find((p) => p.pedId === id);
    if (!ped) return res.status(404).json({ message: 'Pedido no encontrado' });
    return res.json(ped);
  }

  // ── 4. PUT /api/admin/reportes/pedidos/:id/estado ────────────────────────
  const pedEstadoMatch = path.match(/^\/api\/admin\/reportes\/pedidos\/(\d+)\/estado$/);
  if (pedEstadoMatch && method === 'PUT') {
    const id  = Number(pedEstadoMatch[1]);
    const ped = pedidos.find((p) => p.pedId === id);
    if (!ped) return res.status(404).json({ message: 'Pedido no encontrado' });
    ped.pedEstado = req.body?.PedEstado ?? ped.pedEstado;
    return res.json({ success: true, pedId: id, pedEstado: ped.pedEstado });
  }

  // ── 5. POST /api/pagos/crear-preferencia ────────────────────────────────
  if (path === '/api/pagos/crear-preferencia' && method === 'POST') {
    const { Items = [] } = req.body ?? {};
    const monto = Items.reduce(
      (sum, it) => sum + Number(it.precio ?? it.Precio ?? 0) * Number(it.cantidad ?? it.Cantidad ?? 0),
      0
    );
    const preferenceId = `PREF-VERCEL-${Date.now()}`;
    const protocol = req.headers['x-forwarded-proto'] ?? 'https';
    const host     = req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost';

    return res.status(201).json({
      preferenceId,
      monto,
      initPoint: `${protocol}://${host}/api/pagos/checkout/${preferenceId}`,
    });
  }

  // ── 6. POST /api/pagos/webhook ──────────────────────────────────────────
  if (path === '/api/pagos/webhook' && method === 'POST') {
    const { estado, pedidoId } = req.body ?? {};

    if (estado !== 'aprobado') {
      return res.json({ success: true, procesado: false });
    }

    const ped = pedidos.find((p) => p.pedId === Number(pedidoId));
    if (!ped) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    ped.pedEstado = 'aceptado';
    return res.json({ success: true, procesado: true, pedId: ped.pedId, pedEstado: ped.pedEstado });
  }

  // ── 7. PROXY → Backend real (Render) ────────────────────────────────────
  const target = `${RENDER_BASE}${url}`;

  try {
    const proxyHeaders = {};
    if (req.headers.authorization)   proxyHeaders['authorization']  = req.headers.authorization;
    if (req.headers['content-type']) proxyHeaders['content-type']   = req.headers['content-type'];

    const hasBody =
      !['GET', 'HEAD'].includes(method) &&
      req.body !== undefined &&
      req.body !== null &&
      Object.keys(req.body).length > 0;

    const upstream = await fetch(target, {
      method,
      headers: proxyHeaders,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();
    res.status(upstream.status);

    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);

    return res.send(text);
  } catch (err) {
    console.error(`❌ Proxy error → ${target}:`, err);
    return res.status(502).json({
      message: 'Error en el proxy hacia el backend real',
      error:   String(err),
    });
  }
}

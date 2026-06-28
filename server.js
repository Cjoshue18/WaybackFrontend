// ─────────────────────────────────────────────────────────────────────────────
//  Servidor local híbrido de Wayback
//  • Rutas mockeadas en memoria: perfil, direcciones y pedidos (desarrollo offline).
//  • Cualquier otra ruta /api/* se proxea al backend real (catálogo, productos…).
//
//  Apunta el frontend aquí con VITE_API_BASE=http://localhost:3000 (ver .env.local).
//  Arranque: node server.js   |   en paralelo con Vite: npm run dev:full
// ─────────────────────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';

const PORT = 3000;

// Backend real de Joshue al que se proxean las rutas no mockeadas.
// Configurable con BACKEND_URL; por defecto, el de producción.
const BACKEND_URL = process.env.BACKEND_URL ?? 'https://y2kvault-backend.onrender.com';

// ── Base de datos en memoria (mock, se reinicia al reiniciar el server) ──────
let perfil = {
  cliNombre: 'Mathias',
  cliApellido: 'Ticona',
  usuUsername: 'mathias29',
  usuEmail: 'mathias.ticona@urp.edu.pe',
  cliTelefono: '941197623',
};

let direcciones = [
  {
    dirId: 1,
    DirCalle: 'Av. Benavides 5440',
    DirDistrito: 'Santiago de Surco',
    DirProvincia: 'Lima',
    DirDepartamento: 'Lima',
    DirReferencia: 'Frente a la URP',
    DirPreferido: true,
  },
];

let pedidos = [];

// Secuencias para IDs autoincrementales.
let nextDirId = 2;
let nextPedId = 1;

const app = express();
app.use(cors());
app.use(express.json());

// ── PERFIL ───────────────────────────────────────────────────────────────────
app.get('/api/profile/mi-perfil', (_req, res) => {
  res.json(perfil);
});

app.put('/api/profile/mi-perfil', (req, res) => {
  // Solo sobreescribimos las claves enviadas, conservando el resto.
  perfil = { ...perfil, ...req.body };
  res.json(perfil);
});

// ── DIRECCIONES ────────────────────────────────────────────────────────────--
app.get('/api/profile/direcciones', (_req, res) => {
  res.json(direcciones);
});

app.post('/api/profile/direcciones', (req, res) => {
  const nueva = { dirId: nextDirId++, ...req.body };
  // Una sola dirección preferida a la vez.
  if (nueva.DirPreferido) direcciones.forEach((d) => { d.DirPreferido = false; });
  direcciones.push(nueva);
  res.status(201).json(nueva);
});

app.put('/api/profile/direcciones/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = direcciones.findIndex((d) => d.dirId === id);
  if (idx === -1) return res.status(404).json({ message: 'Dirección no encontrada' });
  if (req.body.DirPreferido) direcciones.forEach((d) => { d.DirPreferido = false; });
  direcciones[idx] = { ...direcciones[idx], ...req.body, dirId: id };
  res.json(direcciones[idx]);
});

app.delete('/api/profile/direcciones/:id', (req, res) => {
  const id = Number(req.params.id);
  direcciones = direcciones.filter((d) => d.dirId !== id);
  res.status(204).end();
});

// ── PEDIDOS (cliente) ──────────────────────────────────────────────────────--
app.post('/api/mis-pedidos', (req, res) => {
  const { dirId, NumeroYape, CodigoAprobacion, Items = [] } = req.body ?? {};
  const dir = direcciones.find((d) => d.dirId === Number(dirId));

  const pedido = {
    pedId: nextPedId++,
    // Estructura que entiende el parser de AdminOrders (cliente puede ser objeto).
    cliente: { cliNombre: perfil.cliNombre, cliApellido: perfil.cliApellido },
    email: perfil.usuEmail,
    pedEstado: 'pendiente',
    pedTotal: 0, // El payload del checkout no envía precios; total nominal en el mock.
    pedFechaCompra: new Date().toISOString(),
    pedFechaEntrega: '',
    metodoPago: 'Yape',
    numeroYape: NumeroYape ?? '',
    codigoAprobacion: CodigoAprobacion ?? '',
    direccionEnvio: dir ? dir.DirCalle : '',
    items: Items.map((it) => ({
      varId: it.VarId,
      cantidad: it.Cantidad,
      precio: 0,
      nombre: '',
      talla: '',
      color: '',
    })),
  };

  pedidos.push(pedido);
  res.status(201).json({ success: true, pedId: pedido.pedId });
});

// ── ADMIN: REPORTES DE PEDIDOS ─────────────────────────────────────────────--
app.get('/api/admin/reportes/pedidos', (_req, res) => {
  res.json(pedidos);
});

// Detalle individual (usado por el modal de AdminOrders).
app.get('/api/admin/reportes/pedidos/:id', (req, res) => {
  const id = Number(req.params.id);
  const ped = pedidos.find((p) => p.pedId === id);
  if (!ped) return res.status(404).json({ message: 'Pedido no encontrado' });
  res.json(ped);
});

app.put('/api/admin/reportes/pedidos/:id/estado', (req, res) => {
  const id = Number(req.params.id);
  const ped = pedidos.find((p) => p.pedId === id);
  if (!ped) return res.status(404).json({ message: 'Pedido no encontrado' });
  ped.pedEstado = req.body.PedEstado ?? ped.pedEstado;
  res.json({ success: true, pedId: id, pedEstado: ped.pedEstado });
});

// ── PASARELA DE PAGO (mock tipo Mercado Pago) ──────────────────────────────--
// Crea una "preferencia" de pago: calcula el monto y devuelve un id + URL simulada.
app.post('/api/pagos/crear-preferencia', (req, res) => {
  const { Items = [] } = req.body ?? {};

  // Monto real a partir de los ítems enviados (precio * cantidad).
  const monto = Items.reduce(
    (sum, it) => sum + Number(it.precio ?? it.Precio ?? 0) * Number(it.cantidad ?? it.Cantidad ?? 0),
    0,
  );

  const preferenceId = `PREF-MOCK-${Date.now()}`;

  res.status(201).json({
    preferenceId,
    monto,
    // URL de redirección simulada (en una pasarela real abriría el checkout).
    initPoint: `http://localhost:${PORT}/api/pagos/checkout/${preferenceId}`,
  });
});

// Webhook: la "pasarela" notifica el resultado del pago. Si fue aprobado,
// marca el pedido como aceptado automáticamente.
app.post('/api/pagos/webhook', (req, res) => {
  const { estado, pedidoId } = req.body ?? {};

  if (estado !== 'aprobado') {
    console.log(`🔔 Webhook recibido: pago NO aprobado (estado="${estado}") para pedido #${pedidoId}.`);
    return res.json({ success: true, procesado: false });
  }

  const ped = pedidos.find((p) => p.pedId === Number(pedidoId));
  if (!ped) {
    console.warn(`⚠️  Webhook: pedido #${pedidoId} no encontrado.`);
    return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
  }

  ped.pedEstado = 'aceptado';
  console.log(`✅ Webhook: pago aprobado → pedido #${pedidoId} cambiado a "aceptado" automáticamente.`);
  res.json({ success: true, procesado: true, pedId: ped.pedId, pedEstado: ped.pedEstado });
});

// ── PROXY HÍBRIDO ──────────────────────────────────────────────────────────--
// Cualquier ruta no mockeada (productos, categorías, estilos, auth…) se reenvía
// intacta al backend real. Va al final: solo entra lo que no atendió una ruta previa.
app.use(async (req, res) => {
  const target = `${BACKEND_URL}${req.originalUrl}`;
  try {
    const headers = {};
    if (req.headers.authorization) headers.authorization = req.headers.authorization;
    if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];

    const tieneBody = !['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0;

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: tieneBody ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();
    res.status(upstream.status);
    const ct = upstream.headers.get('content-type');
    if (ct) res.set('content-type', ct);
    res.send(text);
  } catch (err) {
    console.error(`❌ Proxy error → ${target}:`, err);
    res.status(502).json({ message: 'Error en el proxy hacia el backend real', error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor híbrido Wayback en http://localhost:${PORT}`);
  console.log(`   • Mock local: perfil, direcciones, pedidos`);
  console.log(`   • Proxy → ${BACKEND_URL} (resto de rutas)`);
});

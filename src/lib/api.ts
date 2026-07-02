// Backend de producción en Render — conexión directa, sin proxy intermedio.
export const API_BASE = 'https://y2kvault-backend.onrender.com';

// ── INTERFACES EXISTENTES ──
export interface CategoriaApi {
  catID?: number; cat_id?: number;
  catNombre?: string; cat_nombre?: string;
}

export interface Categoria {
  cat_id: number;
  cat_nombre: string;
}

export interface EstiloApi {
  estID?: number;
  estNombre?: string;
  est_id?: number;
  est_nombre?: string;
}

export interface Estilo {
  est_id: number;
  est_nombre: string;
}

// [P8 FIX] Ampliamos ClienteApi.usuario para incluir usuUsername y usuId
export interface ClienteApi {
  cli_id?: number;
  cliId?: number;
  id?: number;

  cli_nombre?: string;
  cliNombre?: string;
  nombre?: string;

  cli_apellido?: string;
  cliApellido?: string;
  apellido?: string;

  cli_email?: string;
  cliEmail?: string;
  email?: string;

  cli_documento_tipo?: string;
  cliTipoDocumento?: string;

  cli_documento?: string;
  cliDocumento?: string;

  cli_fecha_registro?: string;
  cliFechaRegistro?: string;
  fecha_registro?: string;

  // Campos raíz que puede devolver el login
  usuUsername?: string;
  usuEmail?: string;
  cliTelefono?: string | null;
  rol?: string;

  usuario?: {
    usuId?: number;
    usuEmail?: string;
    usuUsername?: string;
    usuFechaRegistro?: string;
  };
}

export interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_documento_tipo: string;
  cli_documento: string;
  cli_fecha_registro: string;
}

// ── INTERFACES PARA PRODUCTOS (ENRIQUECIDAS) ──
export interface ProductoApi {
  pro_id?: number; proID?: number; id?: number;
  pro_nombre?: string; proNombre?: string; nombre?: string; name?: string;
  pro_precio?: number; proPrecio?: number; precio?: number; price?: number;
  pro_precio_original?: number; precioOriginal?: number; originalPrice?: number;
  proDescuento?: number; pro_descuento?: number;
  proDescuentoInicio?: string; pro_descuento_inicio?: string;
  proDescuentoFin?: string; pro_descuento_fin?: string;
  pro_imagen?: string; proImagen?: string; imagen?: string; image?: string; image_url?: string; imageUrl?: string; urlImagen?: string; proImagenUrl?: string; foto?: string; proFoto?: string;
  pro_imagen_alternativa?: string; proImagenHover?: string; hoverImage?: string;
  badge?: string;
  pro_sexo?: string; sexo?: string; genero?: string; proSexo?: string;
  pro_tallas?: string | string[]; tallas?: string[];
  pro_colores?: string | number[]; colors?: number[];
  pro_stock?: number; inStock?: boolean; stock?: number;
  categoria?: string | number; categoriaId?: number; catId?: number; cat_id?: number; pro_categoria?: string | number; proCategoria?: string | number;
}

export interface ProductoVariante {
  varId: number;
  varTalla: string;
  colorNombre: string;
  colorHex: string;
  varStock: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sexo: string;
  tallas: string[];
  colors: (number | string)[];
  inStock: boolean;
  originalPrice?: number;
  hoverImage?: string;
  badge?: string;
  categoria?: string | number;
  proDescuento?: number;
  proDescuentoInicio?: string;
  proDescuentoFin?: string;
  variantes?: ProductoVariante[];
}

export interface RegisterData {
  Email: string;
  NombreUsuario: string;
  Contrasena: string;
  Nombres: string;
  Apellidos: string;
  TipoDocumento: string;
  Documento: string;
}

// ── INTERFACES PARA FILTROS COMBINADOS ──
// categoria/estilo/color/talla aceptan selección múltiple → se envían como llaves repetidas
// en el query string (?color=rojo&color=verde). genero es de selección única.
export interface FilterOptions {
  categoria?: (string | number)[];
  estilo?: (string | number)[];
  color?: string[];
  talla?: string[];
  genero?: string;
  stock?: boolean;
  precioMin?: number;
  precioMax?: number;
}

// [P5 FIX] Interfaces para el CRUD de Direcciones
export interface DireccionApi {
  dirId?: number;
  DirId?: number;
  dirCalle?: string;
  DirCalle?: string;
  dirDistrito?: string;
  DirDistrito?: string;
  dirProvincia?: string;
  DirProvincia?: string;
  dirDepartamento?: string;
  DirDepartamento?: string;
  dirReferencia?: string;
  DirReferencia?: string;
  dirPreferido?: boolean;
  DirPreferido?: boolean;
}

export interface Direccion {
  dirId: number;
  dirCalle: string;
  dirDistrito: string;
  dirProvincia: string;
  dirDepartamento: string;
  dirReferencia: string;
  dirPreferido: boolean;
}

export interface DireccionPayload {
  DirCalle: string;
  DirDistrito: string;
  DirProvincia: string;
  DirDepartamento: string;
  DirReferencia: string;
  DirPreferido: boolean;
}

// [P6 FIX] Interfaz para actualización de perfil
export interface UpdatePerfilData {
  cliNombre: string;
  cliApellido: string;
  usuUsername: string;
  usuEmail: string;
  cliTelefono: string | null;
  cliTipoDocumento?: string;
  cliDocumento?: string;
}

// [P2 FIX] Tipamos la respuesta del login correctamente
export interface LoginApiResponse {
  tokenJWT?: string;
  token?: string;
  rol?: string;
  cliNombre?: string;
  cliApellido?: string;
  cliTipoDocumento?: string;
  cliDocumento?: string;
  cliTelefono?: string | null;
  usuUsername?: string;
  usuEmail?: string;
  id?: number;
  usuId?: number;
  tipoDocumento?: string;
  dni?: string;
  documento?: string;
  document?: string;
  nroDocumento?: string;
  numeroDocumento?: string;
  documentNumber?: string;
}

// ── MÉTODO POST: REGISTRAR CLIENTE NUEVO ──
export async function registerClienteApi(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  const url = `${API_BASE}/api/auth/register-cliente`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // [DNI FIX] El backend usa convención cli*/usu* en TODOS los demás endpoints
      // (login, perfil). Las claves planas (sin prefijo) que se enviaban antes no
      // calzaban con el DTO real, así que el documento nunca llegaba a guardarse.
      body: JSON.stringify({
        Email:          data.Email,
        NombreUsuario:  data.NombreUsuario,
        Contrasena:     data.Contrasena,
        Nombres:        data.Nombres,
        Apellidos:      data.Apellidos,
        TipoDocumento:  data.TipoDocumento,
        Documento:      data.Documento,
      }),
    });

    const contentType = res.headers.get('content-type');
    let errorMessage = 'Error en el registro.';

    if (contentType && contentType.includes('application/json')) {
      const result = await res.json();
      errorMessage = result.message || errorMessage;
    } else {
      const textError = await res.text();
      errorMessage = textError || errorMessage;
    }

    if (!res.ok) return { success: false, error: errorMessage };
    return { success: true };
  } catch {
    return { success: false, error: 'No se pudo establecer conexión con el servidor de registro.' };
  }
}

// ── PARSERS / MAPEADORES ──
const parseCategoria = (item: CategoriaApi): Categoria => ({
  cat_id: Number(item.catID ?? item.cat_id ?? 0),
  cat_nombre: String(item.catNombre ?? item.cat_nombre ?? ''),
});

const parseEstilo = (item: EstiloApi): Estilo => ({
  est_id: Number(item.estID ?? item.est_id ?? 0),
  est_nombre: String(item.estNombre ?? item.est_nombre ?? ''),
});

const parseCliente = (item: ClienteApi): Cliente => ({
  cli_id: Number(item.cliId ?? item.cli_id ?? item.id ?? 0),
  cli_nombre: String(item.cliNombre ?? item.cli_nombre ?? item.nombre ?? ''),
  cli_apellido: String(item.cliApellido ?? item.cli_apellido ?? item.apellido ?? ''),
  cli_email: String(item.usuario?.usuEmail ?? item.cliEmail ?? item.email ?? ''),
  cli_documento_tipo: String(item.cliTipoDocumento ?? item.cli_documento_tipo ?? 'DNI'),
  cli_documento: String(item.cliDocumento ?? item.cli_documento ?? ''),
  cli_fecha_registro: String(
    item.usuario?.usuFechaRegistro ??
    item.cliFechaRegistro ??
    item.fecha_registro ??
    ''
  ),
});

// [P5 FIX] Parser para Direccion
// [P5 FIX] Parser para Direccion totalmente insensible a variaciones de llaves
const parseDireccion = (item: DireccionApi): Direccion => {
  const obj: Record<string, any> = {};
  if (item && typeof item === 'object') {
    Object.keys(item).forEach(key => { obj[key.toLowerCase()] = (item as any)[key]; });
  }

  return {
    dirId: Number(obj['dirid'] ?? obj['dir_id'] ?? obj['id'] ?? obj['direccionid'] ?? 0),
    dirCalle: String(obj['dircalle'] ?? obj['dir_calle'] ?? obj['calle'] ?? ''),
    dirDistrito: String(obj['dirdistrito'] ?? obj['dir_distrito'] ?? obj['distrito'] ?? ''),
    dirProvincia: String(obj['dirprovincia'] ?? obj['dir_provincia'] ?? obj['provincia'] ?? ''),
    dirDepartamento: String(obj['dirdepartamento'] ?? obj['dir_departamento'] ?? obj['departamento'] ?? ''),
    dirReferencia: String(obj['dirreferencia'] ?? obj['dir_referencia'] ?? obj['referencia'] ?? ''),
    dirPreferido: Boolean(obj['dirpreferido'] ?? obj['dir_preferido'] ?? obj['preferido'] ?? false),
  };
};

// 🎯 Parser de productos insensible a mayúsculas/minúsculas
const parseProducto = (item: any): Product => {
  const obj: Record<string, any> = {};
  if (item && typeof item === 'object') {
    Object.keys(item).forEach(key => { obj[key.toLowerCase()] = item[key]; });
  }

  let listaTallas: string[] = [];
  const rawTallas = obj['tallas'] ?? obj['pro_tallas'] ?? obj['protallas'] ?? [];
  const rawVariantes = obj['variantes'] ?? [];

  if (Array.isArray(rawTallas) && rawTallas.length > 0) {
    listaTallas = rawTallas.map((t: any) => {
      if (t && typeof t === 'object') return String(t.talnombre ?? t.nombre ?? t.talla ?? '');
      return String(t);
    });
  } else if (Array.isArray(rawVariantes) && rawVariantes.length > 0) {
    const tallasSet = new Set<string>();
    rawVariantes.forEach((v: any) => {
      if (v && (v.var_talla || v.vartalla)) tallasSet.add(String(v.var_talla ?? v.vartalla));
    });
    listaTallas = Array.from(tallasSet);
  } else if (typeof rawTallas === 'string' && rawTallas.trim() !== '') {
    listaTallas = rawTallas.split(',');
  }

  listaTallas = listaTallas
    .map((s: string) => s.trim().toUpperCase())
    .filter((s: string) => s !== '');

  // Variantes con detalle de talla/color/stock para la vista previa (varId, varTalla, colorNombre, colorHex, varStock)
  let listaVariantes: ProductoVariante[] = [];
  if (Array.isArray(rawVariantes)) {
    listaVariantes = rawVariantes
      .filter((v: any) => v && typeof v === 'object')
      .map((v: any) => ({
        varId: Number(v.varId ?? v.var_id ?? 0),
        varTalla: String(v.varTalla ?? v.var_talla ?? v.vartalla ?? '').trim().toUpperCase(),
        colorNombre: String(v.colorNombre ?? v.color_nombre ?? v.var_color ?? ''),
        colorHex: String(v.colorHex ?? v.color_hex ?? '').trim().toUpperCase(),
        varStock: Number(v.varStock ?? v.var_stock ?? 0),
      }));
  }

  let listaColores: string[] = [];
  const rawColores = obj['colores'] ?? obj['pro_colores'] ?? obj['procolores'] ?? [];

  if (Array.isArray(rawColores)) {
    listaColores = rawColores.map((c: any) => String(c).trim().toUpperCase());
  } else if (Array.isArray(rawVariantes)) {
    const coloresSet = new Set<string>();
    rawVariantes.forEach((v: any) => {
      if (v && v.var_color) coloresSet.add(String(v.var_color).trim().toUpperCase());
    });
    listaColores = Array.from(coloresSet);
  }

  // [P3 FIX] Unificamos finalId y safeId en una sola variable
  const finalId = Number(obj['pro_id'] ?? obj['proid'] ?? obj['id'] ?? 0);
  const safeId = finalId !== 0 ? finalId : Math.floor(Math.random() * 999999 + 100);

  let finalImage = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500';
  const rawImagesArray = obj['imagenesurl'] ?? obj['imagenes_url'] ?? [];
  if (Array.isArray(rawImagesArray) && rawImagesArray.length > 0) {
    finalImage = String(rawImagesArray[0]).trim().replace(/\\/g, '/');
  }

  return {
    id: safeId,
    name: String(obj['pro_nombre'] ?? obj['pronombre'] ?? obj['nombre'] ?? 'Prenda Wayback'),
    price: Number(obj['pro_precio'] ?? obj['proprecio'] ?? obj['precio'] ?? 0),
    originalPrice: obj['originalprice'] ?? undefined,
    image: finalImage,
    sexo: String(obj['pro_sexo'] ?? obj['sexo'] ?? 'unisex').toLowerCase(),
    tallas: listaTallas,
    colors: listaColores,
    inStock: typeof obj['instock'] === 'boolean' ? obj['instock'] : true,
    categoria: obj['categoria'] ?? '',
    proDescuento: obj['prodescuento'] !== undefined ? Number(obj['prodescuento']) : undefined,
    proDescuentoInicio: obj['prodescuentoinicio'] ?? undefined,
    proDescuentoFin: obj['prodescuentofin'] ?? undefined,
    variantes: listaVariantes,
  };
};

// ── FUNCIÓN BASE FETCH CON INYECCIÓN DE TOKEN ──
// [P7 FIX] Content-Type solo se inyecta si hay body
export async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('wayback_auth_token');

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Solo agregar Content-Type si hay body en la petición
  if (options.body !== undefined && options.body !== null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let detail = '';
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          detail = json.message ?? json.error ?? json.title ?? JSON.stringify(json);
        } catch {
          detail = text;
        }
      }
    } catch {
      // sin body legible, seguimos con el mensaje genérico
    }
    throw new Error(`HTTP Error: ${res.status} en la ruta ${url}${detail ? ` — ${detail}` : ''}`);
  }
  if (res.status === 204) return {} as T;

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── MÉTODOS DE CATEGORÍAS ──
export async function getCategorias(): Promise<Categoria[]> {
  const url = `${API_BASE}/api/categorias`;
  const data = await fetchJson<CategoriaApi[]>(url);
  return Array.isArray(data) ? data.map(parseCategoria) : [];
}

// ── MÉTODOS DE ESTILOS ──
export async function getEstilos(): Promise<Estilo[]> {
  const url = `${API_BASE}/api/estilos`;
  const data = await fetchJson<EstiloApi[]>(url);
  return Array.isArray(data) ? data.map(parseEstilo) : [];
}

export async function createEstilo(estilo: { est_nombre: string }): Promise<Estilo> {
  const url = `${API_BASE}/api/estilos`;
  const data = await fetchJson<EstiloApi>(url, {
    method: 'POST',
    body: JSON.stringify({ est_nombre: estilo.est_nombre })
  });
  return parseEstilo(data);
}

export async function updateEstilo(id: number, estilo: { est_nombre: string }): Promise<Estilo> {
  const url = `${API_BASE}/api/estilos/${id}`;
  const data = await fetchJson<EstiloApi>(url, {
    method: 'PUT',
    body: JSON.stringify({ est_nombre: estilo.est_nombre })
  });
  return parseEstilo(data);
}

export async function deleteEstilo(id: number): Promise<void> {
  const url = `${API_BASE}/api/estilos/${id}`;
  await fetchJson(url, { method: 'DELETE' });
}

// ── MÉTODOS DE CLIENTES ──
export async function getClientes(): Promise<Cliente[]> {
  const url = `${API_BASE}/api/admin/reportes/clientes`;
  const data = await fetchJson<any[]>(url);
  return Array.isArray(data) ? data.map(parseCliente) : [];
}

export async function updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
  const url = `${API_BASE}/api/admin/reportes/clientes/${id}`;
  const bodyPayload = {
    CliNombre: cliente.cli_nombre ?? '',
    CliApellido: cliente.cli_apellido ?? '',
    UsuUsername: cliente.cli_email?.split('@')[0] ?? '',
    UsuEmail: cliente.cli_email ?? '',
  };
  return await fetchJson<Cliente>(url, { method: 'PUT', body: JSON.stringify(bodyPayload) });
}

// [P4 FIX] deleteCliente ahora usa fetchJson en lugar de duplicar la lógica de auth
export async function deleteCliente(id: number): Promise<void> {
  const url = `${API_BASE}/api/admin/reportes/clientes/${id}`;
  await fetchJson(url, { method: 'DELETE' });
}

// ── MÉTODOS DE PERFIL ──

// ── GET PERFIL DEL USUARIO AUTENTICADO ──
export async function getMiPerfilApi() {
  const url = `${API_BASE}/api/profile/mi-perfil`;
  return await fetchJson<ClienteApi>(url);
}

// [P6 FIX] Función para actualizar el perfil del usuario autenticado
export async function updatePerfilApi(data: UpdatePerfilData): Promise<void> {
  const url = `${API_BASE}/api/profile/mi-perfil`;
  await fetchJson<void>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}



// ── MÉTODOS CRUD DE DIRECCIONES ──

// [P5 FIX] GET todas las direcciones del usuario autenticado
export async function getDireccionesApi(): Promise<Direccion[]> {
  const url = `${API_BASE}/api/profile/direcciones`;
  const data = await fetchJson<DireccionApi[]>(url);
  return Array.isArray(data) ? data.map(parseDireccion) : [];
}

// [P5 FIX] POST crear nueva dirección
export async function createDireccionApi(payload: DireccionPayload): Promise<Direccion> {
  const url = `${API_BASE}/api/profile/direcciones`;
  const data = await fetchJson<DireccionApi>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseDireccion(data);
}

// [P5 FIX] PUT actualizar dirección existente por ID
export async function updateDireccionApi(id: number, payload: DireccionPayload): Promise<Direccion> {
  const url = `${API_BASE}/api/profile/direcciones/${id}`;
  const data = await fetchJson<DireccionApi>(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return parseDireccion(data);
}

// [P5 FIX] DELETE eliminar dirección por ID
export async function deleteDireccionApi(id: number): Promise<void> {
  const url = `${API_BASE}/api/profile/direcciones/${id}`;
  await fetchJson(url, { method: 'DELETE' });
}

// ── MAPEO INTERNO PARA RESOLVER IDs DE CATEGORÍAS ──
// [P1 FIX] Eliminada la declaración duplicada del módulo; solo existe dentro de getProductos

// ── MÉTODO DE PRODUCTOS ──
export async function getProductos(filtros?: FilterOptions): Promise<Product[]> {
  try {
    const url = new URL(`${API_BASE}/api/productos`);

    const MAPA_CATEGORIAS_IDS: Record<string, number> = {
      'pantalon': 1,
      'falda': 2,
      'shorts': 3,
      'jogger': 4,
      'camisetas': 5,
      'sueteres': 6,
      'chaquetas': 7,
      'sets-baggy': 8, 'sets baggy': 8,
      'sets-denim': 9, 'sets denim': 9,
      'sets-deportivos': 10, 'sets deportivos': 10,
      'sets-tejidos': 11, 'sets tejidos': 11
    };

    if (filtros) {
      filtros.categoria?.forEach((cat) => {
        if (cat === undefined || cat === '') return;
        const catKey = String(cat).toLowerCase().trim();
        const numericId = MAPA_CATEGORIAS_IDS[catKey] ?? cat;
        url.searchParams.append('categoria', String(numericId));
      });
      filtros.estilo?.forEach((est) => {
        if (est === undefined || est === '') return;
        url.searchParams.append('estilo', String(est));
      });
      filtros.color?.forEach((c) => {
        if (!c) return;
        url.searchParams.append('color', c);
      });
      filtros.talla?.forEach((t) => {
        if (!t) return;
        url.searchParams.append('talla', t);
      });
      if (filtros.genero !== undefined && filtros.genero !== '') {
        const genVal = String(filtros.genero).toLowerCase().trim();
        url.searchParams.append('genero', genVal);
      }
      if (filtros.stock) {
        url.searchParams.append('stock', 'true');
      }
      if (filtros.precioMin !== undefined) {
        url.searchParams.append('precioMin', filtros.precioMin.toString());
      }
      if (filtros.precioMax !== undefined) {
        url.searchParams.append('precioMax', filtros.precioMax.toString());
      }
    }

    console.log(`📡 [Wayback API Request]: ${url.pathname}${url.search}`);
    const data = await fetchJson<any[]>(url.toString());
    return Array.isArray(data) ? data.map(parseProducto) : [];
  } catch (error) {
    console.error('Error crítico en la consulta unificada de productos:', error);
    return [];
  }
}

export async function getProductosPorCategoria(categoryId: number | string): Promise<Product[]> {
  return getProductos({ categoria: [categoryId] });
}

// El listado /api/productos no incluye variantes (varId); el detalle /api/productos/{id} sí.
// Se usa al abrir la vista previa para poder facturar con el VarId correcto.
export async function getProductoDetalle(id: number | string): Promise<Product | null> {
  try {
    const data = await fetchJson<any>(`${API_BASE}/api/productos/${id}`);
    return data ? parseProducto(data) : null;
  } catch (error) {
    console.error('Error al obtener el detalle del producto:', error);
    return null;
  }
}

// ── PEDIDOS (Checkout) ──
// Campos obligatorios validados por el backend (.NET DTO):
//   NumeroYape: exactamente 9 dígitos
//   CodigoAprobacion: exactamente 6 dígitos
export interface CrearPedidoPayload {
  dirId: number;
  NumeroYape: string;
  CodigoAprobacion: string;
  Items: {
    VarId: number;
    Cantidad: number;
  }[];
}

export async function crearPedido(payload: CrearPedidoPayload): Promise<{ success: boolean; pedId?: number; error?: string }> {
  try {
    const data = await fetchJson<{ pedId?: number; PedId?: number }>(`${API_BASE}/api/mis-pedidos`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, pedId: data?.pedId ?? data?.PedId };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'No se pudo confirmar el pedido.' };
  }
}

export interface PedidoHistorial {
  id: number;
  estado: string;
  total: number;
  fechaCompra: string;
}

export async function getMisPedidos(): Promise<PedidoHistorial[]> {
  try {
    const data = await fetchJson<any[]>(`${API_BASE}/api/mis-pedidos`);
    return Array.isArray(data) ? data.map(p => ({
      id: Number(p.PedId ?? p.pedId ?? p.ped_id ?? 0),
      estado: String(p.PedEstado ?? p.pedEstado ?? p.ped_estado ?? 'Pendiente'),
      total: Number(p.PedTotal ?? p.pedTotal ?? p.ped_total ?? 0),
      fechaCompra: String(p.PedFechaCompra ?? p.pedFechaCompra ?? p.ped_fecha_compra ?? ''),
    })) : [];
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return [];
  }
}

// ── ADMIN: REPORTES DE PEDIDOS (reconciliación manual de Yape) ──
export const ESTADOS_PEDIDO = ['pendiente', 'aceptado', 'rechazado', 'cancelado', 'entregado'] as const;
export type EstadoPedido = typeof ESTADOS_PEDIDO[number];

export interface PedidoAdminItem {
  varId: number;
  nombre: string;
  talla: string;
  color: string;
  cantidad: number;
  precio: number;
}

export interface PedidoAdmin {
  pedId: number;
  cliente: string;
  email: string;
  estado: string;
  total: number;
  fechaCompra: string;
  fechaEntrega: string;
  metodoPago: string;
  items: number;
}

export interface PedidoAdminDetalle extends PedidoAdmin {
  numeroYape: string;
  codigoAprobacion: string;
  direccionEnvio: string;
  itemsDetalle: PedidoAdminItem[];
}

// 🎯 Parser de pedidos insensible a mayúsculas/minúsculas (mismo patrón que parseProducto)
function nombreClienteDePedido(raw: any): string {
  if (typeof raw?.cliente === 'string') return raw.cliente;
  const c = raw?.cliente ?? {};
  const nombre = c.cliNombre ?? c.cli_nombre ?? raw?.cliNombre ?? raw?.cli_nombre ?? '';
  const apellido = c.cliApellido ?? c.cli_apellido ?? raw?.cliApellido ?? raw?.cli_apellido ?? '';
  const full = `${nombre} ${apellido}`.trim();
  return full || 'Cliente';
}

function parsePedidoAdmin(item: any): PedidoAdmin {
  const obj: Record<string, any> = {};
  if (item && typeof item === 'object') {
    Object.keys(item).forEach((key) => { obj[key.toLowerCase()] = item[key]; });
  }
  return {
    pedId: Number(obj['pedid'] ?? obj['ped_id'] ?? obj['id'] ?? 0),
    cliente: nombreClienteDePedido(item),
    email: String(obj['email'] ?? obj['usuemail'] ?? item?.cliente?.usuario?.usuEmail ?? item?.usuario?.usuEmail ?? ''),
    estado: String(obj['pedestado'] ?? obj['ped_estado'] ?? obj['estado'] ?? 'pendiente').toLowerCase(),
    total: Number(obj['pedtotal'] ?? obj['ped_total'] ?? obj['total'] ?? 0),
    fechaCompra: String(obj['pedfechacompra'] ?? obj['ped_fecha_compra'] ?? obj['fechacompra'] ?? obj['fecha'] ?? ''),
    fechaEntrega: String(obj['pedfechaentrega'] ?? obj['ped_fecha_entrega'] ?? obj['fechaentrega'] ?? ''),
    metodoPago: String(obj['metodopago'] ?? obj['metodo_pago'] ?? 'Yape'),
    items: Array.isArray(obj['items']) ? obj['items'].reduce((sum: number, v: any) => sum + Number(v.cantidad ?? v.Cantidad ?? 0), 0) : Number(obj['cantidaditems'] ?? obj['totalitems'] ?? 0),
  };
}

function parsePedidoAdminDetalle(item: any): PedidoAdminDetalle {
  const base = parsePedidoAdmin(item);
  const obj: Record<string, any> = {};
  if (item && typeof item === 'object') {
    Object.keys(item).forEach((key) => { obj[key.toLowerCase()] = item[key]; });
  }
  const rawItems = Array.isArray(obj['items']) ? obj['items'] : [];
  const itemsDetalle: PedidoAdminItem[] = rawItems
    .filter((v: any) => v && typeof v === 'object')
    .map((v: any) => ({
      varId: Number(v.varId ?? v.var_id ?? 0),
      nombre: String(v.proNombre ?? v.pro_nombre ?? v.nombre ?? v.producto ?? ''),
      talla: String(v.varTalla ?? v.var_talla ?? v.talla ?? ''),
      color: String(v.colorNombre ?? v.color_nombre ?? v.color ?? ''),
      cantidad: Number(v.cantidad ?? v.pedDetCantidad ?? v.ped_det_cantidad ?? 0),
      precio: Number(v.precio ?? v.pedDetPrecio ?? v.ped_det_precio ?? 0),
    }));

  return {
    ...base,
    numeroYape: String(obj['numeroyape'] ?? obj['numero_yape'] ?? ''),
    codigoAprobacion: String(obj['codigoaprobacion'] ?? obj['codigo_aprobacion'] ?? ''),
    direccionEnvio: String(obj['direccionenvio'] ?? obj['dircalle'] ?? obj['direccion'] ?? ''),
    itemsDetalle,
  };
}

export async function getPedidosAdmin(): Promise<PedidoAdmin[]> {
  try {
    const data = await fetchJson<any[]>(`${API_BASE}/api/admin/reportes/pedidos`);
    return Array.isArray(data) ? data.map(parsePedidoAdmin) : [];
  } catch (error) {
    console.error('Error al listar pedidos (admin):', error);
    return [];
  }
}

export async function getPedidoAdminDetalle(id: number): Promise<PedidoAdminDetalle | null> {
  try {
    const data = await fetchJson<any>(`${API_BASE}/api/admin/reportes/pedidos/${id}`);
    return parsePedidoAdminDetalle(data);
  } catch (error) {
    console.error('Error al obtener detalle de pedido:', error);
    return null;
  }
}

export async function actualizarEstadoPedido(id: number, estado: EstadoPedido): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchJson(`${API_BASE}/api/admin/reportes/pedidos/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ PedEstado: estado }),
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'No se pudo actualizar el estado del pedido.' };
  }
}

// ── AUTENTICACIÓN ──
// [P2 FIX] loginApi ahora tipifica correctamente la respuesta del backend
export async function loginApi(usernameOrEmail: string, pass: string): Promise<{ success: boolean; token?: string; user?: LoginApiResponse; error?: string }> {
  const url = `${API_BASE}/api/auth/login`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UsuUsernameOrEmail: usernameOrEmail, UsuContrasena: pass })
    });
    const data: LoginApiResponse = await res.json();
    if (!res.ok) return { success: false, error: (data as any).message || 'Credenciales inválidas' };
    return { success: true, token: data.tokenJWT ?? data.token, user: data };
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor de autenticación.' };
  }
}
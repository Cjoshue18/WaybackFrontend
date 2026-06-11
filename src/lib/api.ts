const API_BASE = 'https://y2kvault-backend.onrender.com';

// ── INTERFACES EXISTENTES ──
export interface CategoriaApi {
  catID?: number; cat_id?: number;
  catNombre?: string; cat_nombre?: string;
}

export interface Categoria {
  cat_id: number;
  cat_nombre: string;
}

export interface ClienteApi {
  cli_id?: number; cli_nombre?: string; cli_apellido?: string;
  cli_email?: string; cli_telefono?: string; cli_documento_tipo?: string;
  cli_documento?: string; cli_fecha_registro?: string;
  [key: string]: any;
}

export interface Cliente {
  cli_id: number; cli_nombre: string; cli_apellido: string;
  cli_email: string; cli_telefono: string; cli_documento_tipo: string;
  cli_documento: string; cli_fecha_registro: string;
}

// ── INTERFACES PARA PRODUCTOS ──
export interface ProductoApi {
  pro_id?: number; proID?: number; id?: number;
  pro_nombre?: string; proNombre?: string; name?: string;
  pro_precio?: number; proPrecio?: number; price?: number;
  pro_imagen?: string; proImagen?: string; image?: string;
  pro_sexo?: string; sexo?: string;
  pro_tallas?: string | string[]; tallas?: string[];
  pro_colores?: string | number[]; colors?: number[];
  pro_stock?: number; inStock?: boolean; stock?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sexo: string;
  tallas: string[];
  colors: number[];
  inStock: boolean;
}

// ── PARSERS / MAPEADORES ──
const parseCategoria = (item: CategoriaApi): Categoria => ({
  cat_id: Number(item.catID ?? item.cat_id ?? 0),
  cat_nombre: String(item.catNombre ?? item.cat_nombre ?? ''),
});

const parseCliente = (item: ClienteApi): Cliente => ({
  cli_id: Number(item.cli_id ?? item.id ?? 0),
  cli_nombre: String(item.cli_nombre ?? item.nombre ?? ''),
  cli_apellido: String(item.cli_apellido ?? item.apellido ?? ''),
  cli_email: String(item.cli_email ?? item.email ?? ''),
  cli_telefono: String(item.cli_telefono ?? item.telefono ?? ''),
  cli_documento_tipo: String(item.cli_documento_tipo ?? item.documento_tipo ?? item.tipo_documento ?? 'DNI'),
  cli_documento: String(item.cli_documento ?? item.documento ?? ''),
  cli_fecha_registro: String(item.cli_fecha_registro ?? item.fecha_registro ?? item.createdAt ?? ''),
});

const parseProducto = (item: ProductoApi): Product => {
  let listaTallas: string[] = [];
  if (Array.isArray(item.pro_tallas)) listaTallas = item.pro_tallas;
  else if (Array.isArray(item.tallas)) listaTallas = item.tallas;
  else if (typeof (item.pro_tallas ?? item.tallas) === 'string') {
    listaTallas = (item.pro_tallas ?? item.tallas ?? '').split(',').map(s => s.trim());
  }

  let listaColores: number[] = [];
  if (Array.isArray(item.pro_colores)) listaColores = item.pro_colores;
  else if (Array.isArray(item.colors)) listaColores = item.colors;

  return {
    id: Number(item.pro_id ?? item.proID ?? item.id ?? 0),
    name: String(item.pro_nombre ?? item.proNombre ?? item.name ?? 'Producto Sin Nombre'),
    price: Number(item.pro_precio ?? item.proPrecio ?? item.price ?? 0),
    image: String(item.pro_imagen ?? item.proImagen ?? item.image ?? 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500'),
    sexo: String(item.pro_sexo ?? item.sexo ?? 'unisex').toLowerCase(),
    tallas: listaTallas,
    colors: listaColores,
    inStock: item.inStock ?? (Number(item.pro_stock ?? item.stock ?? 0) > 0),
  };
};

// ── FUNCIÓN BASE FETCH ──
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

// ── MÉTODOS DE LA API ──
export async function getCategorias(): Promise<Categoria[]> {
  const url = `${API_BASE}/api/categorias`;
  const data = await fetchJson<CategoriaApi[]>(url);
  return Array.isArray(data) ? data.map(parseCategoria) : [];
}

export async function getClientes(): Promise<Cliente[]> {
  const url = `${API_BASE}/api/admin/clientes`;
  const data = await fetchJson<ClienteApi[]>(url);
  return Array.isArray(data) ? data.map(parseCliente) : [];
}

export async function getProductos(): Promise<Product[]> {
  const url = `${API_BASE}/api/productos`;
  try {
    const data = await fetchJson<ProductoApi[]>(url);
    return Array.isArray(data) ? data.map(parseProducto) : [];
  } catch (error) {
    console.error("Error fetching products from API, returning empty array:", error);
    return [];
  }
}

// ── AUTENTICACIÓN ACTUALIZADA CON TUS PROPIEDADES REALES ──

export async function loginApi(email: string, pass: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const url = `${API_BASE}/api/auth/login`; 
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        UsuUsernameOrEmail: email, 
        UsuContrasena: pass 
      }) 
    });
    
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message || 'Credenciales inválidas' };
    
    // 🛠️ Mapeado exacto basado en tu captura de red:
    return { 
      success: true, 
      token: data.tokenJWT, // Extrae "tokenJWT" correctamente
      user: data            // Pasamos el objeto raíz que contiene "rol" y "usuario"
    };
  } catch (err) {
    return { success: false, error: 'No se pudo conectar con el servidor de autenticación.' };
  }
}
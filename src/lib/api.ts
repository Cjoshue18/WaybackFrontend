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

// ── INTERFACES PARA PRODUCTOS (ENRIQUECIDAS) ──
export interface ProductoApi {
  pro_id?: number; proID?: number; id?: number;
  pro_nombre?: string; proNombre?: string; nombre?: string; name?: string; 
  pro_precio?: number; proPrecio?: number; precio?: number; price?: number; 
  pro_precio_original?: number; precioOriginal?: number; originalPrice?: number;
  pro_imagen?: string; proImagen?: string; imagen?: string; image?: string; image_url?: string; imageUrl?: string; urlImagen?: string; proImagenUrl?: string; foto?: string; proFoto?: string;
  pro_imagen_alternativa?: string; proImagenHover?: string; hoverImage?: string;
  badge?: string;
  pro_sexo?: string; sexo?: string; genero?: string; proSexo?: string;
  pro_tallas?: string | string[]; tallas?: string[];
  pro_colores?: string | number[]; colors?: number[];
  pro_stock?: number; inStock?: boolean; stock?: number;
  categoria?: string | number; categoriaId?: number; catId?: number; cat_id?: number; pro_categoria?: string | number; proCategoria?: string | number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sexo: string;
  tallas: string[];
  colors: (number | string)[]; // 🔑 Corregido a (number | string)[]
  inStock: boolean;
  originalPrice?: number;
  hoverImage?: string;    
  badge?: string;          
  categoria?: string | number;
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

// ── INTERFAZ PARA FILTROS COMBINADOS (.NET QUERY PARAMS) ──
export interface FilterOptions {
  categoria?: string | number;
  estilo?: string | number;
  genero?: string;
  precioMin?: number;
  precioMax?: number;
}

// ── MÉTODO POST: REGISTRAR CLIENTE NUEVO ──
export async function registerClienteApi(data: RegisterData): Promise<{ success: boolean; error?: string }> {
  const url = `${API_BASE}/api/auth/register-cliente`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.Email,
        nombreUsuario: data.NombreUsuario,
        contrasena: data.Contrasena,
        nombres: data.Nombres,
        apellidos: data.Apellidos,
        tipoDocumento: data.TipoDocumento,
        documento: data.Documento
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
  } catch (err) {
    return { success: false, error: 'No se pudo establecer conexión con el servidor de registro.' };
  }
}

// ── PARSERS / MAPEADORES ──
const parseCategoria = (item: CategoriaApi): Categoria => ({
  cat_id: Number(item.catID ?? item.cat_id ?? 0),
  cat_nombre: String(item.catNombre ?? item.cat_nombre ?? ''),
});

const parseCliente = (item: ClienteApi): Cliente => ({
  cli_id: Number(item.cliId ?? item.cli_id ?? item.id ?? 0),
  cli_nombre: String(item.cliNombre ?? item.cli_nombre ?? item.nombre ?? ''),
  cli_apellido: String(item.cliApellido ?? item.cli_apellido ?? item.apellido ?? ''),
  
  // ✉️ ¡AQUÍ ESTABA EL TRUCO! Entramos al objeto 'usuario' de forma segura (?.)
  cli_email: String(item.usuario?.usuEmail ?? item.cliEmail ?? item.email ?? ''),
  
  cli_telefono: String(item.cliTelefono ?? item.cli_telefono ?? item.telefono ?? ''),
  cli_documento_tipo: String(item.cliTipoDocumento ?? item.cli_documento_tipo ?? 'DNI'),
  cli_documento: String(item.cliDocumento ?? item.cli_documento ?? ''),
  
  // 📅 La fecha también la rescatamos desde el objeto anidado 'usuario'
  cli_fecha_registro: String(item.usuario?.usuFechaRegistro ?? item.cliFechaRegistro ?? item.fecha_registro ?? ''),
});

// 🎯 SOLUCIÓN AL KEY 0 E IMÁGENES ROTAS: Parser insensible a mayúsculas/minúsculas con limpiador de backslashes
const parseProducto = (item: any): Product => {
  const obj: Record<string, any> = {};
  if (item && typeof item === 'object') {
    Object.keys(item).forEach(key => { obj[key.toLowerCase()] = item[key]; });
  }

  let listaTallas: string[] = [];
  const rawTallas = obj['pro_tallas'] ?? obj['protallas'] ?? obj['tallas'] ?? '';
  if (Array.isArray(rawTallas)) {
    listaTallas = rawTallas.map(String);
  } else if (typeof rawTallas === 'string' && rawTallas.trim() !== '') {
    listaTallas = rawTallas.split(',').map(s => s.trim());
  }

  let listaColores: (number | string)[] = [];
  const rawColores = obj['pro_colores'] ?? obj['procolores'] ?? obj['colors'] ?? obj['colores'] ?? [];
  if (Array.isArray(rawColores)) {
    listaColores = rawColores; // Ahora acepta tanto strings como números
  }

  const finalId = Number(obj['pro_id'] ?? obj['proid'] ?? obj['id'] ?? obj['idproducto'] ?? 0);
  const safeId = finalId !== 0 ? finalId : Math.floor(Math.random() * 999999 + 100);

  let finalImage = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500';
  const rawImagesArray = obj['imagenesurl'] ?? obj['imagenes_url'] ?? obj['imagesurl'] ?? obj['variantes'] ?? [];
  if (Array.isArray(rawImagesArray) && rawImagesArray.length > 0) {
    finalImage = String(rawImagesArray[0]).trim().replace(/\\/g, '/');
  }

  return {
    id: safeId,
    name: String(obj['pro_nombre'] ?? obj['pronombre'] ?? obj['nombre'] ?? obj['name'] ?? 'Prenda'),
    price: Number(obj['pro_precio'] ?? obj['proprecio'] ?? obj['precio'] ?? obj['price'] ?? 0),
    originalPrice: obj['originalprice'] ?? obj['preciooriginal'] ?? obj['pro_precio_original'] ?? undefined,
    image: finalImage,
    hoverImage: undefined,
    badge: obj['badge'] ?? undefined,
    sexo: String(obj['pro_sexo'] ?? obj['prosexo'] ?? obj['sexo'] ?? obj['genero'] ?? 'unisex').toLowerCase(),
    tallas: listaTallas,
    colors: listaColores,
    inStock: typeof obj['instock'] === 'boolean' ? obj['instock'] : true,
    categoria: obj['categoria'] ?? obj['categoriaid'] ?? obj['catid'] ?? obj['cat_id'] ?? obj['procategoria'] ?? ''
  };
};


// ── FUNCIÓN BASE FETCH (AHORA AUTOMATIZADA CON BEARER TOKEN) ──
async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('wayback_auth_token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });
  
  // 🚨 TRAMPA DE DIAGNÓSTICO: Intercepta el error real de .NET antes del catch
  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Sin respuesta del servidor');
    alert(
      `❌ ¡ERROR EN LA PETICIÓN CONTRA EL BACKEND!\n\n` +
      `Método: ${options.method ?? 'GET'}\n` +
      `Status HTTP: ${response.status} ${response.statusText}\n` +
      `URL: ${url}\n\n` +
      `Lo que responde C#:\n${errorBody}`
    );
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  // Si el servidor responde con 204 (No Content) o no hay contenido, devolvemos un objeto vacío seguro
  if (response.status === 204) {
    return {} as T;
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── MÉTODOS DE CATEGORÍAS ──
export async function getCategorias(): Promise<Categoria[]> {
  const url = `${API_BASE}/api/categorias`;
  const data = await fetchJson<CategoriaApi[]>(url);
  return Array.isArray(data) ? data.map(parseCategoria) : [];
}

// ── MÉTODOS DE CLIENTES CONECTADOS A TU ENDPOINT DE POSTMAN ──
export async function getClientes(): Promise<Cliente[]> {
  const url = `${API_BASE}/api/admin/reportes/clientes`;
  const data = await fetchJson<ClienteApi[]>(url);
  return Array.isArray(data) ? data.map(parseCliente) : [];
}

export async function createCliente(cliente: Partial<Cliente>): Promise<Cliente> {
  const url = `${API_BASE}/api/admin/reportes/clientes`;
  
  const bodyPayload = {
    cliNombre: cliente.cli_nombre,
    cliApellido: cliente.cli_apellido,
    cliDocumento: cliente.cli_documento,
    cliTipoDocumento: cliente.cli_documento_tipo ?? 'DNI',
    cliTelefono: cliente.cli_telefono || null,
    // Enviamos el email plano y estructurado para satisfacer cualquier variante del DTO de C#
    cliEmail: cliente.cli_email,
    usuario: {
      usuEmail: cliente.cli_email,
      usuUsername: cliente.cli_email?.split('@')[0] || 'user_new'
    }
  };

  return await fetchJson<Cliente>(url, {
    method: 'POST',
    body: JSON.stringify(bodyPayload),
  });
}

export async function updateCliente(id: number, cliente: Partial<Cliente>): Promise<Cliente> {
  const url = `${API_BASE}/api/admin/reportes/clientes/${id}`;
  
  const bodyPayload = {
    cliId: id,
    cliNombre: cliente.cli_nombre,
    cliApellido: cliente.cli_apellido,
    cliDocumento: cliente.cli_documento,
    cliTipoDocumento: cliente.cli_documento_tipo,
    cliTelefono: cliente.cli_telefono || null,
    cliEmail: cliente.cli_email,
    usuario: {
      usuEmail: cliente.cli_email
    }
  };

  return await fetchJson<Cliente>(url, {
    method: 'PUT',
    body: JSON.stringify(bodyPayload),
  });
}

export async function deleteCliente(id: number): Promise<{ success: boolean }> {
  const url = `${API_BASE}/api/admin/reportes/clientes/${id}`;
  return await fetchJson<{ success: boolean }>(url, {
    method: 'DELETE',
  });
}

// ── 🎯 NUEVO MÉTODO DE PRODUCTOS CON CONEXIÓN COMPLETA A FILTROS COMBINADOS DE C# ──
export async function getProductos(filtros?: FilterOptions): Promise<Product[]> {
  const url = new URL(`${API_BASE}/api/productos`);
  if (filtros) {
    Object.entries(filtros).forEach(([k, v]) => { if (v !== undefined && v !== '') url.searchParams.append(k, String(v)); });
  }
  const data = await fetchJson<any[]>(url.toString());
  return Array.isArray(data) ? data.map(parseProducto) : [];
}

export async function getProductosPorCategoria(categoryId: number | string): Promise<Product[]> {
  return getProductos({ categoria: categoryId });
}

// ── AUTENTICACIÓN ──
export async function loginApi(email: string, pass: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  const url = `${API_BASE}/api/auth/login`; 
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UsuUsernameOrEmail: email, UsuContrasena: pass }) 
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message || 'Credenciales inválidas' };
    return { success: true, token: data.tokenJWT, user: data };
  } catch (err) {
    return { success: false, error: 'No se pudo conectar con el servidor de autenticación.' };
  }
}
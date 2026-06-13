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
  pro_nombre?: string; proNombre?: string; nombre?: string; name?: string;
  pro_precio?: number; proPrecio?: number; precio?: number; price?: number;
  pro_imagen?: string; proImagen?: string; imagen?: string; image?: string;
  pro_sexo?: string; sexo?: string;
  pro_stock?: number; stock?: number;
  cat_id?: number; catID?: number; categoryId?: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sexo: string;
  stock: number;
}

// ── AUXILIAR FETCH ──
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ── PARSEAR PRODUCTOS ──
function parseProducto(p: ProductoApi): Product {
  return {
    id: p.pro_id ?? p.proID ?? p.id ?? 0,
    name: p.pro_nombre ?? p.proNombre ?? p.nombre ?? p.name ?? 'Sin nombre',
    price: p.pro_precio ?? p.proPrecio ?? p.precio ?? p.price ?? 0,
    image: p.pro_imagen ?? p.proImagen ?? p.imagen ?? p.image ?? '',
    category: String(p.cat_id ?? p.catID ?? p.categoryId ?? '1'),
    sexo: p.pro_sexo ?? p.sexo ?? 'U',
    stock: p.pro_stock ?? p.stock ?? 0
  };
}

// ── OBTENER TODOS LOS PRODUCTOS ──
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

// ── FILTRAR PRODUCTOS POR CATEGORÍA ──
export async function getProductosPorCategoria(categoryId: number | string): Promise<Product[]> {
  const url = `${API_BASE}/api/productos/categoria=${categoryId}`;
  try {
    const data = await fetchJson<ProductoApi[]>(url);
    return Array.isArray(data) ? data.map(parseProducto) : [];
  } catch (error) {
    console.error(`Error cargando productos de la categoría ${categoryId}:`, error);
    return [];
  }
}

// ── AUTENTICACIÓN: LOGIN ──
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
    if (!res.ok) return { success: false, error: data.message || 'Credenciales incorrectas' };
    return { success: true, token: data.token, user: data.user };
  } catch (error) {
    console.error("Error en loginApi:", error);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
}

// ── AUTENTICACIÓN: REGISTRO REESTRUCTURADO EN BASE A LO SOLICITADO ──
export async function registerClienteApi(
  email: string,
  nombreUsuario: string,
  contrasena: string,
  nombres: string,
  apellidos: string,
  tipoDocumento: string,
  documento: string
): Promise<{ success: boolean; error?: string }> {
  
  const url = `${API_BASE}/api/auth/register-cliente`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      // JSON estructurado con los nombres exactos en PascalCase para C#
      body: JSON.stringify({
        Email: email.trim().toLowerCase(),
        NombreUsuario: nombreUsuario.trim(),
        Contrasena: contrasena.trim(),
        Nombres: nombres.trim(),
        Apellidos: apellidos.trim(),
        TipoDocumento: tipoDocumento,
        Documento: documento.trim()
      }),
    });

    const textData = await res.text();
    const data = textData ? JSON.parse(textData) : {};

    console.log("📥 Respuesta del Servidor C#:", { status: res.status, data });

    if (!res.ok) {
      // Si C# devuelve errores de validación estructurados (ModelState / DataAnnotations)
      if (data.errors && typeof data.errors === 'object') {
        const errorMessages = Object.entries(data.errors)
          .map(([campo, mensajes]) => `${campo}: ${(mensajes as string[]).join(' ')}`)
          .join(' | ');
        return { success: false, error: errorMessages };
      }
      return { success: false, error: data.message || data.error || 'Validación fallida en el servidor.' };
    }

    return { success: true };

  } catch (err) {
    console.error("❌ Error de red crítico:", err);
    return { success: false, error: 'El servidor en Render está despertando o hay un problema de red. Por favor, intenta de nuevo.' };
  }
}
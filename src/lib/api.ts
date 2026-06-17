const API_BASE = 'https://y2kvault-backend.onrender.com';

export interface CategoriaApi {
  catID?: number;
  catNombre?: string;
  cat_id?: number;
  cat_nombre?: string;
}

export interface ClienteApi {
  cli_id?: number;
  cli_nombre?: string;
  cli_apellido?: string;
  cli_email?: string;
  cli_telefono?: string;
  cli_documento_tipo?: string;
  cli_documento?: string;
  cli_fecha_registro?: string;
  [key: string]: any;
}

export interface Categoria {
  cat_id: number;
  cat_nombre: string;
}

export interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_telefono: string;
  cli_documento_tipo: string;
  cli_documento: string;
  cli_fecha_registro: string;
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

const parseEstilo = (item: EstiloApi): Estilo => ({
  est_id: Number(item.estID ?? item.est_id ?? 0),
  est_nombre: String(item.estNombre ?? item.est_nombre ?? ''),
});

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

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

export async function getEstilos(): Promise<Estilo[]> {
  const url = `${API_BASE}/api/estilos`;
  const data = await fetchJson<EstiloApi[]>(url);
  return Array.isArray(data) ? data.map(parseEstilo) : [];
}

export async function createEstilo(estilo: { est_nombre: string }): Promise<Estilo> {
  const url = `${API_BASE}/api/estilos`;
  const data = await fetchJson<EstiloApi>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ est_nombre: estilo.est_nombre }),
  });
  return parseEstilo(data);
}

export async function updateEstilo(id: number, estilo: { est_nombre: string }): Promise<Estilo> {
  const url = `${API_BASE}/api/estilos/${id}`;
  const data = await fetchJson<EstiloApi>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ est_nombre: estilo.est_nombre }),
  });
  return parseEstilo(data);
}

export async function deleteEstilo(id: number): Promise<void> {
  const url = `${API_BASE}/api/estilos/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error('Error al eliminar estilo');
}
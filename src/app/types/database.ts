export interface Categoria {
  cat_id: number;
  cat_nombre: string;
}

export interface Estilo {
  est_id: number;
  est_nombre: string;
}

export interface VarColor {
  color_id: number;
  color_nombre: string;
  color_hex: string;
  color_url_img: string;
}

export interface Variante {
  var_id: number;
  pro_id: number;
  color_id: number;
  var_talla: string;
  var_stock: number;
  var_precio: number;
  color?: VarColor;
}

export interface Producto {
  pro_id: number;
  cat_id: number;
  est_id: number;
  sexo: 'Mujer' | 'Hombre' | 'Unisex';
  pro_nombre: string;
  pro_descripcion: string;
  pro_descuento: number;
  pro_desc_fecha_inicio: string | null;
  pro_desc_fecha_fin: string | null;
  pro_fecha_creacion: string;
  categoria?: Categoria;
  estilo?: Estilo;
  variantes?: Variante[];
}

export interface Cliente {
  cli_id: number;
  cli_documento: string;
  cli_documento_tipo: string;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_telefono: string;
  cli_usuario: string;
  cli_password_hash: string;
  cli_stripe_id: string;
  cli_fecha_registro: string;
}

export interface Direccion {
  dir_id: number;
  cli_id: number;
  dir_calle: string;
  dir_distrito: string;
  dir_provincia: string;
  dir_departamento: string;
  dir_referencia: string;
  dir_es_preferido: boolean;
}

export interface MetodoPago {
  met_id: number;
  cli_id: number;
  met_stripe_card_id: string;
  met_stripe_card_ultimos4: string;
  met_tipo_pago: string;
  met_es_preferido: boolean;
}

export interface Estado {
  estado_id: number;
  estado_descripcion: string;
}

export interface Pedido {
  ped_id: number;
  cli_id: number;
  met_id: number;
  dir_id: number;
  estado_id: number;
  ped_total: number;
  ped_stripe_cargo_id: string;
  ped_fecha_compra: string;
  ped_fecha_entrega: string;
  estado?: Estado;
  direccion?: Direccion;
  metodo_pago?: MetodoPago;
  detalle?: DetallePedido[];
}

export interface DetallePedido {
  ped_id: number;
  var_id: number;
  detped_cantidad: number;
  detped_precio_u: number;
  detped_sub_total: number;
  variante?: Variante;
}

export interface Administrador {
  ad_id: number;
  ad_nombre: string;
  ad_usuario: string;
  ad_password_hash: string;
}

// ── TIPOS DE BASE DE DATOS EXACTOS ──
export interface ClienteDb {
  cliente_id: number;
  dni: string;
  tipo_dni: string;
  name: string;
  last_name: string;
  email: string;
  cl_telefono?: string | null;
  duser: string;
  password_hash: string;
  stripe_id?: string | null;
  fecha_registro: string;
}

export interface DireccionDb {
  direccion_id: number;
  cliente_id: number;
  dcalle: string;
  d_distrito: string;
  d_provincia: string;
  d_departamento: string;
  d_referencia?: string | null;
  es_preferido: boolean | number;
}

export interface AdministradorDb {
  admin_id: number;
  ad_name: string;
  ad_user: string;
  ad_password_hash: string;
}

export interface CategoriaDb {
  categoria_id: number;
  cat_nombre: string;
}

export interface EstiloDb {
  estilo_id: number;
  estilo_nombre: string;
}

export interface ColorDb {
  color_id: number;
  color_name: string;
  color_hex: string;
  url_img: string;
}

export interface ProductoDb {
  producto_id: number;
  categoria_id: number;
  estilo_id: number;
  SEXO: string;
  pro_nombre: string;
  pro_desc?: string | null;
  descuento?: number | null;
  fecha_inicio_desc?: string | null;
  fecha_fin_desc?: string | null;
  fecha_creacion: string;
}

export interface VarianteDb {
  variante_id: number;
  producto_id: number;
  color_id: number;
  talla: string;
  stock: number;
  precio: number;
}

export interface MetodoPagoDb {
  metodo_id: number;
  cliente_id: number;
  stripe_card_id: string;
  ultimos4: string;
  tipo_pago: string;
  es_preferido: boolean | number;
}

export interface PedidoDb {
  pedido_id: number;
  cliente_id: number;
  metodo_id: number;
  direccion_id: number;
  estado_id: number;
  total: number;
  stripe_cargo_id?: string | null;
  fecha_compra: string;
  fecha_entrega?: string | null;
}

export interface DetallePedidoDb {
  pedido_id: number;
  variante_id: number;
  cantidad: number;
  precio_u: number;
  sub_total: number;
}

export interface EstadoDb {
  estado_id: number;
  dest_estado: string;
}

// ── ADAPTADORES PARA TRANSFORMAR ENTRE LA API Y EL FRONT-END ──
export const mapClienteDbToCliente = (db: ClienteDb): Cliente => ({
  cli_id: db.cliente_id,
  cli_documento: db.dni,
  cli_documento_tipo: db.tipo_dni,
  cli_nombre: db.name,
  cli_apellido: db.last_name,
  cli_email: db.email,
  cli_telefono: db.cl_telefono ?? '',
  cli_usuario: db.duser,
  cli_password_hash: db.password_hash,
  cli_stripe_id: db.stripe_id ?? '',
  cli_fecha_registro: db.fecha_registro,
});

export const mapDireccionDbToDireccion = (db: DireccionDb): Direccion => ({
  dir_id: db.direccion_id,
  cli_id: db.cliente_id,
  dir_calle: db.dcalle,
  dir_distrito: db.d_distrito,
  dir_provincia: db.d_provincia,
  dir_departamento: db.d_departamento,
  dir_referencia: db.d_referencia ?? '',
  dir_es_preferido: Boolean(db.es_preferido),
});

export const mapCategoriaDbToCategoria = (db: CategoriaDb): Categoria => ({
  cat_id: db.categoria_id,
  cat_nombre: db.cat_nombre,
});

export const mapEstiloDbToEstilo = (db: EstiloDb): Estilo => ({
  est_id: db.estilo_id,
  est_nombre: db.estilo_nombre,
});

export const mapColorDbToVarColor = (db: ColorDb): VarColor => ({
  color_id: db.color_id,
  color_nombre: db.color_name,
  color_hex: db.color_hex,
  color_url_img: db.url_img,
});

const normalizeSexo = (value: string): 'Mujer' | 'Hombre' | 'Unisex' => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (['m', 'f', 'hombre', 'mujer'].includes(normalized)) {
    if (normalized === 'm' || normalized === 'hombre') return 'Hombre';
    if (normalized === 'f' || normalized === 'mujer') return 'Mujer';
  }
  return 'Unisex';
};

export const mapProductoDbToProducto = (db: ProductoDb): Producto => ({
  pro_id: db.producto_id,
  cat_id: db.categoria_id,
  est_id: db.estilo_id,
  sexo: normalizeSexo(db.SEXO),
  pro_nombre: db.pro_nombre,
  pro_descripcion: db.pro_desc ?? '',
  pro_descuento: db.descuento ?? 0,
  pro_desc_fecha_inicio: db.fecha_inicio_desc ?? null,
  pro_desc_fecha_fin: db.fecha_fin_desc ?? null,
  pro_fecha_creacion: db.fecha_creacion,
});

export const mapVarianteDbToVariante = (db: VarianteDb): Variante => ({
  var_id: db.variante_id,
  pro_id: db.producto_id,
  color_id: db.color_id,
  var_talla: db.talla,
  var_stock: db.stock,
  var_precio: db.precio,
});

export const mapPedidoDbToPedido = (db: PedidoDb): Pedido => ({
  ped_id: db.pedido_id,
  cli_id: db.cliente_id,
  met_id: db.metodo_id,
  dir_id: db.direccion_id,
  estado_id: db.estado_id,
  ped_total: db.total,
  ped_stripe_cargo_id: db.stripe_cargo_id ?? '',
  ped_fecha_compra: db.fecha_compra,
  ped_fecha_entrega: db.fecha_entrega ?? '',
});

export const mapDetallePedidoDbToDetallePedido = (db: DetallePedidoDb): DetallePedido => ({
  ped_id: db.pedido_id,
  var_id: db.variante_id,
  detped_cantidad: db.cantidad,
  detped_precio_u: db.precio_u,
  detped_sub_total: db.sub_total,
});

export const mapEstadoDbToEstado = (db: EstadoDb): Estado => ({
  estado_id: db.estado_id,
  estado_descripcion: db.dest_estado,
});

export type SortOption = 'recientes' | 'precio_asc' | 'precio_desc';

export interface ProductFilters {
  sexo: string[];
  colors: number[];
  tallas: string[];
  soloDisponibles: boolean;
  precioMin: number;
  precioMax: number;
}

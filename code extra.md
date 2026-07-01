

### **WhatsApp Image 2026-06-30 at 5.15.29 PM.jpeg**



```
###
# Obtener el detalle de un pedido específico
GET {{BackEnd_HostAddress}}/api/admin/reportes/pedidos/2
Authorization: Bearer {{admintoken}}
Accept: application/json

###
# Cambiar el estado de un pedido (pendiente, aceptado, rechazado, cancelado, entregado)
PUT {{BackEnd_HostAddress}}/api/admin/reportes/pedidos/2/estado
Authorization: Bearer {{admintoken}}
Content-Type: application/json

{
  "PedEstado": "aceptado"
}
```

### **WhatsApp Image 2026-06-30 at 5.15.30 PM.jpeg**



```
###
# Obtener todos los pedidos del cliente autenticado
GET {{BackEnd_Https}}/api/mis-pedidos
Authorization: Bearer {{mitoken}}
Accept: application/json

###
# Obtener el detalle de un pedido específico del cliente
GET {{BackEnd_Https}}/api/mis-pedidos/1
Authorization: Bearer {{mitoken}}
Accept: application/json

###
# Obtener todos los pedidos (resumen con datos del cliente)
GET {{BackEnd_HostAddress}}/api/admin/reportes/pedidos
Authorization: Bearer {{admintoken}}
Accept: application/json

###
# Obtener el detalle de un pedido específico
GET {{BackEnd_HostAddress}}/api/admin/reportes/pedidos/2
Authorization: Bearer {{admintoken}}
Accept: application/json
```

### **WhatsApp Image 2026-06-30 at 5.48.27 PM.jpeg**

HTTP

```
###
# Obtener todos los pedidos del cliente autenticado
GET {{BackEnd_Https}}/api/mis-pedidos
Authorization: Bearer {{mitoken}}
Accept: application/json

###
# Obtener el detalle de un pedido específico del cliente
GET {{BackEnd_Https}}/api/mis-pedidos/1
Authorization: Bearer {{mitoken}}
Accept: application/json

###
# Obtener todos los pedidos (resumen con datos del cliente)
GET {{BackEnd_HostAddress}}/api/admin/reportes/pedidos
Authorization: Bearer {{admintoken}}
Accept: application/json

###
# Obtener el detalle de un pedido específico
GET {{BackEnd_HostAddress}}/api/admin/reportes/pedidos/2
Authorization: Bearer {{admintoken}}
Accept: application/json

###
# Cambiar el estado de un pedido (pendiente, aceptado, rechazado, cancelado, entregado)
PUT {{BackEnd_HostAddress}}/api/admin/reportes/pedidos/2/estado
Authorization: Bearer {{admintoken}}
Content-Type: application/json

{
  "PedEstado": "aceptado"
}
```

### **WhatsApp Image 2026-06-30 at 5.48.28 PM.jpeg** y **WhatsApp Image 2026-06-30 at 5.48.28 PM(1).jpeg**

HTTP

```
###
PUT {{BackEnd_Https}}/api/profile/direcciones/1
Content-Type: application/json
Authorization: Bearer {{mitoken}}

{
  "DirCalle": "calle2",
  "DirDistrito": "distrito",
  "DirProvincia": "provincia",
  "DirDepartamento": "departamento",
  "DirReferencia": "referencia",
  "DirPreferido": false
}

###
DELETE {{BackEnd_Https}}/api/profile/direcciones/1
Content-Type: application/json
Authorization: Bearer {{mitoken}}

###
GET {{BackEnd_HostAddress}}/api/admin/reportes/productos/2/variantes
Accept: application/json

###
GET {{BackEnd_HostAddress}}/api/admin/reportes/productos/2/variantes/5
Accept: application/json

###
POST {{BackEnd_Https}}/api/mis-pedidos
Authorization: Bearer {{mitoken}}
Content-Type: application/json

{
  "dirId": 3,
  "NumeroYape": "987654321",
  "CodigoAprobacion": "123456",
  "Items": [
    { "VarId": 5, "Cantidad": 2 },
    { "VarId": 12, "Cantidad": 1 }
  ]
}

###
```
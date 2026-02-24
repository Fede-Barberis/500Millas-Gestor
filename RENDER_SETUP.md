# 🚀 Guía de Despliegue en Render

## Variables de Entorno Requeridas

Debes configurar las siguientes variables de entorno en Render:

### 1. Base de Datos (Clever Cloud MySQL)
```
DB_HOST=bngdiqnfr7hhtc1tmca8-mysql.services.clever-cloud.com
DB_USER=uu0hnbwh0cz1yhdc
DB_PASSWORD=dlDdml5mboeGFMGmW6WQ
DB_NAME=bngdiqnfr7hhtc1tmca8
DB_PORT=3306
```

### 2. Configuración del Servidor
```
PORT=3000
NODE_ENV=production
```

### 3. JWT (Autenticación)
```
JWT_SECRET=un_super_secreto_!123
JWT_EXPIRES_IN=7d
```

### 4. Scheduler de Cierre Mensual
```
CRON_SECRET=un_token_largo_y_unico
```

## Pasos para Configurar en Render

### 1. Ir a la configuración del servicio
- Ve a tu servicio en el Dashboard de Render
- Click en "Environment" en el menú lateral

### 2. Agregar variables de entorno
- Click en "Add Environment Variable"
- Copia cada variable de la lista de arriba
- **IMPORTANTE**: No copies las comillas, solo el valor

### 3. Build & Deploy Settings
Asegúrate de tener esta configuración:

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: Dejar en blanco (raíz del repo)

### 4. Verificar Firewall de Clever Cloud
**IMPORTANTE**: Debes permitir conexiones desde Render a tu base de datos de Clever Cloud:

1. Ve a tu dashboard de Clever Cloud
2. Selecciona tu base de datos MySQL
3. Ve a "Settings" o "Security"
4. Agrega las IPs de Render a la lista blanca (whitelist)
   - Consulta las IPs de Render aquí: https://render.com/docs/static-outbound-ip-addresses

**Alternativa**: Si Clever Cloud no permite conexiones externas fácilmente, considera:
- Crear una base de datos MySQL directamente en Render
- Usar otro servicio como PlanetScale, Railway, o Amazon RDS

## Troubleshooting

### Error: ECONNREFUSED
- ✅ Verifica que todas las variables de entorno estén configuradas
- ✅ Verifica que el firewall de Clever Cloud permita las IPs de Render
- ✅ Verifica que las credenciales de la base de datos sean correctas

### Error: Build failed
- ✅ Asegúrate de que el Build Command sea `npm install`
- ✅ Verifica que el repositorio esté correctamente clonado

### Las variables no se cargan
- ✅ NO dependas del archivo `.env` en producción
- ✅ Configura todas las variables directamente en Render
- ✅ Reinicia el servicio después de agregar variables

## Cierre Mensual Automático (Render + Vercel)

El backend ahora expone un endpoint de scheduler:

- `POST /api/reportes/cerrar-mes-cron`
- `GET /api/reportes/cerrar-mes-cron`

Autenticación del endpoint:

- Header `x-cron-secret: <CRON_SECRET>`
- o `Authorization: Bearer <CRON_SECRET>`

### Configuración recomendada en Render Cron Job

1. Crear un nuevo servicio `Cron Job` en Render.
2. Schedule: `5 0 1 * *` (día 1 de cada mes, 00:05 del timezone del servicio).
3. Comando (ejemplo):

```bash
curl -sS -X POST "$BACKEND_URL/api/reportes/cerrar-mes-cron" \
  -H "x-cron-secret: $CRON_SECRET"
```

Variables para el cron job:

- `BACKEND_URL=https://tu-backend.onrender.com`
- `CRON_SECRET` (igual al del backend web)

### Configuración recomendada en Vercel Cron

Vercel dispara con `GET`, por eso también está habilitado `GET /cerrar-mes-cron`.
Configurar cron mensual apuntando a:

- `/api/reportes/cerrar-mes-cron`

y usar `CRON_SECRET` en Vercel para que envíe:

- `Authorization: Bearer <CRON_SECRET>`

## Comandos útiles para debugging

Puedes ejecutar estos comandos en el Shell de Render (desde el dashboard):

```bash
# Ver variables de entorno (sin valores sensibles)
env | grep DB_

# Probar conectividad a la base de datos
nc -zv bngdiqnfr7hhtc1tmca8-mysql.services.clever-cloud.com 3306
```

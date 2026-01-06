# 🗄️ Teto - Base de Datos Supabase

## 📋 Contenido

- `schema.sql` - Schema completo de la base de datos
- `README.md` - Este archivo con instrucciones

## 🚀 Instalación

### Opción 1: Via SQL Editor (Recomendado para inicio)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega todo el contenido de `schema.sql`
5. Ejecuta el script

### Opción 2: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Inicializar (si no está iniciado)
supabase init

# Aplicar migraciones
supabase db push
```

## 📊 Estructura de Tablas

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (clientes, staff, admins, owners) |
| `businesses` | Negocios/establecimientos |
| `services` | Servicios que ofrece cada negocio |
| `staff` | Personal/profesionales |
| `appointments` | Citas/reservas |
| `transactions` | Pagos, reembolsos, propinas |

### Tablas de Configuración

| Tabla | Descripción |
|-------|-------------|
| `business_hours` | Horarios de apertura del negocio |
| `staff_working_hours` | Días que trabaja cada profesional |
| `staff_time_slots` | Franjas horarias específicas |
| `staff_services` | Servicios que realiza cada profesional |
| `blocked_times` | Bloqueos de horario (vacaciones, etc.) |

### Tablas de Seguridad

| Tabla | Descripción |
|-------|-------------|
| `audit_logs` | Registros de auditoría OWASP |
| `user_sessions` | Sesiones activas de usuarios |
| `login_attempts` | Intentos de login (brute force protection) |
| `api_keys` | Claves de API para integraciones |

### Tablas Adicionales

| Tabla | Descripción |
|-------|-------------|
| `notifications` | Notificaciones del sistema |
| `reviews` | Reseñas de clientes |

## 🔒 Seguridad Implementada

### OWASP ASVS Level 1

- ✅ **Row Level Security (RLS)** en todas las tablas
- ✅ **Auditoría automática** de cambios
- ✅ **Protección contra brute force** (login attempts)
- ✅ **Gestión de sesiones** (revocación, expiración)
- ✅ **Validaciones de entrada** (constraints, checks)
- ✅ **Encriptación de datos** (pgcrypto disponible)

### Políticas RLS por Rol

| Rol | Permisos |
|-----|----------|
| `client` | Ver/crear sus propias citas, ver servicios públicos |
| `staff` | Gestionar citas de su negocio, ver transacciones |
| `admin` | Todo lo de staff + gestionar servicios y personal |
| `owner` | Control total del negocio + audit logs |

## 🔧 Funciones Principales

### Disponibilidad

```sql
-- Verificar si un slot está disponible
SELECT check_slot_availability(
  'staff-uuid',
  '2026-01-15 10:00:00'::TIMESTAMPTZ,
  30 -- duración en minutos
);

-- Obtener slots disponibles para un día
SELECT * FROM get_available_slots(
  'staff-uuid',
  '2026-01-15'::DATE,
  30, -- duración
  30  -- intervalo entre slots
);
```

### Seguridad

```sql
-- Verificar si login está bloqueado
SELECT is_login_blocked('email@example.com', '192.168.1.1'::INET);

-- Registrar intento de login
SELECT record_login_attempt(
  'email@example.com',
  '192.168.1.1'::INET,
  'Mozilla/5.0...',
  true, -- success
  NULL  -- failure_reason
);

-- Revocar todas las sesiones de un usuario
SELECT revoke_all_user_sessions('user-uuid', 'password_changed');
```

## 📈 Vistas Útiles

```sql
-- Staff con información de usuario
SELECT * FROM staff_with_user WHERE business_id = 'xxx';

-- Citas con detalles completos
SELECT * FROM appointments_detailed WHERE business_id = 'xxx';

-- Ingresos diarios
SELECT * FROM daily_revenue WHERE business_id = 'xxx';

-- Performance del staff
SELECT * FROM staff_performance WHERE business_id = 'xxx';
```

## 🔐 Configuración de Auth

### En Supabase Dashboard:

1. **Authentication > Providers**
   - Habilitar Email
   - Configurar Google/Facebook si se necesita

2. **Authentication > URL Configuration**
   ```
   Site URL: https://tudominio.com
   Redirect URLs: 
     - https://tudominio.com/auth/callback
     - http://localhost:3000/auth/callback
   ```

3. **Authentication > Email Templates**
   - Personalizar emails de confirmación
   - Personalizar emails de recuperación de contraseña

## 🌐 Variables de Entorno

Agregar en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🛠️ Mantenimiento

### Limpieza de datos antiguos

```sql
-- Ejecutar periódicamente (recomendado: semanalmente)
SELECT cleanup_old_data();
```

### Backup

Los backups se manejan automáticamente en Supabase Pro.
Para plan gratuito, exportar manualmente desde Dashboard.

## 📝 Notas Importantes

1. **Triggers automáticos:**
   - `updated_at` se actualiza automáticamente
   - `end_at` de appointments se calcula automáticamente
   - Horarios se inicializan al crear negocio/staff
   - Auditoría se registra automáticamente

2. **Constraints importantes:**
   - Email debe ser válido
   - Teléfono debe seguir formato internacional
   - Precios en centavos (evita decimales)
   - Duración mínima de servicios: 5 minutos

3. **Precios:**
   - Todos los precios se guardan en **centavos**
   - Ejemplo: $25.00 = 2500 en la BD
   - Esto evita problemas de precisión con decimales

## 🆘 Troubleshooting

### Error: "permission denied for table"
- Verificar que RLS esté habilitado
- Verificar que el usuario esté autenticado
- Revisar políticas RLS para la tabla

### Error: "violates check constraint"
- Revisar que los datos cumplan las validaciones
- Ver constraints en la definición de la tabla

### Error: "violates foreign key constraint"
- Verificar que las referencias existan
- Revisar el orden de inserción de datos

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)


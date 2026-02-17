# TeTo API Endpoints

Base URL local: `http://localhost:3000`

## Auth

### POST `/api/auth/login`
- URL: http://localhost:3000/api/auth/login
- Acción: inicia sesión con email y password (Supabase Auth).
- Body JSON:
```json
{
  "email": "user@example.com",
  "password": "TuPassword123!"
}
```
- Respuesta esperada: `200` con mensaje de sesión iniciada, `401` si credenciales inválidas.

### POST `/api/auth/signup`
- URL: http://localhost:3000/api/auth/signup
- Acción: registra usuario nuevo y envía verificación por email.
- Body JSON:
```json
{
  "email": "user@example.com",
  "password": "TuPassword123!",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```
- Respuesta esperada: `200` con mensaje de verificación, `400` en error.

### POST `/api/auth/logout`
- URL: http://localhost:3000/api/auth/logout
- Acción: cierra sesión del usuario actual.
- Respuesta esperada: `200` en éxito, `500` si falla.

### GET `/api/auth/callback`
- URL base: http://localhost:3000/api/auth/callback
- Acción: intercambia el `code` de Supabase por sesión y redirige.
- Query params:
- `code`: código de auth de Supabase.
- `next` (opcional): ruta de redirección final (default `/dashboard` en el handler actual).
- Ejemplo:
  - http://localhost:3000/api/auth/callback?code=XXXX&next=/admin

## Businesses

### GET `/api/businesses`
- URL: http://localhost:3000/api/businesses
- Acción: lista todos los negocios.
- Respuesta esperada: `200` con `{ businesses: [...] }`.

### POST `/api/businesses`
- URL: http://localhost:3000/api/businesses
- Acción: crea un negocio nuevo para el usuario autenticado.
- Body JSON:
```json
{
  "name": "Barbería Centro",
  "type": "barbershop",
  "description": "Sucursal principal"
}
```
- Respuesta esperada: `201` con `{ business: {...} }`, `401` no autorizado, `409` slug duplicado.

## Public Business

### GET `/api/public/business/{slug}`
- URL ejemplo: http://localhost:3000/api/public/business/barbera-esparta
- Acción: obtiene la información pública de un negocio por `slug` exacto, incluyendo relaciones:
  - `services`
  - `staff`
- Respuesta esperada:
  - `200` con objeto del negocio y sus relaciones.
  - `404` si el slug no existe.
  - `500` en error del servidor.

### GET `/api/public/appointments?slug={slug}&email={email}`
- URL ejemplo: http://localhost:3000/api/public/appointments?slug=barberia-esparta&email=cliente@ejemplo.com
- Acción: lista las reservas (citas) del cliente con ese email en el negocio identificado por `slug`. Pensado para la sección "Mis reservas" del flujo público de reservas. Usa `SUPABASE_SERVICE_ROLE_KEY` para leer sin sesión.
- Query params:
  - `slug`: slug del negocio (ej. `barberia-esparta`).
  - `email`: email del cliente (búsqueda case-insensitive en `customers`).
- Respuesta esperada:
  - `200` con `{ appointments: [...] }` (cada ítem incluye `id`, `scheduled_at`, `status`, `duration_minutes`, `price`, `services`, `staff`).
  - `400` si falta `slug` o `email`.
  - `404` si el negocio no existe.
  - `500` en error del servidor.

## Services

### GET `/api/services?businessId={uuid}`
- URL ejemplo: http://localhost:3000/api/services?businessId=BUSINESS_UUID
- Acción: lista servicios de un negocio, ordenados por `sort_order`.
- Respuesta esperada: `200` con `{ services: [...] }`, `400` query inválida.

### POST `/api/services`
- URL: http://localhost:3000/api/services
- Acción: crea un servicio para un negocio (requiere sesión).
- Body JSON (ejemplo mínimo válido):
```json
{
  "business_id": "BUSINESS_UUID",
  "name": "Corte + Barba",
  "category": "combo",
  "duration_minutes": 45,
  "price": 3500,
  "currency": "ARS",
  "requires_deposit": false
}
```
- Respuesta esperada: `201` con `{ service: {...} }`, `401` no autorizado, `400` validación.

### PATCH `/api/services/{id}`
- URL ejemplo: http://localhost:3000/api/services/SERVICE_UUID
- Acción: actualiza un servicio existente (requiere sesión). Campos opcionales: `name`, `description`, `category`, `duration_minutes`, `price`, `status`, `image_url`, `sort_order`, `requires_deposit`, `deposit_amount`, `currency`.
- Body JSON (solo los campos a modificar):
```json
{
  "name": "Corte + Barba Premium",
  "price": 4000,
  "status": "active"
}
```
- Respuesta esperada: `200` con `{ service: {...} }`, `400` sin campos o validación, `401` no autorizado, `500` en error.

### DELETE `/api/services/{id}`
- URL ejemplo: http://localhost:3000/api/services/SERVICE_UUID
- Acción: elimina un servicio (requiere sesión).
- Respuesta esperada: `200` con `{ success: true }`, `400` ID inválido, `401` no autorizado, `500` en error.

## Staff

### GET `/api/staff?businessId={uuid}`
- URL ejemplo: http://localhost:3000/api/staff?businessId=BUSINESS_UUID
- Acción: lista staff desde la vista `staff_with_user` (incluye nombre/email).
- Respuesta esperada: `200` con `{ staff: [...] }`, `400` query inválida.

### POST `/api/staff`
- URL: http://localhost:3000/api/staff
- Acción: crea registro de staff y actualiza rol/business del usuario asociado (requiere sesión).
- Body JSON (ejemplo):
```json
{
  "user_id": "USER_UUID",
  "business_id": "BUSINESS_UUID",
  "role": "staff",
  "title": "Senior Barber",
  "status": "active",
  "color": "#8b5cf6"
}
```
- Respuesta esperada: `201` con `{ staff: {...} }`, `401` no autorizado, `400` validación/duplicado.

### PATCH `/api/staff/{id}`
- URL ejemplo: http://localhost:3000/api/staff/STAFF_UUID
- Acción: actualiza un miembro del staff (requiere sesión). Campos opcionales según `updateStaffSchema`.
- Respuesta esperada: `200` con `{ staff: {...} }`, `400` validación, `401` no autorizado, `500` en error.

### DELETE `/api/staff/{id}`
- URL ejemplo: http://localhost:3000/api/staff/STAFF_UUID
- Acción: elimina el registro de staff (requiere sesión).
- Respuesta esperada: `200` con `{ success: true }`, `400` ID inválido, `401` no autorizado, `500` en error.

## Appointments

### GET `/api/appointments?businessId={uuid}`
- URL ejemplo: http://localhost:3000/api/appointments?businessId=BUSINESS_UUID
- Acción: lista citas del negocio desde `appointments` con relaciones anidadas (`customers`, `services`, `staff`), ordenadas por `scheduled_at`.
- Query params aceptados:
  - `businessId` (recomendado en frontend)
  - `business_id` (compatibilidad)
- Respuesta esperada: `200` con `{ appointments: [...] }`, `400` si falta `businessId/business_id`, `500` en error.
- Estructura real de cada cita (resumen):
```json
{
  "id": "APPOINTMENT_UUID",
  "scheduled_at": "2026-02-10T14:00:00.000Z",
  "status": "confirmed",
  "price": 3500,
  "duration_minutes": 45,
  "customers": {
    "full_name": "Juan Perez",
    "email": "juan@test.com",
    "phone": "123456"
  },
  "services": {
    "name": "Corte de Pelo",
    "price": 3500
  },
  "staff": {
    "title": "Barbero Senior"
  }
}
```

Para frontend (`/admin/appointments`), consumir campos anidados:
- Cliente: `appointment.customers?.full_name`
- Servicio: `appointment.services?.name`
- Staff: `appointment.staff?.title`
- Manejar `null` seguro (ejemplo: `customers` nulo -> mostrar "Cliente Invitado").

### POST `/api/appointments`
- URL: http://localhost:3000/api/appointments
- Acción: crea una cita y calcula `end_at` en base a `scheduled_at + duration_minutes`.
- Body JSON:
```json
{
  "business_id": "BUSINESS_UUID",
  "staff_id": "STAFF_UUID",
  "service_id": "SERVICE_UUID",
  "scheduled_at": "2026-02-10T14:00:00.000Z",
  "duration_minutes": 45,
  "price": 3500
}
```
- Respuesta esperada: `201` con `{ appointment: {...} }`, `400` en error.

### PATCH `/api/appointments/{id}`
- URL ejemplo: http://localhost:3000/api/appointments/APPOINTMENT_UUID
- Acción: actualiza una cita existente (estado y/o notas), confiando en RLS para permisos.
- Comportamiento adicional actual:
- Si `status = "cancelled"`, el endpoint también setea:
  - `cancelled_at = now()`
  - `cancellation_reason = "other"` (el detalle libre queda en `notes`)
- Body JSON (ejemplos):
```json
{
  "status": "confirmed"
}
```
```json
{
  "notes": "Cliente pidió reprogramar si hay demora"
}
```
```json
{
  "status": "cancelled",
  "notes": "Cancelado por solicitud del cliente"
}
```
- Estados permitidos: `pending`, `confirmed`, `cancelled`, `completed`, `no_show`.
- Respuesta esperada: `200` con `{ appointment: {...} }`, `400` en validación/error de DB, `401` no autorizado.

Nota: actualmente `/api/appointments` expone `POST` y `/api/appointments/{id}` expone `PATCH`.

## Availability

### GET `/api/availability?staffId={uuid}&date={YYYY-MM-DD}&duration={min}`
- URL ejemplo: http://localhost:3000/api/availability?staffId=STAFF_UUID&date=2026-02-20&duration=45
- Acción: consulta slots disponibles llamando RPC `get_available_slots` en Supabase.
- Respuesta esperada: `200` con lista de slots, `400` si faltan parámetros o falla la RPC.

## Transactions (Finanzas)

### GET `/api/transactions?businessId={uuid}`
- URL ejemplo: http://localhost:3000/api/transactions?businessId=BUSINESS_UUID
- Acción: lista transacciones del negocio, ordenadas por `created_at` descendente.
- Respuesta esperada: `200` con `{ transactions: [...] }`, `400` si falta o es inválido `businessId`, `500` en error.

### POST `/api/transactions`
- URL: http://localhost:3000/api/transactions
- Acción: crea una transacción (ingreso o gasto) para el negocio (requiere sesión).
- Body JSON (ejemplo):
```json
{
  "business_id": "BUSINESS_UUID",
  "type": "payment",
  "amount": 15000,
  "currency": "ARS",
  "payment_method": "cash",
  "status": "completed",
  "description": "Corte - Juan",
  "reference": null
}
```
- Tipos (`type`): `payment`, `refund`, `deposit`, `adjustment`, `tip`. Para gastos se usa `adjustment` y opcionalmente `expense_category` en el body (se guarda en `metadata`).
- Categorías de gasto (`expense_category`, opcional, para `type: "adjustment"`): `salary`, `rent`, `supplies`, `utilities`, `other`.
- Monto: entero en centavos (ej. 15000 = $150,00 ARS).
- Respuesta esperada: `201` con `{ transaction: {...} }`, `400` validación, `401` no autorizado, `500` en error.

### PATCH `/api/transactions/{id}`
- URL ejemplo: http://localhost:3000/api/transactions/TRANSACTION_UUID
- Acción: actualiza una transacción (requiere sesión). Se puede enviar `expense_category` para gastos; se persiste en `metadata`.
- Body JSON (solo campos a modificar):
```json
{
  "type": "adjustment",
  "status": "completed",
  "amount": 20000,
  "payment_method": "transfer",
  "description": "Sueldo marzo",
  "expense_category": "salary"
}
```
- Respuesta esperada: `200` con `{ transaction: {...} }`, `400` validación o sin campos, `401` no autorizado, `500` en error.

### DELETE `/api/transactions/{id}`
- URL ejemplo: http://localhost:3000/api/transactions/TRANSACTION_UUID
- Acción: elimina una transacción (requiere sesión).
- Respuesta esperada: `200` con `{ success: true }`, `400` ID inválido, `401` no autorizado, `500` en error.

---

## Flujo de reservas (cliente)

Rutas públicas para que el cliente reserve sin estar logueado en el admin.

- **Landing**  
  - `GET /book/{businessSlug}` (ej. http://localhost:3000/book/barberia-esparta)  
  - Muestra dos opciones: **Mis reservas** (ingresar email y listar citas con ese email en ese negocio) y **Hacer una reserva** (enlace al flujo de alta).

- **Hacer una reserva**  
  - `GET /book/{businessSlug}/service` — elegir servicio.  
  - `GET /book/{businessSlug}/staff?serviceId=...` — elegir profesional.  
  - `GET /book/{businessSlug}/schedule?serviceId=...&staffId=...` — elegir fecha y horario.  
  - `GET /book/{businessSlug}/confirm?serviceId=...&staffId=...&date=...` — confirmar y crear la cita (POST a `/api/appointments`).

- **Mis reservas**  
  - En la misma landing, el cliente ingresa su email y se llama a `GET /api/public/appointments?slug={slug}&email={email}` para mostrar la lista de reservas.

---

## Estado rápido por endpoint
- Auth: `login`, `signup`, `logout`, `callback`.
- Negocios: `GET/POST`.
- Público negocio: `GET /api/public/business/{slug}`.
- Público reservas: `GET /api/public/appointments?slug=&email=` (Mis reservas).
- Servicios: `GET`, `POST`, `PATCH /api/services/{id}`, `DELETE /api/services/{id}`.
- Staff: `GET`, `POST`, `PATCH /api/staff/{id}`, `DELETE /api/staff/{id}`.
- Citas: `GET`, `POST`, `PATCH /api/appointments/{id}`.
- Disponibilidad: `GET`.
- Transacciones (finanzas): `GET`, `POST`, `PATCH /api/transactions/{id}`, `DELETE /api/transactions/{id}`.

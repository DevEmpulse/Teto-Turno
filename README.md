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

---

## Estado rápido por endpoint
- Auth: `login`, `signup`, `logout`, `callback`.
- Negocios: `GET/POST`.
- Público negocio: `GET /api/public/business/{slug}`.
- Servicios: `GET/POST`.
- Staff: `GET/POST`.
- Citas: `GET`, `POST`, `PATCH /api/appointments/{id}`.
- Disponibilidad: `GET`.

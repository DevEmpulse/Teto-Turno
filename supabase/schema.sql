-- ============================================
-- TETO BOOKING SAAS - SCHEMA COMPLETO
-- Base de datos para Supabase
-- Versión: 1.0.0
-- Fecha: 2026-01-05
-- 
-- Incluye:
-- - Todas las tablas del sistema
-- - Row Level Security (RLS)
-- - Auditoría completa
-- - Protección contra brute force
-- - Validaciones OWASP ASVS Level 1
-- ============================================

-- ============================================
-- EXTENSIONES NECESARIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TIPOS PERSONALIZADOS (ENUMS)
-- ============================================

-- Roles de usuario
CREATE TYPE user_role AS ENUM ('client', 'admin', 'staff', 'owner');

-- Estados de usuario
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Tipos de negocio
CREATE TYPE business_type AS ENUM ('barbershop', 'salon', 'spa', 'clinic', 'studio', 'other');

-- Estados de negocio
CREATE TYPE business_status AS ENUM ('active', 'inactive', 'suspended', 'pending_setup');

-- Categorías de servicio
CREATE TYPE service_category AS ENUM ('haircut', 'beard', 'coloring', 'treatment', 'styling', 'combo', 'other');

-- Estados de servicio
CREATE TYPE service_status AS ENUM ('active', 'inactive', 'archived');

-- Estados de staff
CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'on_leave');

-- Estados de cita
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

-- Razones de cancelación
CREATE TYPE cancellation_reason AS ENUM ('client_request', 'staff_unavailable', 'business_closed', 'schedule_conflict', 'other');

-- Tipos de transacción
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'deposit', 'adjustment', 'tip');

-- Estados de transacción
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'partially_refunded');

-- Métodos de pago
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'mercadopago', 'other');

-- Canales de notificación
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'sms', 'whatsapp', 'push');

-- Acciones de auditoría
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'failed_login', 'password_change', 'role_change');

-- ============================================
-- 1. TABLA: businesses (Negocios)
-- ============================================
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID, -- Se actualiza después de crear users
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type business_type NOT NULL DEFAULT 'other',
  status business_status NOT NULL DEFAULT 'pending_setup',
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Dirección como JSONB
  address JSONB DEFAULT '{
    "street": "",
    "number": "",
    "apartment": "",
    "city": "",
    "state": "",
    "postalCode": "",
    "country": "Argentina",
    "latitude": null,
    "longitude": null
  }'::jsonb,
  
  -- Configuración del negocio
  settings JSONB NOT NULL DEFAULT '{
    "allowOnlineBooking": true,
    "requireConfirmation": false,
    "minAdvanceBookingHours": 2,
    "maxAdvanceBookingDays": 30,
    "cancellationPolicyHours": 24,
    "sendReminders": true,
    "reminderHoursBefore": 24,
    "defaultCurrency": "ARS",
    "timezone": "America/Argentina/Buenos_Aires",
    "language": "es"
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para businesses
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_type ON businesses(type);

COMMENT ON TABLE businesses IS 'Negocios/establecimientos que usan la plataforma Teto';

-- ============================================
-- 2. TABLA: users (Usuarios)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  status user_status NOT NULL DEFAULT 'pending_verification',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  
  -- Campos de seguridad
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Preferencias
  preferences JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    },
    "language": "es",
    "theme": "system"
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT chk_valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_valid_phone CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-\(\)]{8,20}$'),
  CONSTRAINT chk_names_not_empty CHECK (LENGTH(TRIM(first_name)) > 0 AND LENGTH(TRIM(last_name)) > 0)
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Agregar FK de owner_id en businesses
ALTER TABLE businesses 
  ADD CONSTRAINT fk_businesses_owner 
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);

COMMENT ON TABLE users IS 'Usuarios del sistema: clientes, staff, admins y owners';

-- ============================================
-- 3. TABLA: business_hours (Horarios del Negocio)
-- ============================================
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT true,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '19:00',
  
  UNIQUE(business_id, day_of_week),
  CONSTRAINT chk_valid_hours CHECK (open_time < close_time)
);

CREATE INDEX idx_business_hours_business_id ON business_hours(business_id);

COMMENT ON TABLE business_hours IS 'Horarios de apertura del negocio por día de la semana';

-- ============================================
-- 4. TABLA: services (Servicios)
-- ============================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category service_category NOT NULL DEFAULT 'other',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 5 AND duration_minutes <= 480),
  price INTEGER NOT NULL CHECK (price >= 0), -- En centavos
  currency TEXT NOT NULL DEFAULT 'ARS',
  status service_status NOT NULL DEFAULT 'active',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  requires_deposit BOOLEAN NOT NULL DEFAULT false,
  deposit_amount INTEGER CHECK (deposit_amount IS NULL OR deposit_amount > 0),
  
  -- Configuración adicional
  settings JSONB DEFAULT '{
    "allowOnlineBooking": true,
    "requiresConfirmation": false,
    "maxConcurrent": 1
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_deposit_logic CHECK (
    NOT requires_deposit OR deposit_amount IS NOT NULL
  )
);

-- Índices para services
CREATE INDEX idx_services_business_id ON services(business_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_sort_order ON services(business_id, sort_order);

COMMENT ON TABLE services IS 'Servicios ofrecidos por cada negocio';

-- ============================================
-- 5. TABLA: staff (Personal/Profesionales)
-- ============================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT,
  bio TEXT,
  status staff_status NOT NULL DEFAULT 'active',
  break_duration_minutes INTEGER NOT NULL DEFAULT 10 CHECK (break_duration_minutes >= 0),
  max_daily_appointments INTEGER CHECK (max_daily_appointments IS NULL OR max_daily_appointments > 0),
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Estadísticas cacheadas (se actualizan periódicamente)
  stats JSONB DEFAULT '{
    "totalAppointments": 0,
    "completedAppointments": 0,
    "averageRating": null,
    "totalReviews": 0
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, business_id),
  CONSTRAINT chk_valid_color CHECK (color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Índices para staff
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_business_id ON staff(business_id);
CREATE INDEX idx_staff_status ON staff(status);

COMMENT ON TABLE staff IS 'Personal/profesionales de cada negocio';

-- ============================================
-- 6. TABLA: staff_working_hours (Horarios del Personal)
-- ============================================
CREATE TABLE staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_working BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_id, day_of_week)
);

CREATE INDEX idx_staff_working_hours_staff_id ON staff_working_hours(staff_id);

COMMENT ON TABLE staff_working_hours IS 'Días de la semana que trabaja cada profesional';

-- ============================================
-- 7. TABLA: staff_time_slots (Franjas Horarias)
-- ============================================
CREATE TABLE staff_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_working_hours_id UUID NOT NULL REFERENCES staff_working_hours(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  CONSTRAINT chk_valid_slot CHECK (start_time < end_time)
);

CREATE INDEX idx_staff_time_slots_working_hours ON staff_time_slots(staff_working_hours_id);

COMMENT ON TABLE staff_time_slots IS 'Franjas horarias específicas de cada día laboral';

-- ============================================
-- 8. TABLA: staff_services (Servicios por Staff)
-- ============================================
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Precio personalizado (opcional)
  custom_price INTEGER CHECK (custom_price IS NULL OR custom_price >= 0),
  custom_duration INTEGER CHECK (custom_duration IS NULL OR custom_duration >= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staff_services_staff_id ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service_id ON staff_services(service_id);

COMMENT ON TABLE staff_services IS 'Relación entre staff y los servicios que puede realizar';

-- ============================================
-- 9. TABLA: appointments (Citas/Reservas)
-- ============================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  status appointment_status NOT NULL DEFAULT 'pending',
  
  scheduled_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  
  price INTEGER NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  
  -- Notas
  notes TEXT,
  internal_notes TEXT,
  
  -- Cancelación
  cancellation_reason cancellation_reason,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps de estados
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  
  -- Recordatorios
  reminder_sent_at TIMESTAMPTZ,
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  source TEXT DEFAULT 'web', -- 'web', 'app', 'admin', 'api'
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT chk_valid_time_range CHECK (end_at > scheduled_at),
  CONSTRAINT chk_cancellation_logic CHECK (
    (status != 'cancelled' AND cancellation_reason IS NULL AND cancelled_at IS NULL)
    OR (status = 'cancelled' AND cancellation_reason IS NOT NULL AND cancelled_at IS NOT NULL)
  )
);

-- Índices para appointments
CREATE INDEX idx_appointments_business_id ON appointments(business_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_business_date ON appointments(business_id, scheduled_at);
CREATE INDEX idx_appointments_staff_date ON appointments(staff_id, scheduled_at);
CREATE INDEX idx_appointments_client_upcoming ON appointments(client_id, scheduled_at) 
  WHERE status IN ('pending', 'confirmed');

COMMENT ON TABLE appointments IS 'Citas/reservas de clientes';

-- ============================================
-- 10. TABLA: transactions (Transacciones)
-- ============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  
  type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ARS',
  payment_method payment_method NOT NULL,
  
  description TEXT,
  reference TEXT, -- Referencia externa (ej: ID de MercadoPago)
  
  -- Para reembolsos
  original_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  refund_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT chk_refund_logic CHECK (
    type != 'refund' OR original_transaction_id IS NOT NULL
  )
);

-- Índices para transactions
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_appointment_id ON transactions(appointment_id);
CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_staff_id ON transactions(staff_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_business_date ON transactions(business_id, created_at);
CREATE INDEX idx_transactions_original ON transactions(original_transaction_id);

COMMENT ON TABLE transactions IS 'Transacciones financieras: pagos, reembolsos, propinas';

-- ============================================
-- 11. TABLA: notifications (Notificaciones)
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL, -- 'appointment_reminder', 'booking_confirmed', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Referencia a entidad relacionada
  entity_type TEXT, -- 'appointment', 'transaction', etc.
  entity_id UUID,
  
  data JSONB DEFAULT '{}'::jsonb,
  
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  
  -- Para reintentos
  send_attempts INTEGER DEFAULT 0,
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_business_id ON notifications(business_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at) 
  WHERE read_at IS NULL;

COMMENT ON TABLE notifications IS 'Notificaciones del sistema para usuarios';

-- ============================================
-- 12. TABLA: reviews (Reseñas)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  -- Respuesta del negocio
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false, -- Verificado que fue cliente real
  
  -- Para moderación
  reported_at TIMESTAMPTZ,
  reported_reason TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(appointment_id)
);

-- Índices para reviews
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_client_id ON reviews(client_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_visible ON reviews(business_id, created_at) WHERE is_visible = true;

COMMENT ON TABLE reviews IS 'Reseñas de clientes sobre sus citas';

-- ============================================
-- 13. TABLA: blocked_times (Bloqueos de Horario)
-- ============================================
CREATE TABLE blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE, -- NULL = aplica a todo el negocio
  
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  
  -- Recurrencia
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT, -- Formato iCal RRULE
  recurrence_end_date DATE,
  
  -- Tipo de bloqueo
  block_type TEXT NOT NULL DEFAULT 'blocked', -- 'blocked', 'vacation', 'holiday', 'event'
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT chk_valid_block_range CHECK (start_at < end_at)
);

-- Índices para blocked_times
CREATE INDEX idx_blocked_times_business_id ON blocked_times(business_id);
CREATE INDEX idx_blocked_times_staff_id ON blocked_times(staff_id);
CREATE INDEX idx_blocked_times_dates ON blocked_times(start_at, end_at);

COMMENT ON TABLE blocked_times IS 'Bloqueos de horario (vacaciones, feriados, eventos)';

-- ============================================
-- 14. TABLA: audit_logs (Registros de Auditoría)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[], -- Lista de campos que cambiaron
  
  ip_address INET,
  user_agent TEXT,
  
  -- Contexto adicional
  context JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_business_id ON audit_logs(business_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Particionar por fecha para mejor rendimiento (mantener últimos 90 días activos)
CREATE INDEX idx_audit_logs_recent ON audit_logs(created_at) 
  WHERE created_at > NOW() - INTERVAL '90 days';

COMMENT ON TABLE audit_logs IS 'Registros de auditoría para cumplimiento OWASP';

-- ============================================
-- 15. TABLA: user_sessions (Sesiones de Usuario)
-- ============================================
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  session_token_hash TEXT NOT NULL, -- Hash del token de sesión
  refresh_token_hash TEXT, -- Hash del refresh token
  
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  is_valid BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token_hash);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at) WHERE is_valid = true;
CREATE INDEX idx_user_sessions_valid ON user_sessions(user_id, is_valid) WHERE is_valid = true;

COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios para gestión de tokens';

-- ============================================
-- 16. TABLA: login_attempts (Intentos de Login)
-- ============================================
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  
  -- Para análisis de seguridad
  country_code TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);
CREATE INDEX idx_login_attempts_recent_failed ON login_attempts(email, created_at) 
  WHERE success = false AND created_at > NOW() - INTERVAL '1 hour';

COMMENT ON TABLE login_attempts IS 'Registro de intentos de login para protección contra brute force';

-- ============================================
-- 17. TABLA: api_keys (Claves de API)
-- ============================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Hash de la API key
  key_prefix TEXT NOT NULL, -- Primeros caracteres para identificación
  
  permissions JSONB NOT NULL DEFAULT '["read"]'::jsonb,
  rate_limit INTEGER DEFAULT 1000, -- Requests por hora
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_business_id ON api_keys(business_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

COMMENT ON TABLE api_keys IS 'Claves de API para integraciones externas';

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- ============================================
-- Función: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Función: Crear perfil de usuario automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Nuevo'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    'pending_verification'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario automáticamente en signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Función: Calcular end_at de appointment
-- ============================================
CREATE OR REPLACE FUNCTION calculate_appointment_end()
RETURNS TRIGGER AS $$
BEGIN
  NEW.end_at = NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::INTERVAL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_calculate_end
  BEFORE INSERT OR UPDATE OF scheduled_at, duration_minutes ON appointments
  FOR EACH ROW EXECUTE FUNCTION calculate_appointment_end();

-- ============================================
-- Función: Inicializar horarios del negocio
-- ============================================
CREATE OR REPLACE FUNCTION initialize_business_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear horarios por defecto (Lun-Sáb 9-19, Dom cerrado)
  INSERT INTO business_hours (business_id, day_of_week, is_open, open_time, close_time)
  VALUES
    (NEW.id, 0, false, '09:00', '19:00'), -- Domingo
    (NEW.id, 1, true, '09:00', '19:00'),  -- Lunes
    (NEW.id, 2, true, '09:00', '19:00'),  -- Martes
    (NEW.id, 3, true, '09:00', '19:00'),  -- Miércoles
    (NEW.id, 4, true, '09:00', '19:00'),  -- Jueves
    (NEW.id, 5, true, '09:00', '19:00'),  -- Viernes
    (NEW.id, 6, true, '09:00', '14:00');  -- Sábado (medio día)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_initialize_hours
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION initialize_business_hours();

-- ============================================
-- Función: Inicializar horarios del staff
-- ============================================
CREATE OR REPLACE FUNCTION initialize_staff_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_working_hours_id UUID;
BEGIN
  -- Crear horarios por defecto (Lun-Vie trabajando)
  FOR i IN 0..6 LOOP
    INSERT INTO staff_working_hours (staff_id, day_of_week, is_working)
    VALUES (NEW.id, i, i BETWEEN 1 AND 5)
    RETURNING id INTO v_working_hours_id;
    
    -- Crear time slot para días laborales
    IF i BETWEEN 1 AND 5 THEN
      INSERT INTO staff_time_slots (staff_working_hours_id, start_time, end_time)
      VALUES (v_working_hours_id, '09:00', '18:00');
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_initialize_hours
  AFTER INSERT ON staff
  FOR EACH ROW EXECUTE FUNCTION initialize_staff_hours();

-- ============================================
-- Función: Auditoría automática
-- ============================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_action audit_action;
  v_user_id UUID;
  v_business_id UUID;
  v_changed_fields TEXT[];
BEGIN
  -- Obtener usuario actual (puede ser NULL si es trigger de sistema)
  v_user_id := auth.uid();
  
  -- Determinar acción
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_new_values := to_jsonb(NEW);
    v_business_id := CASE WHEN TG_TABLE_NAME = 'businesses' THEN NEW.id ELSE NEW.business_id END;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    v_business_id := CASE WHEN TG_TABLE_NAME = 'businesses' THEN NEW.id ELSE NEW.business_id END;
    
    -- Calcular campos que cambiaron
    SELECT ARRAY_AGG(key) INTO v_changed_fields
    FROM jsonb_each(v_new_values) AS n(key, value)
    WHERE v_old_values->key IS DISTINCT FROM n.value
      AND key NOT IN ('updated_at', 'created_at');
      
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_old_values := to_jsonb(OLD);
    v_business_id := CASE WHEN TG_TABLE_NAME = 'businesses' THEN OLD.id ELSE OLD.business_id END;
  END IF;
  
  -- Insertar en audit_logs (solo si hay cambios significativos)
  IF v_action = 'create' OR v_action = 'delete' OR array_length(v_changed_fields, 1) > 0 THEN
    INSERT INTO audit_logs (
      user_id,
      business_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      changed_fields
    ) VALUES (
      v_user_id,
      v_business_id,
      v_action,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      v_old_values,
      v_new_values,
      v_changed_fields
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar auditoría a tablas sensibles
CREATE TRIGGER audit_appointments
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users
  AFTER UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_staff
  AFTER INSERT OR UPDATE OR DELETE ON staff
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_services
  AFTER INSERT OR UPDATE OR DELETE ON services
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================
-- Función: Validar appointment
-- ============================================
CREATE OR REPLACE FUNCTION validate_appointment()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que staff pertenece al negocio
  IF NOT EXISTS (
    SELECT 1 FROM staff 
    WHERE id = NEW.staff_id 
    AND business_id = NEW.business_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Staff no pertenece a este negocio o no está activo';
  END IF;
  
  -- Verificar que servicio pertenece al negocio
  IF NOT EXISTS (
    SELECT 1 FROM services 
    WHERE id = NEW.service_id 
    AND business_id = NEW.business_id
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Servicio no pertenece a este negocio o no está activo';
  END IF;
  
  -- Verificar que staff puede realizar el servicio
  IF NOT EXISTS (
    SELECT 1 FROM staff_services 
    WHERE staff_id = NEW.staff_id 
    AND service_id = NEW.service_id
  ) THEN
    RAISE EXCEPTION 'El profesional no puede realizar este servicio';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_appointment_trigger
  BEFORE INSERT OR UPDATE OF staff_id, service_id, business_id ON appointments
  FOR EACH ROW EXECUTE FUNCTION validate_appointment();

-- ============================================
-- Función: Verificar login bloqueado
-- ============================================
CREATE OR REPLACE FUNCTION is_login_blocked(p_email TEXT, p_ip_address INET)
RETURNS BOOLEAN AS $$
DECLARE
  v_failed_attempts INTEGER;
  v_lockout_minutes INTEGER := 15;
  v_max_attempts INTEGER := 5;
BEGIN
  -- Contar intentos fallidos recientes por email O IP
  SELECT COUNT(*) INTO v_failed_attempts
  FROM login_attempts
  WHERE (email = p_email OR ip_address = p_ip_address)
    AND success = false
    AND created_at > NOW() - (v_lockout_minutes || ' minutes')::INTERVAL;
  
  RETURN v_failed_attempts >= v_max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Función: Registrar intento de login
-- ============================================
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_email TEXT,
  p_ip_address INET,
  p_user_agent TEXT,
  p_success BOOLEAN,
  p_failure_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason)
  VALUES (p_email, p_ip_address, p_user_agent, p_success, p_failure_reason);
  
  -- Actualizar contador en users si existe
  IF p_success THEN
    UPDATE users 
    SET failed_login_attempts = 0, 
        last_login_at = NOW(),
        locked_until = NULL
    WHERE email = p_email;
  ELSE
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE 
          WHEN failed_login_attempts >= 4 THEN NOW() + INTERVAL '15 minutes'
          ELSE locked_until
        END
    WHERE email = p_email;
  END IF;
  
  -- Limpiar intentos viejos (más de 24 horas)
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Función: Invalidar todas las sesiones
-- ============================================
CREATE OR REPLACE FUNCTION revoke_all_user_sessions(
  p_user_id UUID, 
  p_reason TEXT DEFAULT 'manual_logout'
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_sessions
  SET is_valid = false,
      revoked_at = NOW(),
      revoked_reason = p_reason
  WHERE user_id = p_user_id
    AND is_valid = true;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Registrar en auditoría
  INSERT INTO audit_logs (user_id, action, entity_type, context)
  VALUES (p_user_id, 'logout', 'session', jsonb_build_object('reason', p_reason, 'sessions_revoked', v_count));
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Función: Verificar disponibilidad de slot
-- ============================================
CREATE OR REPLACE FUNCTION check_slot_availability(
  p_staff_id UUID,
  p_scheduled_at TIMESTAMPTZ,
  p_duration_minutes INTEGER,
  p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_end_at TIMESTAMPTZ;
  v_conflict_count INTEGER;
  v_blocked_count INTEGER;
BEGIN
  v_end_at := p_scheduled_at + (p_duration_minutes || ' minutes')::INTERVAL;
  
  -- Verificar conflictos con otras citas
  SELECT COUNT(*) INTO v_conflict_count
  FROM appointments
  WHERE staff_id = p_staff_id
    AND id != COALESCE(p_exclude_appointment_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND status NOT IN ('cancelled', 'no_show')
    AND (
      (scheduled_at <= p_scheduled_at AND end_at > p_scheduled_at)
      OR (scheduled_at < v_end_at AND end_at >= v_end_at)
      OR (scheduled_at >= p_scheduled_at AND end_at <= v_end_at)
    );
  
  IF v_conflict_count > 0 THEN
    RETURN false;
  END IF;
  
  -- Verificar bloqueos de horario
  SELECT COUNT(*) INTO v_blocked_count
  FROM blocked_times
  WHERE (staff_id = p_staff_id OR staff_id IS NULL)
    AND (
      (start_at <= p_scheduled_at AND end_at > p_scheduled_at)
      OR (start_at < v_end_at AND end_at >= v_end_at)
      OR (start_at >= p_scheduled_at AND end_at <= v_end_at)
    );
  
  RETURN v_blocked_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Función: Obtener slots disponibles
-- ============================================
CREATE OR REPLACE FUNCTION get_available_slots(
  p_staff_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER,
  p_slot_interval INTEGER DEFAULT 30
) RETURNS TABLE (slot_time TIME, slot_datetime TIMESTAMPTZ) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_start_time TIME;
  v_end_time TIME;
  v_current_slot TIME;
  v_timezone TEXT;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::INTEGER;
  
  -- Obtener timezone del negocio
  SELECT b.settings->>'timezone' INTO v_timezone
  FROM staff s
  JOIN businesses b ON s.business_id = b.id
  WHERE s.id = p_staff_id;
  
  v_timezone := COALESCE(v_timezone, 'America/Argentina/Buenos_Aires');
  
  -- Obtener horario de trabajo del staff para ese día
  SELECT ts.start_time, ts.end_time
  INTO v_start_time, v_end_time
  FROM staff_working_hours swh
  JOIN staff_time_slots ts ON swh.id = ts.staff_working_hours_id
  WHERE swh.staff_id = p_staff_id
    AND swh.day_of_week = v_day_of_week
    AND swh.is_working = true
  LIMIT 1;
  
  IF v_start_time IS NULL THEN
    RETURN;
  END IF;
  
  v_current_slot := v_start_time;
  
  WHILE v_current_slot + (p_duration_minutes || ' minutes')::INTERVAL <= v_end_time LOOP
    IF check_slot_availability(
      p_staff_id,
      (p_date::TEXT || ' ' || v_current_slot::TEXT)::TIMESTAMPTZ AT TIME ZONE v_timezone,
      p_duration_minutes
    ) THEN
      slot_time := v_current_slot;
      slot_datetime := (p_date::TEXT || ' ' || v_current_slot::TEXT)::TIMESTAMPTZ AT TIME ZONE v_timezone;
      RETURN NEXT;
    END IF;
    
    v_current_slot := v_current_slot + (p_slot_interval || ' minutes')::INTERVAL;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: users
-- ============================================

-- Usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil (excepto rol y status)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM users WHERE id = auth.uid())
    AND status = (SELECT status FROM users WHERE id = auth.uid())
  );

-- Staff puede ver usuarios de su negocio
CREATE POLICY "users_select_business" ON users
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM staff WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Owners pueden gestionar usuarios de su negocio
CREATE POLICY "users_manage_business" ON users
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS: businesses
-- ============================================

-- Cualquiera puede ver negocios activos (para booking público)
CREATE POLICY "businesses_select_public" ON businesses
  FOR SELECT USING (status = 'active');

-- Owners pueden ver/editar su negocio
CREATE POLICY "businesses_manage_own" ON businesses
  FOR ALL USING (owner_id = auth.uid());

-- Staff puede ver su negocio
CREATE POLICY "businesses_select_staff" ON businesses
  FOR SELECT USING (
    id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: business_hours
-- ============================================

-- Cualquiera puede ver horarios de negocios activos
CREATE POLICY "business_hours_select_public" ON business_hours
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE status = 'active')
  );

-- Staff puede gestionar horarios de su negocio
CREATE POLICY "business_hours_manage" ON business_hours
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: services
-- ============================================

-- Cualquiera puede ver servicios activos
CREATE POLICY "services_select_public" ON services
  FOR SELECT USING (status = 'active');

-- Staff puede ver todos los servicios de su negocio
CREATE POLICY "services_select_business" ON services
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
  );

-- Staff puede gestionar servicios de su negocio
CREATE POLICY "services_manage" ON services
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: staff
-- ============================================

-- Cualquiera puede ver staff activo
CREATE POLICY "staff_select_public" ON staff
  FOR SELECT USING (status = 'active');

-- Staff puede verse a sí mismo
CREATE POLICY "staff_select_own" ON staff
  FOR SELECT USING (user_id = auth.uid());

-- Staff puede actualizar su propio perfil (limitado)
CREATE POLICY "staff_update_own" ON staff
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND status = (SELECT status FROM staff WHERE user_id = auth.uid() LIMIT 1)
  );

-- Owner puede gestionar staff
CREATE POLICY "staff_manage_owner" ON staff
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: staff_working_hours
-- ============================================

-- Cualquiera puede ver horarios de staff activo
CREATE POLICY "staff_hours_select_public" ON staff_working_hours
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE status = 'active')
  );

-- Staff puede gestionar sus propios horarios
CREATE POLICY "staff_hours_manage_own" ON staff_working_hours
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
  );

-- Owner puede gestionar horarios de su staff
CREATE POLICY "staff_hours_manage_owner" ON staff_working_hours
  FOR ALL USING (
    staff_id IN (
      SELECT id FROM staff WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================
-- POLÍTICAS RLS: staff_time_slots
-- ============================================

-- Similar a staff_working_hours
CREATE POLICY "staff_slots_select_public" ON staff_time_slots
  FOR SELECT USING (
    staff_working_hours_id IN (
      SELECT id FROM staff_working_hours WHERE staff_id IN (
        SELECT id FROM staff WHERE status = 'active'
      )
    )
  );

CREATE POLICY "staff_slots_manage" ON staff_time_slots
  FOR ALL USING (
    staff_working_hours_id IN (
      SELECT swh.id FROM staff_working_hours swh
      JOIN staff s ON swh.staff_id = s.id
      WHERE s.user_id = auth.uid()
         OR s.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

-- ============================================
-- POLÍTICAS RLS: staff_services
-- ============================================

CREATE POLICY "staff_services_select_public" ON staff_services
  FOR SELECT USING (
    staff_id IN (SELECT id FROM staff WHERE status = 'active')
  );

CREATE POLICY "staff_services_manage" ON staff_services
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
    OR staff_id IN (
      SELECT id FROM staff WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================
-- POLÍTICAS RLS: appointments
-- ============================================

-- Clientes pueden ver sus propias citas
CREATE POLICY "appointments_select_client" ON appointments
  FOR SELECT USING (client_id = auth.uid());

-- Clientes pueden crear citas
CREATE POLICY "appointments_insert_client" ON appointments
  FOR INSERT WITH CHECK (client_id = auth.uid());

-- Clientes pueden actualizar sus citas (solo cancelar)
CREATE POLICY "appointments_update_client" ON appointments
  FOR UPDATE USING (
    client_id = auth.uid() 
    AND status IN ('pending', 'confirmed')
  );

-- Staff puede ver citas de su negocio
CREATE POLICY "appointments_select_staff" ON appointments
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
  );

-- Staff puede gestionar citas de su negocio
CREATE POLICY "appointments_manage_staff" ON appointments
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM staff WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Owner puede gestionar todas las citas
CREATE POLICY "appointments_manage_owner" ON appointments
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: transactions
-- ============================================

-- Clientes pueden ver sus propias transacciones
CREATE POLICY "transactions_select_client" ON transactions
  FOR SELECT USING (client_id = auth.uid());

-- Staff puede ver transacciones de su negocio
CREATE POLICY "transactions_select_staff" ON transactions
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
  );

-- Solo staff/owner puede crear/actualizar transacciones
CREATE POLICY "transactions_manage" ON transactions
  FOR ALL USING (
    business_id IN (
      SELECT business_id FROM staff WHERE user_id = auth.uid() AND status = 'active'
    )
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: notifications
-- ============================================

-- Usuarios pueden ver sus propias notificaciones
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden marcar como leídas sus notificaciones
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Sistema puede crear notificaciones (via service role)
CREATE POLICY "notifications_insert_system" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS: reviews
-- ============================================

-- Cualquiera puede ver reseñas visibles
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (is_visible = true);

-- Clientes pueden crear reseñas de sus citas completadas
CREATE POLICY "reviews_insert_client" ON reviews
  FOR INSERT WITH CHECK (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.id = reviews.appointment_id 
      AND appointments.client_id = auth.uid()
      AND appointments.status = 'completed'
    )
  );

-- Staff puede responder reseñas de su negocio
CREATE POLICY "reviews_update_staff" ON reviews
  FOR UPDATE USING (
    business_id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: blocked_times
-- ============================================

-- Staff puede ver bloqueos de su negocio
CREATE POLICY "blocked_times_select" ON blocked_times
  FOR SELECT USING (
    business_id IN (SELECT business_id FROM staff WHERE user_id = auth.uid())
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Staff puede gestionar sus propios bloqueos
CREATE POLICY "blocked_times_manage_own" ON blocked_times
  FOR ALL USING (
    staff_id IN (SELECT id FROM staff WHERE user_id = auth.uid())
  );

-- Owner puede gestionar todos los bloqueos
CREATE POLICY "blocked_times_manage_owner" ON blocked_times
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- POLÍTICAS RLS: audit_logs
-- ============================================

-- Solo owners pueden ver logs de su negocio
CREATE POLICY "audit_logs_select_owner" ON audit_logs
  FOR SELECT USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Nadie puede modificar audit logs directamente
-- (se crean via triggers con SECURITY DEFINER)

-- ============================================
-- POLÍTICAS RLS: user_sessions
-- ============================================

-- Usuarios pueden ver sus propias sesiones
CREATE POLICY "sessions_select_own" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden revocar sus propias sesiones
CREATE POLICY "sessions_update_own" ON user_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- POLÍTICAS RLS: login_attempts
-- ============================================

-- Solo el sistema puede insertar (via SECURITY DEFINER function)
-- Solo owners pueden ver intentos de su negocio
CREATE POLICY "login_attempts_select_owner" ON login_attempts
  FOR SELECT USING (
    email IN (
      SELECT u.email FROM users u
      JOIN businesses b ON u.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS RLS: api_keys
-- ============================================

-- Solo owner puede gestionar API keys
CREATE POLICY "api_keys_manage_owner" ON api_keys
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Staff con información de usuario
CREATE OR REPLACE VIEW staff_with_user AS
SELECT 
  s.*,
  u.email,
  u.first_name,
  u.last_name,
  u.phone,
  u.avatar_url,
  CONCAT(u.first_name, ' ', u.last_name) AS full_name
FROM staff s
JOIN users u ON s.user_id = u.id;

-- Vista: Citas con toda la información
CREATE OR REPLACE VIEW appointments_detailed AS
SELECT 
  a.*,
  -- Cliente
  c.first_name AS client_first_name,
  c.last_name AS client_last_name,
  c.email AS client_email,
  c.phone AS client_phone,
  CONCAT(c.first_name, ' ', c.last_name) AS client_full_name,
  -- Staff
  st.title AS staff_title,
  st.color AS staff_color,
  su.first_name AS staff_first_name,
  su.last_name AS staff_last_name,
  CONCAT(su.first_name, ' ', su.last_name) AS staff_full_name,
  -- Servicio
  srv.name AS service_name,
  srv.category AS service_category,
  srv.image_url AS service_image,
  -- Negocio
  b.name AS business_name,
  b.slug AS business_slug,
  b.logo_url AS business_logo
FROM appointments a
JOIN users c ON a.client_id = c.id
JOIN staff st ON a.staff_id = st.id
JOIN users su ON st.user_id = su.id
JOIN services srv ON a.service_id = srv.id
JOIN businesses b ON a.business_id = b.id;

-- Vista: Resumen de ingresos por día
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
  business_id,
  DATE(created_at) AS date,
  SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN type = 'refund' AND status = 'completed' THEN amount ELSE 0 END) AS refunds,
  SUM(CASE WHEN type = 'tip' AND status = 'completed' THEN amount ELSE 0 END) AS tips,
  COUNT(CASE WHEN type = 'payment' AND status = 'completed' THEN 1 END) AS transaction_count
FROM transactions
GROUP BY business_id, DATE(created_at);

-- Vista: Estadísticas de staff
CREATE OR REPLACE VIEW staff_performance AS
SELECT 
  s.id AS staff_id,
  s.business_id,
  s.user_id,
  COUNT(a.id) AS total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed_appointments,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) AS cancelled_appointments,
  COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) AS no_shows,
  COALESCE(AVG(r.rating)::NUMERIC(3,2), 0) AS avg_rating,
  COUNT(r.id) AS review_count,
  COALESCE(SUM(CASE WHEN t.type = 'payment' AND t.status = 'completed' THEN t.amount END), 0) AS total_revenue
FROM staff s
LEFT JOIN appointments a ON s.id = a.staff_id
LEFT JOIN reviews r ON s.id = r.staff_id AND r.is_visible = true
LEFT JOIN transactions t ON a.id = t.appointment_id
GROUP BY s.id, s.business_id, s.user_id;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Para búsqueda de texto
CREATE INDEX idx_services_name_search ON services USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_businesses_name_search ON businesses USING gin(to_tsvector('spanish', name));

-- Para consultas de disponibilidad
CREATE INDEX idx_appointments_availability ON appointments(staff_id, scheduled_at, end_at, status)
  WHERE status NOT IN ('cancelled', 'no_show');

-- Para dashboard de hoy
CREATE INDEX idx_appointments_today ON appointments(business_id, scheduled_at)
  WHERE DATE(scheduled_at) = CURRENT_DATE;

-- ============================================
-- FUNCIONES DE LIMPIEZA (Mantenimiento)
-- ============================================

-- Limpiar datos antiguos
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Eliminar login_attempts de más de 7 días
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Eliminar sesiones expiradas de más de 30 días
  DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '30 days';
  
  -- Archivar audit_logs de más de 1 año (mover a tabla de archivo si necesario)
  -- Por ahora solo marcamos con un flag o podemos eliminar si no se requiere
  
  -- Limpiar notificaciones leídas de más de 90 días
  DELETE FROM notifications 
  WHERE read_at IS NOT NULL 
  AND read_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES (Seeds opcionales)
-- ============================================

-- Comentado - descomentar si se necesitan datos de prueba
/*
-- Crear negocio de demo
INSERT INTO businesses (name, slug, type, status, description)
VALUES (
  'Barbería Demo',
  'barberia-demo',
  'barbershop',
  'active',
  'Barbería de demostración para testing'
);
*/

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Comentarios de documentación final
COMMENT ON SCHEMA public IS 'Schema principal de Teto Booking SaaS';


/**
 * Tipos generados para Supabase Database
 * Estos tipos corresponden al schema definido en supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// ENUMS
// ============================================

export type UserRole = 'client' | 'admin' | 'staff' | 'owner';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type BusinessType = 'barbershop' | 'salon' | 'spa' | 'clinic' | 'studio' | 'other';
export type BusinessStatus = 'active' | 'inactive' | 'suspended' | 'pending_setup';
export type ServiceCategory = 'haircut' | 'beard' | 'coloring' | 'treatment' | 'styling' | 'combo' | 'other';
export type ServiceStatus = 'active' | 'inactive' | 'archived';
export type StaffStatus = 'active' | 'inactive' | 'on_leave';
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type CancellationReason = 'client_request' | 'staff_unavailable' | 'business_closed' | 'schedule_conflict' | 'other';
export type TransactionType = 'payment' | 'refund' | 'deposit' | 'adjustment' | 'tip';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mercadopago' | 'other';
export type NotificationChannel = 'in_app' | 'email' | 'sms' | 'whatsapp' | 'push';
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'failed_login' | 'password_change' | 'role_change';

// ============================================
// JSONB TYPES
// ============================================

export interface BusinessAddress {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BusinessSettings {
  allowOnlineBooking: boolean;
  requireConfirmation: boolean;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  cancellationPolicyHours: number;
  sendReminders: boolean;
  reminderHoursBefore: number;
  defaultCurrency: string;
  timezone: string;
  language?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface StaffStats {
  totalAppointments: number;
  completedAppointments: number;
  averageRating: number | null;
  totalReviews: number;
}

export interface ServiceSettings {
  allowOnlineBooking: boolean;
  requiresConfirmation: boolean;
  maxConcurrent: number;
}

export interface DeviceInfo {
  platform?: string;
  browser?: string;
  os?: string;
  device?: string;
}

// ============================================
// TABLE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          status: UserStatus;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          business_id: string | null;
          email_verified_at: string | null;
          last_login_at: string | null;
          password_changed_at: string | null;
          failed_login_attempts: number;
          locked_until: string | null;
          preferences: UserPreferences;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: UserRole;
          status?: UserStatus;
          first_name: string;
          last_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          business_id?: string | null;
          email_verified_at?: string | null;
          last_login_at?: string | null;
          password_changed_at?: string | null;
          failed_login_attempts?: number;
          locked_until?: string | null;
          preferences?: UserPreferences;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: UserRole;
          status?: UserStatus;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          business_id?: string | null;
          email_verified_at?: string | null;
          last_login_at?: string | null;
          password_changed_at?: string | null;
          failed_login_attempts?: number;
          locked_until?: string | null;
          preferences?: UserPreferences;
          updated_at?: string;
        };
      };

      businesses: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          type: BusinessType;
          status: BusinessStatus;
          description: string | null;
          logo_url: string | null;
          cover_image_url: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          address: BusinessAddress;
          settings: BusinessSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          type?: BusinessType;
          status?: BusinessStatus;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: BusinessAddress;
          settings?: BusinessSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string | null;
          name?: string;
          slug?: string;
          type?: BusinessType;
          status?: BusinessStatus;
          description?: string | null;
          logo_url?: string | null;
          cover_image_url?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          address?: BusinessAddress;
          settings?: BusinessSettings;
          updated_at?: string;
        };
      };

      business_hours: {
        Row: {
          id: string;
          business_id: string;
          day_of_week: number;
          is_open: boolean;
          open_time: string;
          close_time: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          day_of_week: number;
          is_open?: boolean;
          open_time?: string;
          close_time?: string;
        };
        Update: {
          business_id?: string;
          day_of_week?: number;
          is_open?: boolean;
          open_time?: string;
          close_time?: string;
        };
      };

      services: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          description: string | null;
          category: ServiceCategory;
          duration_minutes: number;
          price: number;
          currency: string;
          status: ServiceStatus;
          image_url: string | null;
          sort_order: number;
          requires_deposit: boolean;
          deposit_amount: number | null;
          settings: ServiceSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          description?: string | null;
          category?: ServiceCategory;
          duration_minutes: number;
          price: number;
          currency?: string;
          status?: ServiceStatus;
          image_url?: string | null;
          sort_order?: number;
          requires_deposit?: boolean;
          deposit_amount?: number | null;
          settings?: ServiceSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          name?: string;
          description?: string | null;
          category?: ServiceCategory;
          duration_minutes?: number;
          price?: number;
          currency?: string;
          status?: ServiceStatus;
          image_url?: string | null;
          sort_order?: number;
          requires_deposit?: boolean;
          deposit_amount?: number | null;
          settings?: ServiceSettings;
          updated_at?: string;
        };
      };

      staff: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          title: string | null;
          bio: string | null;
          status: StaffStatus;
          break_duration_minutes: number;
          max_daily_appointments: number | null;
          color: string;
          sort_order: number;
          stats: StaffStats;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id: string;
          title?: string | null;
          bio?: string | null;
          status?: StaffStatus;
          break_duration_minutes?: number;
          max_daily_appointments?: number | null;
          color?: string;
          sort_order?: number;
          stats?: StaffStats;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          business_id?: string;
          title?: string | null;
          bio?: string | null;
          status?: StaffStatus;
          break_duration_minutes?: number;
          max_daily_appointments?: number | null;
          color?: string;
          sort_order?: number;
          stats?: StaffStats;
          updated_at?: string;
        };
      };

      staff_working_hours: {
        Row: {
          id: string;
          staff_id: string;
          day_of_week: number;
          is_working: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          day_of_week: number;
          is_working?: boolean;
          created_at?: string;
        };
        Update: {
          staff_id?: string;
          day_of_week?: number;
          is_working?: boolean;
        };
      };

      staff_time_slots: {
        Row: {
          id: string;
          staff_working_hours_id: string;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          staff_working_hours_id: string;
          start_time: string;
          end_time: string;
        };
        Update: {
          staff_working_hours_id?: string;
          start_time?: string;
          end_time?: string;
        };
      };

      staff_services: {
        Row: {
          id: string;
          staff_id: string;
          service_id: string;
          custom_price: number | null;
          custom_duration: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          service_id: string;
          custom_price?: number | null;
          custom_duration?: number | null;
          created_at?: string;
        };
        Update: {
          staff_id?: string;
          service_id?: string;
          custom_price?: number | null;
          custom_duration?: number | null;
        };
      };

      appointments: {
        Row: {
          id: string;
          business_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          status: AppointmentStatus;
          scheduled_at: string;
          end_at: string;
          duration_minutes: number;
          price: number;
          currency: string;
          notes: string | null;
          internal_notes: string | null;
          cancellation_reason: CancellationReason | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          confirmed_at: string | null;
          confirmed_by: string | null;
          completed_at: string | null;
          reminder_sent_at: string | null;
          reminder_24h_sent: boolean;
          reminder_1h_sent: boolean;
          source: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          status?: AppointmentStatus;
          scheduled_at: string;
          end_at?: string;
          duration_minutes: number;
          price: number;
          currency?: string;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: CancellationReason | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          completed_at?: string | null;
          reminder_sent_at?: string | null;
          reminder_24h_sent?: boolean;
          reminder_1h_sent?: boolean;
          source?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          client_id?: string;
          staff_id?: string;
          service_id?: string;
          status?: AppointmentStatus;
          scheduled_at?: string;
          end_at?: string;
          duration_minutes?: number;
          price?: number;
          currency?: string;
          notes?: string | null;
          internal_notes?: string | null;
          cancellation_reason?: CancellationReason | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
          completed_at?: string | null;
          reminder_sent_at?: string | null;
          reminder_24h_sent?: boolean;
          reminder_1h_sent?: boolean;
          source?: string;
          metadata?: Json;
          updated_at?: string;
        };
      };

      transactions: {
        Row: {
          id: string;
          business_id: string;
          appointment_id: string | null;
          client_id: string | null;
          staff_id: string | null;
          type: TransactionType;
          status: TransactionStatus;
          amount: number;
          currency: string;
          payment_method: PaymentMethod;
          description: string | null;
          reference: string | null;
          original_transaction_id: string | null;
          refund_reason: string | null;
          metadata: Json;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          appointment_id?: string | null;
          client_id?: string | null;
          staff_id?: string | null;
          type: TransactionType;
          status?: TransactionStatus;
          amount: number;
          currency?: string;
          payment_method: PaymentMethod;
          description?: string | null;
          reference?: string | null;
          original_transaction_id?: string | null;
          refund_reason?: string | null;
          metadata?: Json;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string;
          appointment_id?: string | null;
          client_id?: string | null;
          staff_id?: string | null;
          type?: TransactionType;
          status?: TransactionStatus;
          amount?: number;
          currency?: string;
          payment_method?: PaymentMethod;
          description?: string | null;
          reference?: string | null;
          original_transaction_id?: string | null;
          refund_reason?: string | null;
          metadata?: Json;
          processed_at?: string | null;
          updated_at?: string;
        };
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          business_id: string | null;
          type: string;
          title: string;
          message: string;
          entity_type: string | null;
          entity_id: string | null;
          data: Json;
          read_at: string | null;
          sent_at: string | null;
          channel: NotificationChannel;
          send_attempts: number;
          last_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_id?: string | null;
          type: string;
          title: string;
          message: string;
          entity_type?: string | null;
          entity_id?: string | null;
          data?: Json;
          read_at?: string | null;
          sent_at?: string | null;
          channel?: NotificationChannel;
          send_attempts?: number;
          last_error?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          business_id?: string | null;
          type?: string;
          title?: string;
          message?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          data?: Json;
          read_at?: string | null;
          sent_at?: string | null;
          channel?: NotificationChannel;
          send_attempts?: number;
          last_error?: string | null;
        };
      };

      reviews: {
        Row: {
          id: string;
          appointment_id: string;
          client_id: string;
          staff_id: string;
          business_id: string;
          rating: number;
          comment: string | null;
          response: string | null;
          responded_at: string | null;
          responded_by: string | null;
          is_visible: boolean;
          is_verified: boolean;
          reported_at: string | null;
          reported_reason: string | null;
          moderated_at: string | null;
          moderated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          client_id: string;
          staff_id: string;
          business_id: string;
          rating: number;
          comment?: string | null;
          response?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          reported_at?: string | null;
          reported_reason?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
          created_at?: string;
        };
        Update: {
          appointment_id?: string;
          client_id?: string;
          staff_id?: string;
          business_id?: string;
          rating?: number;
          comment?: string | null;
          response?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          is_visible?: boolean;
          is_verified?: boolean;
          reported_at?: string | null;
          reported_reason?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
        };
      };

      blocked_times: {
        Row: {
          id: string;
          business_id: string;
          staff_id: string | null;
          title: string;
          description: string | null;
          start_at: string;
          end_at: string;
          is_recurring: boolean;
          recurrence_rule: string | null;
          recurrence_end_date: string | null;
          block_type: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          staff_id?: string | null;
          title: string;
          description?: string | null;
          start_at: string;
          end_at: string;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          recurrence_end_date?: string | null;
          block_type?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          business_id?: string;
          staff_id?: string | null;
          title?: string;
          description?: string | null;
          start_at?: string;
          end_at?: string;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
          recurrence_end_date?: string | null;
          block_type?: string;
          created_by?: string | null;
        };
      };

      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          business_id: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          changed_fields: string[] | null;
          ip_address: string | null;
          user_agent: string | null;
          context: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          business_id?: string | null;
          action: AuditAction;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          changed_fields?: string[] | null;
          ip_address?: string | null;
          user_agent?: string | null;
          context?: Json;
          created_at?: string;
        };
        Update: never; // Audit logs should not be updated
      };

      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token_hash: string;
          refresh_token_hash: string | null;
          device_info: DeviceInfo;
          ip_address: string | null;
          user_agent: string | null;
          is_valid: boolean;
          last_activity_at: string;
          expires_at: string;
          revoked_at: string | null;
          revoked_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token_hash: string;
          refresh_token_hash?: string | null;
          device_info?: DeviceInfo;
          ip_address?: string | null;
          user_agent?: string | null;
          is_valid?: boolean;
          last_activity_at?: string;
          expires_at: string;
          revoked_at?: string | null;
          revoked_reason?: string | null;
          created_at?: string;
        };
        Update: {
          session_token_hash?: string;
          refresh_token_hash?: string | null;
          device_info?: DeviceInfo;
          ip_address?: string | null;
          user_agent?: string | null;
          is_valid?: boolean;
          last_activity_at?: string;
          expires_at?: string;
          revoked_at?: string | null;
          revoked_reason?: string | null;
        };
      };

      login_attempts: {
        Row: {
          id: string;
          email: string;
          ip_address: string;
          user_agent: string | null;
          success: boolean;
          failure_reason: string | null;
          country_code: string | null;
          is_suspicious: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          ip_address: string;
          user_agent?: string | null;
          success: boolean;
          failure_reason?: string | null;
          country_code?: string | null;
          is_suspicious?: boolean;
          created_at?: string;
        };
        Update: never; // Login attempts should not be updated
      };

      api_keys: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          permissions: string[];
          rate_limit: number;
          is_active: boolean;
          expires_at: string | null;
          last_used_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          permissions?: string[];
          rate_limit?: number;
          is_active?: boolean;
          expires_at?: string | null;
          last_used_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          business_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          permissions?: string[];
          rate_limit?: number;
          is_active?: boolean;
          expires_at?: string | null;
          last_used_at?: string | null;
        };
      };
    };

    Views: {
      staff_with_user: {
        Row: {
          id: string;
          user_id: string;
          business_id: string;
          title: string | null;
          bio: string | null;
          status: StaffStatus;
          break_duration_minutes: number;
          max_daily_appointments: number | null;
          color: string;
          sort_order: number;
          stats: StaffStats;
          created_at: string;
          updated_at: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          full_name: string;
        };
      };

      appointments_detailed: {
        Row: {
          id: string;
          business_id: string;
          client_id: string;
          staff_id: string;
          service_id: string;
          status: AppointmentStatus;
          scheduled_at: string;
          end_at: string;
          duration_minutes: number;
          price: number;
          currency: string;
          notes: string | null;
          internal_notes: string | null;
          created_at: string;
          client_first_name: string;
          client_last_name: string;
          client_email: string;
          client_phone: string | null;
          client_full_name: string;
          staff_title: string | null;
          staff_color: string;
          staff_first_name: string;
          staff_last_name: string;
          staff_full_name: string;
          service_name: string;
          service_category: ServiceCategory;
          service_image: string | null;
          business_name: string;
          business_slug: string;
          business_logo: string | null;
        };
      };

      daily_revenue: {
        Row: {
          business_id: string;
          date: string;
          revenue: number;
          refunds: number;
          tips: number;
          transaction_count: number;
        };
      };

      staff_performance: {
        Row: {
          staff_id: string;
          business_id: string;
          user_id: string;
          total_appointments: number;
          completed_appointments: number;
          cancelled_appointments: number;
          no_shows: number;
          avg_rating: number;
          review_count: number;
          total_revenue: number;
        };
      };
    };

    Functions: {
      check_slot_availability: {
        Args: {
          p_staff_id: string;
          p_scheduled_at: string;
          p_duration_minutes: number;
          p_exclude_appointment_id?: string;
        };
        Returns: boolean;
      };

      get_available_slots: {
        Args: {
          p_staff_id: string;
          p_date: string;
          p_duration_minutes: number;
          p_slot_interval?: number;
        };
        Returns: {
          slot_time: string;
          slot_datetime: string;
        }[];
      };

      is_login_blocked: {
        Args: {
          p_email: string;
          p_ip_address: string;
        };
        Returns: boolean;
      };

      record_login_attempt: {
        Args: {
          p_email: string;
          p_ip_address: string;
          p_user_agent: string;
          p_success: boolean;
          p_failure_reason?: string;
        };
        Returns: void;
      };

      revoke_all_user_sessions: {
        Args: {
          p_user_id: string;
          p_reason?: string;
        };
        Returns: number;
      };

      cleanup_old_data: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================

// Tipo para Row de cualquier tabla
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

// Tipo para Insert de cualquier tabla
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

// Tipo para Update de cualquier tabla
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Aliases comunes
export type User = TableRow<'users'>;
export type Business = TableRow<'businesses'>;
export type Service = TableRow<'services'>;
export type Staff = TableRow<'staff'>;
export type Appointment = TableRow<'appointments'>;
export type Transaction = TableRow<'transactions'>;
export type Notification = TableRow<'notifications'>;
export type Review = TableRow<'reviews'>;

// Vista types
export type StaffWithUser = Database['public']['Views']['staff_with_user']['Row'];
export type AppointmentDetailed = Database['public']['Views']['appointments_detailed']['Row'];
export type DailyRevenue = Database['public']['Views']['daily_revenue']['Row'];
export type StaffPerformance = Database['public']['Views']['staff_performance']['Row'];


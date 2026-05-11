// Auto-generate this file by running:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
// This is the hand-crafted version matching 001_initial_schema.sql

export type UserRole = 'user' | 'admin' | 'superadmin' | 'finance_admin' | 'csr_admin';
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'failed';
export type WalletProvisionStatus = 'not_created' | 'pending' | 'ready' | 'failed';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type RefundStatus = 'Pending' | 'Not Applicable' | 'Completed';
export type EscrowStatus =
  | 'AWAITING_KYC'
  | 'AWAITING_PAYMENT'
  | 'FUNDS_HELD'
  | 'DELIVERY_CONFIRMED'
  | 'DISBURSED'
  | 'DISPUTED'
  | 'REFUNDED';
export type NotificationCategory = 'booking' | 'payment' | 'reviews';
export type NotificationStatus = 'read' | 'unread';
export type TicketStatus = 'pending' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketSource = 'website' | 'email' | 'phone' | 'admin';
export type TicketNoteType = 'reply' | 'note';

export interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone_no: string | null;
          full_name: string | null;
          dob: string | null;
          account_disabled: boolean;
          block_reason: string | null;
          two_factor_authentication: boolean;
          bookings_updates: boolean;
          new_listing_submission: boolean;
          email_alerts: boolean;
          last_login: string | null;
          sznd_user_id: string | null;
          sznd_user_tag: string | null;
          kyc_status: KycStatus;
          wallet_status: WalletProvisionStatus;
          role: UserRole;
          push_subscriptions: PushSubscription[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      listings: {
        Row: {
          id: string;
          property_id: string | null;
          user_id: string;
          name: string;
          description: string | null;
          property_type_id: string | null;
          street: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          longitude: number;
          latitude: number;
          hide_status: boolean;
          base_price: number | null;
          security_deposit: number | null;
          cleaning_fee: number | null;
          available_from: string | null;
          available_until: string | null;
          additional_rules: string | null;
          guest_no: number | null;
          size: number;
          bathroom_no: number | null;
          bedroom_no: number | null;
          rating: number;
          status: ListingStatus;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['listings']['Row'], 'id' | 'property_id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['listings']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          start_date: string;
          end_date: string;
          travelers_no: number;
          total_price: number;
          status: BookingStatus;
          refund_status: RefundStatus;
          cancellation_date: string | null;
          cancellation_reason: string | null;
          cancellation_by: string | null;
          cancellation_fee: number;
          total_refund: number;
          first_name: string;
          last_name: string;
          email: string;
          phone_no: string;
          sex: string;
          age: number;
          location: string;
          message: string;
          sznd_user_id: string | null;
          kyc_link: string | null;
          kyc_expires_at: string | null;
          escrow_status: EscrowStatus;
          payment_bank_name: string | null;
          payment_account_number: string | null;
          payment_account_name: string | null;
          payment_currency: string;
          paid_at: string | null;
          provider_reference: string | null;
          sznd_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: NotificationCategory;
          status: NotificationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          review: string;
          rating: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      favourites: {
        Row: { user_id: string; listing_id: string; created_at: string };
        Insert: Omit<Database['public']['Tables']['favourites']['Row'], 'created_at'>;
        Update: never;
      };
      tickets: {
        Row: {
          id: string;
          ticket_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          status: TicketStatus;
          priority: TicketPriority;
          assigned_to: string | null;
          source: TicketSource;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>;
      };
      amenities: {
        Row: { id: string; name: string; icon_id: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['amenities']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['amenities']['Insert']>;
      };
      property_types: {
        Row: { id: string; name: string; icon_id: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['property_types']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['property_types']['Insert']>;
      };
      house_rules: {
        Row: { id: string; name: string; icon_id: string | null; created_at: string; updated_at: string };
        Insert: Omit<Database['public']['Tables']['house_rules']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['house_rules']['Insert']>;
      };
    };
    Views: {};
    Functions: {
      get_my_role: { Returns: UserRole };
      is_admin: { Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      kyc_status: KycStatus;
      listing_status: ListingStatus;
      booking_status: BookingStatus;
      escrow_status: EscrowStatus;
      notification_category: NotificationCategory;
      notification_status: NotificationStatus;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
    };
  };
}

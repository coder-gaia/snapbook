export interface PhotographerProfile {
  id: string; slug: string; display_name: string; bio: string | null
  phone: string | null; instagram: string | null; pix_key: string | null
  pix_info: string | null; avatar_url: string | null; created_at: string
}
export interface Service {
  id: string; photographer_id: string; name: string; description: string | null
  duration_min: number; price: number; deposit: number | null; active: boolean; created_at: string
}
export interface Availability {
  id: string; photographer_id: string; day_of_week: number; start_time: string; end_time: string
}
export interface BlockedDate {
  id: string; photographer_id: string; blocked_date: string; reason: string | null
}
export interface Booking {
  id: string; photographer_id: string; service_id: string
  client_name: string; client_email: string; client_phone: string
  date: string; start_time: string; end_time: string
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null; photographer_notes: string | null; created_at: string
  service?: Service | null
}
export interface ServiceFormData {
  name: string; description: string; duration_min: string; price: string; deposit: string
}
export interface BookingFormData {
  client_name: string; client_email: string; client_phone: string; notes: string
}
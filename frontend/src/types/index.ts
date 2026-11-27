export type Role = 'citizen' | 'provider' | 'moderator' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: Role;
  division: string;
  district: string;
  thana: string;
  avatar_url?: string;
  is_verified: boolean;
  reputation_score: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TrafficReport {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  category: 'congestion' | 'accident' | 'waterlogging' | 'road_closure' | 'construction' | 'checkpoint';
  severity: 'low' | 'medium' | 'high' | 'severe';
  latitude: number;
  longitude: number;
  location_name: string;
  division: string;
  district: string;
  is_official: boolean;
  official_source?: string;
  upvotes_count: number;
  downvotes_count: number;
  verified_count: number;
  status: 'active' | 'resolved' | 'debunked';
  suggested_alternative_route?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
}

export interface NeighborItem {
  id: number;
  owner_id: number;
  title: string;
  description: string;
  category: 'tools' | 'kitchen' | 'medical' | 'books' | 'electronics' | 'baby_gear' | 'sports' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'available' | 'requested' | 'lent' | 'returned' | 'maintenance';
  deposit_amount: number;
  rental_rate_type: 'free' | 'small_deposit' | 'voluntary_treat';
  max_days: number;
  location_name: string;
  division: string;
  district: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  created_at: string;
  owner_name?: string;
  owner_reputation?: number;
}

export interface NeighborLoan {
  id: number;
  item_id: number;
  borrower_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned_pending' | 'returned_confirmed' | 'disputed';
  requested_days: number;
  start_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  notes?: string;
  rating?: number;
  created_at: string;
  item_title?: string;
  borrower_name?: string;
}

export interface NeighborAssistance {
  id: number;
  author_id: number;
  helper_id?: number;
  title: string;
  description: string;
  category: 'elderly_support' | 'emergency_ride' | 'grocery_run' | 'pet_care' | 'tutor' | 'general';
  urgency: 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  division: string;
  district: string;
  location_name: string;
  created_at: string;
  author_name?: string;
  helper_name?: string;
}

export interface KhunjeDaoItem {
  id: number;
  reporter_id: number;
  report_type: 'lost' | 'found';
  item_type: 'phone' | 'wallet_bag' | 'nid_passport' | 'keys' | 'electronics' | 'pet' | 'document' | 'other';
  title: string;
  description: string;
  primary_image_url?: string;
  division: string;
  district: string;
  location_name: string;
  event_date: string;
  latitude?: number;
  longitude?: number;
  status: 'reported' | 'under_review' | 'matched' | 'claimed' | 'verified_handed_over' | 'closed';
  brand_or_identifier?: string;
  safe_handover_location?: string;
  contact_consent: boolean;
  created_at: string;
  reporter_name?: string;
}

export interface KhunjeDaoClaim {
  id: number;
  item_id: number;
  claimant_id: number;
  proof_description: string;
  proof_image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'handed_over';
  verification_notes?: string;
  created_at: string;
  claimant_name?: string;
}

export interface LineLessQueue {
  id: number;
  provider_id: number;
  name: string;
  is_accepting_tokens: boolean;
  current_token_number: number;
  next_token_number: number;
  estimated_wait_per_token_mins: number;
  created_at: string;
}

export interface LineLessProvider {
  id: number;
  name: string;
  category: 'hospital' | 'clinic' | 'bank' | 'utility_center' | 'government_service' | 'customer_care';
  address: string;
  division: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  avg_service_time_mins: number;
  total_served_today: number;
  queues: LineLessQueue[];
}

export interface LineLessToken {
  id: number;
  queue_id: number;
  user_id: number;
  token_number: number;
  token_code: string;
  status: 'waiting' | 'called' | 'in_service' | 'completed' | 'no_show' | 'cancelled';
  estimated_call_time?: string;
  called_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  queue_name?: string;
  provider_name?: string;
  current_queue_token?: number;
}

export interface EasyAccessReview {
  id: number;
  spot_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  ramp_ok: boolean;
  elevator_ok: boolean;
  toilet_ok: boolean;
  created_at: string;
  reviewer_name?: string;
}

export interface EasyAccessSpot {
  id: number;
  title: string;
  category: 'hospital' | 'public_transport' | 'shopping_mall' | 'government_office' | 'park' | 'educational' | 'restaurant';
  address: string;
  division: string;
  district: string;
  latitude: number;
  longitude: number;
  has_wheelchair_ramp: boolean;
  has_lift_elevator: boolean;
  has_accessible_toilet: boolean;
  has_wide_doors: boolean;
  has_tactile_paving: boolean;
  has_accessible_parking: boolean;
  overall_rating: number;
  verified_by_community: boolean;
  verification_count: number;
  images_json?: string;
  notes?: string;
  created_at: string;
  reviews: EasyAccessReview[];
}

export interface ProbashiJob {
  id: number;
  title: string;
  destination_country: string;
  visa_type: string;
  sector: string;
  required_skills: string;
  salary_range: string;
  recruiter_agency: string;
  bmet_approval_no?: string;
  rl_license_no?: string;
  is_verified_agency: boolean;
  source_type: string;
  publication_date: string;
  expiry_date?: string;
  cost_guidelines?: string;
  warnings_against_brokers?: string;
  created_at: string;
}

export interface ProbashiGuide {
  id: number;
  country: string;
  category: string;
  title: string;
  content: string;
  helpline_phone?: string;
  official_links?: string;
  created_at: string;
}

export interface SkillCourse {
  id: number;
  title: string;
  provider_name: string;
  category: string;
  level: string;
  duration_weeks: number;
  is_free: boolean;
  price_bdt: number;
  certificate_provided: boolean;
  language: string;
  enrollment_url?: string;
  description: string;
  created_at: string;
}

export interface WorkHubJob {
  id: number;
  employer_id?: number;
  title: string;
  company_name: string;
  job_type: 'full_time' | 'part_time' | 'freelance' | 'remote' | 'internship';
  workplace_type: 'on_site' | 'remote' | 'hybrid';
  location: string;
  salary_min?: number;
  salary_max?: number;
  skills_required: string;
  experience_level: string;
  description: string;
  is_verified: boolean;
  created_at: string;
}

export interface WorkHubApplication {
  id: number;
  job_id: number;
  applicant_id: number;
  cover_letter?: string;
  resume_url?: string;
  portfolio_url?: string;
  status: 'submitted' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  job_title?: string;
  company_name?: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformStats {
  active_citizens: number;
  traffic_reports_today: number;
  active_community_loans: number;
  reunited_items_count: number;
  virtual_tokens_served: number;
  accessible_spots_mapped: number;
  verified_probashi_jobs: number;
  active_job_seekers: number;
}

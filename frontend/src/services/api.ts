import {
  AuthResponse, User, TrafficReport, NeighborItem, NeighborLoan,
  NeighborAssistance, KhunjeDaoItem, KhunjeDaoClaim,
  LineLessProvider, LineLessQueue, LineLessToken,
  EasyAccessSpot, EasyAccessReview, ProbashiJob, ProbashiGuide,
  SkillCourse, WorkHubJob, WorkHubApplication,
  NotificationItem, PlatformStats
} from '../types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('parabondhu_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.detail) {
        errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // Keep default error
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),
  updateProfile: (data: Partial<User>) => request<User>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Stats
  getStats: () => request<PlatformStats>('/stats'),

  // TrafficAlert
  getTrafficReports: (params?: { category?: string; severity?: string; district?: string; is_official?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.severity) q.append('severity', params.severity);
    if (params?.district) q.append('district', params.district);
    if (params?.is_official !== undefined) q.append('is_official', String(params.is_official));
    return request<TrafficReport[]>(`/traffic/reports?${q.toString()}`);
  },
  createTrafficReport: (data: any) => request<TrafficReport>('/traffic/reports', { method: 'POST', body: JSON.stringify(data) }),
  verifyTrafficReport: (reportId: number, data: { vote_type: string; comment?: string }) =>
    request<any>(`/traffic/reports/${reportId}/verify`, { method: 'POST', body: JSON.stringify(data) }),

  // NeighborShare
  getNeighborItems: (params?: { category?: string; status?: string; district?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.status) q.append('status', params.status);
    if (params?.district) q.append('district', params.district);
    if (params?.search) q.append('search', params.search);
    return request<NeighborItem[]>(`/neighbor/items?${q.toString()}`);
  },
  createNeighborItem: (data: any) => request<NeighborItem>('/neighbor/items', { method: 'POST', body: JSON.stringify(data) }),
  requestNeighborLoan: (data: { item_id: number; requested_days: number; notes?: string }) =>
    request<NeighborLoan>('/neighbor/loans', { method: 'POST', body: JSON.stringify(data) }),
  updateLoanStatus: (loanId: number, action: string, rating?: number) => {
    const q = new URLSearchParams({ action });
    if (rating) q.append('rating', String(rating));
    return request<any>(`/neighbor/loans/${loanId}/status?${q.toString()}`, { method: 'PUT' });
  },
  getNeighborAssistance: (district?: string) => {
    const q = new URLSearchParams();
    if (district) q.append('district', district);
    return request<NeighborAssistance[]>(`/neighbor/assistance?${q.toString()}`);
  },
  createNeighborAssistance: (data: any) =>
    request<NeighborAssistance>('/neighbor/assistance', { method: 'POST', body: JSON.stringify(data) }),
  volunteerForAssistance: (reqId: number) =>
    request<any>(`/neighbor/assistance/${reqId}/volunteer`, { method: 'POST' }),

  // KhunjeDao
  getKhunjeItems: (params?: { report_type?: string; item_type?: string; district?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.report_type) q.append('report_type', params.report_type);
    if (params?.item_type) q.append('item_type', params.item_type);
    if (params?.district) q.append('district', params.district);
    if (params?.search) q.append('search', params.search);
    return request<KhunjeDaoItem[]>(`/khunje/items?${q.toString()}`);
  },
  getKhunjeItem: (id: number) => request<KhunjeDaoItem>(`/khunje/items/${id}`),
  createKhunjeItem: (data: any) => request<KhunjeDaoItem>('/khunje/items', { method: 'POST', body: JSON.stringify(data) }),
  getKhunjeMatches: (id: number) => request<any[]>(`/khunje/match-suggestions/${id}`),
  submitKhunjeClaim: (itemId: number, data: { proof_description: string; proof_image_url?: string }) =>
    request<KhunjeDaoClaim>(`/khunje/claims?item_id=${itemId}`, { method: 'POST', body: JSON.stringify(data) }),
  getKhunjeClaimsForItem: (itemId: number) => request<KhunjeDaoClaim[]>(`/khunje/claims/${itemId}`),
  verifyKhunjeClaim: (claimId: number, action: string, notes?: string) => {
    const q = new URLSearchParams({ action });
    if (notes) q.append('notes', notes);
    return request<any>(`/khunje/claims/${claimId}/verify?${q.toString()}`, { method: 'PUT' });
  },

  // LineLess
  getLineLessProviders: (params?: { category?: string; district?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.district) q.append('district', params.district);
    return request<LineLessProvider[]>(`/lineless/providers?${q.toString()}`);
  },
  createLineLessProvider: (data: any) => request<LineLessProvider>('/lineless/providers', { method: 'POST', body: JSON.stringify(data) }),
  takeDigitalToken: (data: { queue_id: number; notes?: string }) =>
    request<LineLessToken>('/lineless/tokens', { method: 'POST', body: JSON.stringify(data) }),
  getMyTokens: () => request<LineLessToken[]>('/lineless/my-tokens'),
  callNextToken: (queueId: number) => request<any>(`/lineless/queues/${queueId}/call-next`, { method: 'PUT' }),

  // EasyAccess
  getEasyAccessSpots: (params?: { category?: string; district?: string; has_ramp?: boolean; has_lift?: boolean; has_toilet?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.district) q.append('district', params.district);
    if (params?.has_ramp !== undefined) q.append('has_ramp', String(params.has_ramp));
    if (params?.has_lift !== undefined) q.append('has_lift', String(params.has_lift));
    if (params?.has_toilet !== undefined) q.append('has_toilet', String(params.has_toilet));
    if (params?.search) q.append('search', params.search);
    return request<EasyAccessSpot[]>(`/easyaccess/spots?${q.toString()}`);
  },
  createEasyAccessSpot: (data: any) => request<EasyAccessSpot>('/easyaccess/spots', { method: 'POST', body: JSON.stringify(data) }),
  addEasyAccessReview: (spotId: number, data: any) =>
    request<EasyAccessReview>(`/easyaccess/spots/${spotId}/reviews`, { method: 'POST', body: JSON.stringify(data) }),

  // ProbashiConnect
  getProbashiJobs: (params?: { country?: string; sector?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.country) q.append('country', params.country);
    if (params?.sector) q.append('sector', params.sector);
    if (params?.search) q.append('search', params.search);
    return request<ProbashiJob[]>(`/probashi/jobs?${q.toString()}`);
  },
  getProbashiGuides: (country?: string, category?: string) => {
    const q = new URLSearchParams();
    if (country) q.append('country', country);
    if (category) q.append('category', category);
    return request<ProbashiGuide[]>(`/probashi/guides?${q.toString()}`);
  },

  // Skill & WorkHub
  getCourses: (params?: { category?: string; is_free?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.is_free !== undefined) q.append('is_free', String(params.is_free));
    if (params?.search) q.append('search', params.search);
    return request<SkillCourse[]>(`/workhub/courses?${q.toString()}`);
  },
  getWorkHubJobs: (params?: { job_type?: string; workplace_type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.job_type) q.append('job_type', params.job_type);
    if (params?.workplace_type) q.append('workplace_type', params.workplace_type);
    if (params?.search) q.append('search', params.search);
    return request<WorkHubJob[]>(`/workhub/jobs?${q.toString()}`);
  },
  createWorkHubJob: (data: any) => request<WorkHubJob>('/workhub/jobs', { method: 'POST', body: JSON.stringify(data) }),
  applyWorkHubJob: (data: { job_id: number; cover_letter?: string; resume_url?: string; portfolio_url?: string }) =>
    request<WorkHubApplication>('/workhub/applications', { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => request<WorkHubApplication[]>('/workhub/my-applications'),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
};

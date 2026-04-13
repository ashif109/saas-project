import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, parseISO, addDays, addMonths } from 'date-fns';
import api from '@/lib/axios';

export interface SubscriptionHistory {
  _id?: string;
  action: 'extended' | 'upgraded/downgraded' | 'cancelled' | 'reactivated' | 'payment';
  date: string;
  previousPlan?: string;
  newPlan?: string;
  paymentStatus?: string;
  message?: string;
}

export interface College {
  _id: string;
  id?: string; // For backward compatibility if needed
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  logoUrl?: string;
  adminName?: string;
  adminEmail?: string;
  status: 'Active' | 'Disabled';
  students: number;
  faculty: number;
  createdAt?: string;
  subscription: {
    plan: string;
    status: 'Active' | 'Expiring Soon' | 'Expired' | 'Cancelled' | 'Disabled';
    paymentStatus: 'Paid' | 'Pending' | 'Failed';
    startDate: string;
    expiryDate: string;
    lastPaymentDate?: string;
    nextBillingDate?: string;
    history: SubscriptionHistory[];
  };
  features: {
    doubtSystem: boolean;
    attendance: boolean;
    analytics: boolean;
  };
  config: {
    maxStudents: number;
    maxFaculty: number;
    security: {
      forcePasswordReset: boolean;
      sessionTimeout: number; // in minutes
    };
    branding?: {
      logo?: string;
      themeColor?: string;
    };
  };
}

export interface ImpersonationState {
  isImpersonating: boolean;
  targetCollegeId: string | null;
  targetCollegeName: string | null;
  originalRole: 'SUPER_ADMIN' | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  collegeId?: string;
}

interface CollegeState {
  colleges: College[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  impersonation: ImpersonationState;
  
  addCollege: (college: any) => Promise<College>;
  fetchColleges: () => Promise<void>;
  updateCollegeStatus: (id: string, status: 'Active' | 'Disabled') => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  
  // New Subscription Actions
  extendSubscription: (id: string, days: number, months: number, message?: string) => Promise<void>;
  changePlan: (id: string, plan: string, message?: string) => Promise<void>;
  cancelSubscription: (id: string, disableAccess: boolean, message?: string) => Promise<void>;
  reactivateSubscription: (id: string, message?: string) => Promise<void>;
  updatePaymentStatus: (id: string, status: 'Paid' | 'Pending' | 'Failed', message?: string) => Promise<void>;

  // Global Config & Impersonation
  updateCollegeConfig: (id: string, config: Partial<College['config']>, features?: Partial<College['features']>) => Promise<void>;
  startImpersonation: (collegeId: string) => Promise<void>;
  stopImpersonation: () => void;
}

export const useCollegeStore = create<CollegeState>()(
  persist(
    (set, get) => ({
      colleges: [],
      notifications: [],
      loading: false,
      error: null,
      impersonation: {
        isImpersonating: false,
        targetCollegeId: null,
        targetCollegeName: null,
        originalRole: null
      },

      fetchColleges: async () => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.get('/api/colleges');
          // Map _id to id for components that expect 'id'
          const formattedData = data.map((c: any) => ({
            ...c,
            id: c._id
          }));
          set({ colleges: formattedData, loading: false });
        } catch (error: any) {
          console.error('Error fetching colleges:', error);
          set({ error: error.response?.data?.message || 'Failed to fetch colleges', loading: false });
        }
      },

      addCollege: async (collegeData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/api/colleges/create', collegeData);
          const newCollege = { 
            ...data.college, 
            id: data.college._id,
            adminEmail: collegeData.adminEmail,
            adminPassword: collegeData.adminPassword
          };
          
          set(state => ({
            colleges: [newCollege, ...state.colleges],
            loading: false
          }));

          return newCollege;
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to create college';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      updateCollegeStatus: async (id, status) => {
        set({ loading: true });
        try {
          const { data } = await api.put(`/api/colleges/${id}/status`, { status });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update status';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      deleteCollege: async (id) => {
        set({ loading: true });
        try {
          await api.delete(`/api/colleges/${id}`);
          set(state => ({
            colleges: state.colleges.filter(c => c._id !== id),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to delete college';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      extendSubscription: async (id, days, months, message) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${id}/extend`, { days, months, message });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to extend subscription';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      changePlan: async (id, plan, message) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${id}/change-plan`, { plan, message });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to change plan';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      cancelSubscription: async (id, disableAccess, message) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${id}/cancel`, { disableAccess, message });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to cancel subscription';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      reactivateSubscription: async (id, message) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${id}/reactivate`, { message });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to reactivate subscription';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      updatePaymentStatus: async (id, status, message) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${id}/payment`, { status, message });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update payment status';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      updateCollegeConfig: async (id, config, features) => {
        set({ loading: true });
        try {
          const { data } = await api.put(`/api/colleges/${id}/config`, { config, features });
          set(state => ({
            colleges: state.colleges.map(c => c._id === id ? { ...c, ...data, id: data._id } : c),
            loading: false
          }));
        } catch (error: any) {
          const message = error.response?.data?.message || 'Failed to update config';
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      startImpersonation: async (collegeId) => {
        set({ loading: true });
        try {
          const { data } = await api.post(`/api/colleges/${collegeId}/impersonate`);
          // This would typically involve setting a new token and redirecting
          // For now we just update state
          set(state => ({
            impersonation: {
              isImpersonating: true,
              targetCollegeId: collegeId,
              targetCollegeName: state.colleges.find(c => c._id === collegeId)?.name || null,
              originalRole: 'SUPER_ADMIN'
            },
            loading: false
          }));
          window.location.href = '/dashboard';
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Impersonation failed', loading: false });
        }
      },

      stopImpersonation: () => {
        set({
          impersonation: {
            isImpersonating: false,
            targetCollegeId: null,
            targetCollegeName: null,
            originalRole: null
          }
        });
        window.location.href = '/dashboard';
      }
    }),
    {
      name: 'pulse-college-storage',
    }
  )
);


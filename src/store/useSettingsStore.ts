import { create } from 'zustand';
import api from '@/lib/axios';

interface SystemSettings {
  platformName: string;
  themeColor: string;
  logoUrl: string;
  studentLimit: string;
  facultyLimit: string;
  defaultPlan: string;
  autoApproval: boolean;
  forcePasswordReset: boolean;
  minPasswordLength: string;
  sessionTimeout: string;
  sendWelcomeEmail: boolean;
  sendCredentials: boolean;
  systemAlerts: boolean;
  globalDoubtSystem: boolean;
  globalAttendance: boolean;
  globalAnalytics: boolean;
  maxColleges: string;
  duplicateNameRestriction: boolean;
  approvalRequirement: boolean;
  lowActivityThreshold: string;
  inactiveDaysAlert: string;
  autoBackup: boolean;
  backupFrequency: string;
  lastBackup: string;
}

interface SettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/api/settings/system');
      set({ settings: data });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      set({ loading: false });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const { data } = await api.put('/api/settings/system', newSettings);
      set({ settings: data });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },
}));

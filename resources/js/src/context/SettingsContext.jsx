import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext(null);

const defaults = {
  currency: 'ETB',
  language: 'en',
  timezone: 'Africa/Addis_Ababa',
  dateFormat: 'DD/MM/YYYY',
  businessName: 'BizTrack',
  chapaPublicKey: '',
  emailNotifications: true,
  smsNotifications: false,
  autoBackup: true,
  backupFrequency: 'daily',
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('biztrack_settings');
      return s ? { ...defaults, ...JSON.parse(s) } : defaults;
    } catch { return defaults; }
  });

  const updateSettings = (patch) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('biztrack_settings', JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

export default SettingsContext;

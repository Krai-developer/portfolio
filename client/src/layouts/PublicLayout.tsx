import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { GeometricBackground } from '../components/common/GeometricBackground';
import { api } from '../services/api';
import { Settings } from '../types';

export const PublicLayout: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.public.getSettings();
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg text-content-primary relative">
      <GeometricBackground />
      <Navbar settings={settings || undefined} />
      <main className="flex-1 relative z-10">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  );
};

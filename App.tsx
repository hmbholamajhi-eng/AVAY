
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SettingsView from './components/SettingsView';
import History from './components/History';
import Navigation from './components/Navigation';
import Welcome from './components/Welcome';
import EmergencyOverlay from './components/EmergencyOverlay';
import { AppStatus, TrustedContact, UserSettings, EmergencyLog } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [isRegistered, setIsRegistered] = useState<boolean>(() => {
    return localStorage.getItem('avay_user_registered') === 'true';
  });
  
  const [settings, setSettings] = useState<UserSettings>({
    emergencyPhrase: 'Activate AVAY',
    backupPin: '1234',
    autoAudio: true,
    autoVideo: false,
    silentMode: true
  });

  const [contacts, setContacts] = useState<TrustedContact[]>([
    { id: '1', name: 'Emergency Contact', phone: '911', relation: 'Authority' }
  ]);

  const [logs, setLogs] = useState<EmergencyLog[]>([]);

  // Trigger emergency mode
  const triggerEmergency = useCallback(() => {
    if (status === AppStatus.EMERGENCY) return;
    setStatus(AppStatus.EMERGENCY);
    
    // Simulate API call to send alerts
    console.log('ALERT: Emergency triggered! Sending notifications to:', contacts);
    
    // Create log entry
    const newLog: EmergencyLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      location: { lat: 0, lng: 0 },
      status: 'sent'
    };
    setLogs(prev => [newLog, ...prev]);

    // Request location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLogs(prev => prev.map(l => l.id === newLog.id ? {
          ...l,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        } : l));
      });
    }
  }, [status, contacts]);

  const resolveEmergency = useCallback((pin: string) => {
    if (pin === settings.backupPin) {
      setStatus(AppStatus.IDLE);
      return true;
    }
    return false;
  }, [settings.backupPin]);

  // Global Key Listener for "Panic Pattern" (e.g. rapid spacebar or escape)
  useEffect(() => {
    let pressCount = 0;
    let lastPress = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === AppStatus.EMERGENCY) return;
      
      const now = Date.now();
      if (e.key === 'Escape' || e.key === 'Control') {
        if (now - lastPress < 500) {
          pressCount++;
        } else {
          pressCount = 1;
        }
        lastPress = now;

        if (pressCount >= 3) {
          triggerEmergency();
          pressCount = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerEmergency, status]);

  if (!isRegistered) {
    return <Welcome onComplete={() => setIsRegistered(true)} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl relative">
        <Navigation status={status} />
        
        <main className="flex-1 overflow-y-auto pb-20 p-4">
          <Routes>
            <Route path="/" element={
              <Dashboard 
                status={status} 
                onToggleArm={() => setStatus(status === AppStatus.IDLE ? AppStatus.ARMED : AppStatus.IDLE)} 
                onTrigger={triggerEmergency}
                settings={settings}
              />
            } />
            <Route path="/settings" element={
              <SettingsView 
                settings={settings} 
                setSettings={setSettings} 
                contacts={contacts} 
                setContacts={setContacts} 
              />
            } />
            <Route path="/history" element={<History logs={logs} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {status === AppStatus.EMERGENCY && (
          <EmergencyOverlay onResolve={resolveEmergency} settings={settings} />
        )}
      </div>
    </HashRouter>
  );
};

export default App;

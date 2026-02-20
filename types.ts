
export enum AppStatus {
  IDLE = 'IDLE',
  ARMED = 'ARMED',
  EMERGENCY = 'EMERGENCY',
  RESOLVED = 'RESOLVED'
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface UserSettings {
  emergencyPhrase: string;
  backupPin: string;
  autoAudio: boolean;
  autoVideo: boolean;
  silentMode: boolean;
}

export interface EmergencyLog {
  id: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  photo?: string;
  audioUrl?: string;
  status: 'sent' | 'failed' | 'processing';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

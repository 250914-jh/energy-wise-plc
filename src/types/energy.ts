export type DeviceStatus = 'running' | 'idle' | 'warning' | 'error' | 'offline';

export interface Device {
  id: string;
  name: string;
  type: 'conveyor' | 'robot' | 'sensor' | 'motor' | 'compressor';
  status: DeviceStatus;
  power: number; // kW
  energy: number; // kWh cumulative
  efficiency: number; // percentage
  temperature: number; // celsius
  runtime: number; // hours
  opcuaNode: string;
}

export interface EnergyData {
  timestamp: Date;
  totalPower: number;
  devices: Record<string, number>;
}

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'power_spike' | 'efficiency_drop' | 'temperature_high' | 'device_fault';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface OEEMetrics {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export interface ProductionStats {
  totalProduced: number;
  defects: number;
  plannedTime: number;
  actualRuntime: number;
  idealCycleTime: number;
  actualCycleTime: number;
}

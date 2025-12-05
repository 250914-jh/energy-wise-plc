import { useState, useEffect, useCallback } from 'react';
import { Device, EnergyData, Alert, OEEMetrics, DeviceStatus } from '@/types/energy';

const INITIAL_DEVICES: Device[] = [
  { id: 'conv-01', name: '上料传送带 #1', type: 'conveyor', status: 'running', power: 2.5, energy: 156.8, efficiency: 94, temperature: 42, runtime: 1256, opcuaNode: 'ns=2;s=Conveyor.Feed01' },
  { id: 'conv-02', name: '出料传送带 #2', type: 'conveyor', status: 'running', power: 2.2, energy: 142.3, efficiency: 92, temperature: 38, runtime: 1180, opcuaNode: 'ns=2;s=Conveyor.Output02' },
  { id: 'robot-01', name: '机械臂 A', type: 'robot', status: 'running', power: 8.5, energy: 520.4, efficiency: 88, temperature: 55, runtime: 980, opcuaNode: 'ns=2;s=Robot.ArmA' },
  { id: 'robot-02', name: '机械臂 B', type: 'robot', status: 'idle', power: 1.2, energy: 485.2, efficiency: 90, temperature: 35, runtime: 920, opcuaNode: 'ns=2;s=Robot.ArmB' },
  { id: 'motor-01', name: '主驱动电机', type: 'motor', status: 'running', power: 15.8, energy: 1024.5, efficiency: 96, temperature: 68, runtime: 2100, opcuaNode: 'ns=2;s=Motor.Main01' },
  { id: 'comp-01', name: '空气压缩机', type: 'compressor', status: 'running', power: 22.5, energy: 1580.2, efficiency: 85, temperature: 72, runtime: 1850, opcuaNode: 'ns=2;s=Compressor.Air01' },
  { id: 'sensor-01', name: '视觉检测系统', type: 'sensor', status: 'running', power: 0.8, energy: 45.6, efficiency: 99, temperature: 28, runtime: 2400, opcuaNode: 'ns=2;s=Sensor.Vision01' },
  { id: 'sensor-02', name: '温度传感器阵列', type: 'sensor', status: 'warning', power: 0.3, energy: 18.2, efficiency: 95, temperature: 32, runtime: 2400, opcuaNode: 'ns=2;s=Sensor.Temp01' },
];

const generateRandomVariation = (base: number, variance: number) => {
  return base + (Math.random() - 0.5) * variance * 2;
};

export function useSimulatedData() {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [energyHistory, setEnergyHistory] = useState<EnergyData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [oeeMetrics, setOeeMetrics] = useState<OEEMetrics>({
    availability: 92.5,
    performance: 88.3,
    quality: 99.2,
    oee: 81.0,
  });
  const [totalPower, setTotalPower] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);

  const generateAlert = useCallback((device: Device, type: Alert['type']) => {
    const messages: Record<Alert['type'], string> = {
      power_spike: `${device.name} 功率异常飙升至 ${(device.power * 1.5).toFixed(1)} kW`,
      efficiency_drop: `${device.name} 能效下降至 ${(device.efficiency - 15).toFixed(1)}%`,
      temperature_high: `${device.name} 温度过高: ${device.temperature}°C`,
      device_fault: `${device.name} 设备故障，请立即检查`,
    };

    const severityMap: Record<Alert['type'], Alert['severity']> = {
      power_spike: 'medium',
      efficiency_drop: 'low',
      temperature_high: 'high',
      device_fault: 'critical',
    };

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceId: device.id,
      deviceName: device.name,
      type,
      severity: severityMap[type],
      message: messages[type],
      timestamp: new Date(),
      acknowledged: false,
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  }, []);

  useEffect(() => {
    // Initialize with some historical data
    const now = new Date();
    const history: EnergyData[] = [];
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const devicePowers: Record<string, number> = {};
      let total = 0;
      INITIAL_DEVICES.forEach(d => {
        const power = generateRandomVariation(d.power, d.power * 0.1);
        devicePowers[d.id] = power;
        total += power;
      });
      history.push({ timestamp, totalPower: total, devices: devicePowers });
    }
    setEnergyHistory(history);

    // Initial alerts
    setAlerts([
      {
        id: 'alert-init-1',
        deviceId: 'sensor-02',
        deviceName: '温度传感器阵列',
        type: 'efficiency_drop',
        severity: 'low',
        message: '温度传感器阵列 通信延迟增加',
        timestamp: new Date(Date.now() - 300000),
        acknowledged: false,
      },
    ]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => {
        const updated = prev.map(device => {
          let newStatus: DeviceStatus = device.status;
          let newPower = device.power;
          let newTemp = device.temperature;
          let newEfficiency = device.efficiency;

          // Simulate status changes (rare)
          if (Math.random() < 0.01) {
            const statuses: DeviceStatus[] = ['running', 'idle', 'warning'];
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          }

          // Simulate power variations
          if (newStatus === 'running') {
            newPower = generateRandomVariation(
              INITIAL_DEVICES.find(d => d.id === device.id)!.power,
              INITIAL_DEVICES.find(d => d.id === device.id)!.power * 0.15
            );
          } else if (newStatus === 'idle') {
            newPower = generateRandomVariation(0.5, 0.3);
          }

          // Simulate temperature
          newTemp = generateRandomVariation(device.temperature, 2);
          newTemp = Math.max(20, Math.min(90, newTemp));

          // Simulate efficiency
          newEfficiency = generateRandomVariation(device.efficiency, 1);
          newEfficiency = Math.max(70, Math.min(100, newEfficiency));

          return {
            ...device,
            status: newStatus,
            power: Math.max(0, newPower),
            energy: device.energy + (newPower / 3600), // Add energy per second
            temperature: newTemp,
            efficiency: newEfficiency,
          };
        });

        // Calculate totals
        const power = updated.reduce((sum, d) => sum + d.power, 0);
        const energy = updated.reduce((sum, d) => sum + d.energy, 0);
        setTotalPower(power);
        setTotalEnergy(energy);

        return updated;
      });

      // Update energy history
      setEnergyHistory(prev => {
        const devicePowers: Record<string, number> = {};
        devices.forEach(d => {
          devicePowers[d.id] = d.power;
        });
        
        const newEntry: EnergyData = {
          timestamp: new Date(),
          totalPower: devices.reduce((sum, d) => sum + d.power, 0),
          devices: devicePowers,
        };

        const updated = [...prev, newEntry];
        if (updated.length > 120) {
          updated.shift();
        }
        return updated;
      });

      // Random alerts
      if (Math.random() < 0.02) {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const alertTypes: Alert['type'][] = ['power_spike', 'efficiency_drop', 'temperature_high'];
        const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = generateAlert(randomDevice, randomType);
        setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      }

      // Update OEE
      setOeeMetrics(prev => ({
        availability: Math.max(85, Math.min(98, generateRandomVariation(prev.availability, 0.5))),
        performance: Math.max(80, Math.min(95, generateRandomVariation(prev.performance, 0.3))),
        quality: Math.max(97, Math.min(99.9, generateRandomVariation(prev.quality, 0.1))),
        oee: 0, // Will be calculated
      }));
      setOeeMetrics(prev => ({
        ...prev,
        oee: (prev.availability * prev.performance * prev.quality) / 10000,
      }));

    }, 1000);

    return () => clearInterval(interval);
  }, [devices, generateAlert]);

  return {
    devices,
    energyHistory,
    alerts,
    oeeMetrics,
    totalPower,
    totalEnergy,
    acknowledgeAlert,
  };
}

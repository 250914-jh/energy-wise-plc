import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Device, Alert, OEEMetrics, EnergyData } from '@/types/energy';

type DbDevice = {
  id: string;
  name: string;
  type: string;
  status: string;
  power: number;
  energy: number;
  efficiency: number;
  temperature: number;
  runtime: number;
  opcua_node: string | null;
};

type DbAlert = {
  id: string;
  device_id: string | null;
  device_name: string;
  type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
};

type DbOee = {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
};

export function useRealtimeData() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [oeeMetrics, setOeeMetrics] = useState<OEEMetrics>({
    availability: 0,
    performance: 0,
    quality: 0,
    oee: 0,
  });
  const [energyHistory, setEnergyHistory] = useState<EnergyData[]>([]);
  const [totalPower, setTotalPower] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);

  const mapDbDeviceToDevice = (dbDevice: DbDevice): Device => ({
    id: dbDevice.id,
    name: dbDevice.name,
    type: dbDevice.type as Device['type'],
    status: dbDevice.status as Device['status'],
    power: dbDevice.power,
    energy: dbDevice.energy,
    efficiency: dbDevice.efficiency,
    temperature: dbDevice.temperature,
    runtime: dbDevice.runtime,
    opcuaNode: dbDevice.opcua_node || '',
  });

  const mapDbAlertToAlert = (dbAlert: DbAlert): Alert => ({
    id: dbAlert.id,
    deviceId: dbAlert.device_id || '',
    deviceName: dbAlert.device_name,
    type: dbAlert.type as Alert['type'],
    severity: dbAlert.severity as Alert['severity'],
    message: dbAlert.message,
    acknowledged: dbAlert.acknowledged,
    timestamp: new Date(dbAlert.created_at),
  });

  // 获取初始数据
  const fetchInitialData = useCallback(async () => {
    // 获取设备
    const { data: devicesData } = await supabase
      .from('devices')
      .select('*');

    if (devicesData) {
      const mappedDevices = devicesData.map(mapDbDeviceToDevice);
      setDevices(mappedDevices);
      setTotalPower(mappedDevices.reduce((sum, d) => sum + d.power, 0));
      setTotalEnergy(mappedDevices.reduce((sum, d) => sum + d.energy, 0));

      // 生成能耗历史
      const history: EnergyData[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        history.push({
          timestamp: new Date(now.getTime() - i * 60000),
          totalPower: mappedDevices.reduce((sum, d) => sum + d.power, 0) * (0.9 + Math.random() * 0.2),
          devices: {},
        });
      }
      setEnergyHistory(history);
    }

    // 获取告警
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (alertsData) {
      setAlerts(alertsData.map(mapDbAlertToAlert));
    }

    // 获取最新 OEE
    const { data: oeeData } = await supabase
      .from('oee_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (oeeData) {
      setOeeMetrics({
        availability: oeeData.availability,
        performance: oeeData.performance,
        quality: oeeData.quality,
        oee: oeeData.oee,
      });
    } else {
      // 默认 OEE 数据
      setOeeMetrics({
        availability: 92.5,
        performance: 88.3,
        quality: 97.8,
        oee: 79.9,
      });
    }
  }, []);

  // 确认告警
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // 订阅设备实时更新
    const devicesChannel = supabase
      .channel('devices-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'devices' },
        (payload) => {
          console.log('Device change:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updatedDevice = mapDbDeviceToDevice(payload.new as DbDevice);
            setDevices(prev => {
              const updated = prev.map(d =>
                d.id === updatedDevice.id ? updatedDevice : d
              );
              setTotalPower(updated.reduce((sum, d) => sum + d.power, 0));
              setTotalEnergy(updated.reduce((sum, d) => sum + d.energy, 0));
              return updated;
            });

            // 更新能耗历史
            setEnergyHistory(prev => {
              const newHistory = [...prev.slice(1), {
                timestamp: new Date(),
                totalPower: devices.reduce((sum, d) => sum + d.power, 0),
                devices: {},
              }];
              return newHistory;
            });
          }
        }
      )
      .subscribe();

    // 订阅告警实时更新
    const alertsChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('New alert:', payload);
          if (payload.new) {
            const newAlert = mapDbAlertToAlert(payload.new as DbAlert);
            setAlerts(prev => [newAlert, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(devicesChannel);
      supabase.removeChannel(alertsChannel);
    };
  }, [fetchInitialData, devices]);

  return {
    devices,
    alerts,
    oeeMetrics,
    energyHistory,
    totalPower,
    totalEnergy,
    acknowledgeAlert,
    refetch: fetchInitialData,
  };
}

import { useState } from 'react';
import { Zap, Battery, Thermometer, Clock } from 'lucide-react';
import { Header } from '@/components/Header';
import { DeviceCard } from '@/components/DeviceCard';
import { EnergyChart } from '@/components/EnergyChart';
import { OEEGauge } from '@/components/OEEGauge';
import { AlertsPanel } from '@/components/AlertsPanel';
import { StatsCard } from '@/components/StatsCard';
import { SystemTopology } from '@/components/SystemTopology';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Index = () => {
  const { devices, energyHistory, alerts, oeeMetrics, totalPower, totalEnergy, acknowledgeAlert } = useRealtimeData();
  const [alertsOpen, setAlertsOpen] = useState(false);

  const runningDevices = devices.filter(d => d.status === 'running').length;
  const avgEfficiency = devices.reduce((sum, d) => sum + d.efficiency, 0) / devices.length;

  return (
    <div className="min-h-screen bg-background data-grid">
      <div className="scanline pointer-events-none fixed inset-0 z-0" />
      
      <Header alerts={alerts} onAlertsClick={() => setAlertsOpen(true)} />

      <main className="p-4 md:p-6 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
          <StatsCard
            title="总功率"
            value={totalPower}
            unit="kW"
            icon={Zap}
            variant="primary"
            trend={{ value: 2.3, isPositive: false }}
          />
          <StatsCard
            title="累计能耗"
            value={totalEnergy}
            unit="kWh"
            icon={Battery}
            variant="success"
          />
          <StatsCard
            title="平均能效"
            value={avgEfficiency}
            unit="%"
            icon={Thermometer}
            variant={avgEfficiency >= 90 ? 'success' : 'warning'}
          />
          <StatsCard
            title="运行设备"
            value={`${runningDevices}/${devices.length}`}
            icon={Clock}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart & Topology */}
          <div className="lg:col-span-2 space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <EnergyChart data={energyHistory} />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <SystemTopology />
            </div>
          </div>

          {/* Right Column - OEE & Alerts */}
          <div className="space-y-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <OEEGauge metrics={oeeMetrics} />
            </div>
            <div className="animate-fade-in h-[320px]" style={{ animationDelay: '0.25s' }}>
              <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
            </div>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-foreground">设备监控</h2>
              <p className="text-sm text-muted-foreground">OPC UA 实时数据采集</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {devices.map((device, index) => (
              <div
                key={device.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <DeviceCard device={device} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            能源管理系统 v1.0 · PLC + OPC UA + KepServer 集成方案
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            数据采集频率: 1s · 节点数: {devices.length * 4} · 协议: OPC UA
          </p>
        </footer>
      </main>

      {/* Alerts Sheet for Mobile */}
      <Sheet open={alertsOpen} onOpenChange={setAlertsOpen}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border">
          <SheetHeader>
            <SheetTitle className="text-foreground">系统预警</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-100px)]">
            <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;

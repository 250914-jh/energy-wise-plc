import { Device, DeviceStatus } from '@/types/energy';
import { Cog, Box, Eye, Fan, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
}

const statusConfig: Record<DeviceStatus, { label: string; className: string; glowClass: string }> = {
  running: { label: '运行中', className: 'bg-success', glowClass: 'glow-success' },
  idle: { label: '待机', className: 'bg-primary', glowClass: 'glow-primary' },
  warning: { label: '警告', className: 'bg-warning', glowClass: 'glow-warning' },
  error: { label: '故障', className: 'bg-destructive', glowClass: 'glow-destructive' },
  offline: { label: '离线', className: 'bg-muted-foreground', glowClass: '' },
};

const deviceIcons: Record<Device['type'], React.ElementType> = {
  conveyor: Box,
  robot: Cog,
  sensor: Eye,
  motor: Fan,
  compressor: Gauge,
};

export function DeviceCard({ device }: DeviceCardProps) {
  const status = statusConfig[device.status];
  const Icon = deviceIcons[device.type];

  return (
    <div className="industrial-card p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            device.status === 'running' ? 'bg-primary/20' : 'bg-muted'
          )}>
            <Icon className={cn(
              'w-5 h-5',
              device.status === 'running' ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <h3 className="font-medium text-foreground text-sm">{device.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{device.opcuaNode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('status-indicator', status.className, status.glowClass)} />
          <span className="text-xs text-muted-foreground">{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground mb-1">实时功率</p>
          <p className="text-lg font-mono font-semibold text-primary">
            {device.power.toFixed(1)}
            <span className="text-xs text-muted-foreground ml-1">kW</span>
          </p>
        </div>
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground mb-1">累计能耗</p>
          <p className="text-lg font-mono font-semibold text-foreground">
            {device.energy.toFixed(1)}
            <span className="text-xs text-muted-foreground ml-1">kWh</span>
          </p>
        </div>
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground mb-1">能效</p>
          <p className={cn(
            'text-lg font-mono font-semibold',
            device.efficiency >= 90 ? 'text-success' : device.efficiency >= 80 ? 'text-warning' : 'text-destructive'
          )}>
            {device.efficiency.toFixed(1)}
            <span className="text-xs text-muted-foreground ml-1">%</span>
          </p>
        </div>
        <div className="bg-muted/50 rounded-md p-2">
          <p className="text-xs text-muted-foreground mb-1">温度</p>
          <p className={cn(
            'text-lg font-mono font-semibold',
            device.temperature <= 50 ? 'text-success' : device.temperature <= 70 ? 'text-warning' : 'text-destructive'
          )}>
            {device.temperature.toFixed(0)}
            <span className="text-xs text-muted-foreground ml-1">°C</span>
          </p>
        </div>
      </div>
    </div>
  );
}

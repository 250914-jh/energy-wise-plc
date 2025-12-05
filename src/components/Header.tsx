import { Activity, Bell, Settings, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert } from '@/types/energy';

interface HeaderProps {
  alerts: Alert[];
  onAlertsClick: () => void;
}

export function Header({ alerts, onAlertsClick }: HeaderProps) {
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">能源管理系统</h1>
              <p className="text-xs text-muted-foreground">PLC · OPC UA · KepServer</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 ml-8 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
            <Wifi className="w-4 h-4 text-success" />
            <span className="text-xs text-success font-medium">OPC UA 已连接</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-xs text-muted-foreground">系统时间</p>
            <p className="text-sm font-mono text-foreground">
              {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onAlertsClick}
          >
            <Bell className={`w-5 h-5 ${criticalCount > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
            {unacknowledgedCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unacknowledgedCount}
              </Badge>
            )}
          </Button>

          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}

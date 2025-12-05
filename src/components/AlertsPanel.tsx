import { Alert } from '@/types/energy';
import { AlertTriangle, AlertCircle, Info, XCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
}

const severityConfig = {
  low: { icon: Info, className: 'text-primary bg-primary/10 border-primary/30' },
  medium: { icon: AlertCircle, className: 'text-warning bg-warning/10 border-warning/30' },
  high: { icon: AlertTriangle, className: 'text-destructive bg-destructive/10 border-destructive/30' },
  critical: { icon: XCircle, className: 'text-destructive bg-destructive/20 border-destructive/50 animate-pulse' },
};

const severityLabels: Record<Alert['severity'], string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '严重',
};

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const acknowledged = alerts.filter(a => a.acknowledged);

  return (
    <div className="industrial-card p-4 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">系统预警</h3>
          <p className="text-xs text-muted-foreground">
            {unacknowledged.length} 条未确认
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="space-y-2">
          {unacknowledged.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm text-muted-foreground">所有预警已确认</p>
            </div>
          )}
          
          {unacknowledged.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-lg border p-3 transition-all',
                  config.className
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase">
                        {severityLabels[alert.severity]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {alert.deviceName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.message}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      确认
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {acknowledged.length > 0 && (
            <>
              <div className="py-2">
                <p className="text-xs text-muted-foreground">已确认</p>
              </div>
              {acknowledged.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-lg border border-border bg-muted/30 p-3 opacity-60"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {alert.message}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

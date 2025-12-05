import { OEEMetrics } from '@/types/energy';
import { cn } from '@/lib/utils';

interface OEEGaugeProps {
  metrics: OEEMetrics;
}

function CircularProgress({ 
  value, 
  label, 
  color 
}: { 
  value: number; 
  label: string; 
  color: string;
}) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="hsl(217, 33%, 17%)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-mono font-bold text-foreground">
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function OEEGauge({ metrics }: OEEGaugeProps) {
  const oeeColor = metrics.oee >= 85 
    ? 'hsl(142, 76%, 36%)' 
    : metrics.oee >= 60 
    ? 'hsl(38, 92%, 50%)' 
    : 'hsl(0, 72%, 51%)';

  return (
    <div className="industrial-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">设备综合效率 OEE</h3>
          <p className="text-xs text-muted-foreground">Overall Equipment Effectiveness</p>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="hsl(217, 33%, 17%)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke={oeeColor}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 - (metrics.oee / 100) * 2 * Math.PI * 56}
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 10px ${oeeColor})`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-mono font-bold text-foreground">
              {metrics.oee.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">OEE %</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <CircularProgress
          value={metrics.availability}
          label="可用性"
          color="hsl(199, 89%, 48%)"
        />
        <CircularProgress
          value={metrics.performance}
          label="性能"
          color="hsl(142, 76%, 36%)"
        />
        <CircularProgress
          value={metrics.quality}
          label="质量"
          color="hsl(280, 65%, 60%)"
        />
      </div>
    </div>
  );
}

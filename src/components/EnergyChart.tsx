import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EnergyData } from '@/types/energy';

interface EnergyChartProps {
  data: EnergyData[];
}

export function EnergyChart({ data }: EnergyChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      time: d.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      power: d.totalPower,
    }));
  }, [data]);

  return (
    <div className="industrial-card p-4 h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">总功率趋势</h3>
          <p className="text-xs text-muted-foreground">实时能耗监控 · OPC UA数据</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-primary">
            {chartData.length > 0 ? chartData[chartData.length - 1].power.toFixed(1) : '0.0'}
            <span className="text-sm text-muted-foreground ml-1">kW</span>
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(215, 20%, 55%)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(215, 20%, 55%)" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222, 47%, 9%)',
              border: '1px solid hsl(217, 33%, 20%)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: 'hsl(210, 40%, 96%)' }}
            formatter={(value: number) => [`${value.toFixed(2)} kW`, '总功率']}
          />
          <Area
            type="monotone"
            dataKey="power"
            stroke="hsl(199, 89%, 48%)"
            strokeWidth={2}
            fill="url(#powerGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

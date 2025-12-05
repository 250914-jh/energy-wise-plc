import { Database, Server, Monitor, Cpu } from 'lucide-react';

export function SystemTopology() {
  return (
    <div className="industrial-card p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">系统架构</h3>
        <p className="text-xs text-muted-foreground">PLC → KepServer → OPC UA</p>
      </div>

      <div className="flex items-center justify-between gap-2 py-4">
        {/* PLC */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center glow-primary">
            <Cpu className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">CodeSys PLC</span>
          <span className="text-xs text-success font-mono">●在线</span>
        </div>

        {/* Connection Line */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-warning/50 relative">
          <div className="absolute inset-0 bg-primary/30 animate-pulse" />
        </div>

        {/* KepServer */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-lg bg-warning/20 border border-warning/40 flex items-center justify-center glow-warning">
            <Server className="w-7 h-7 text-warning" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">KepServer</span>
          <span className="text-xs text-success font-mono">●活跃</span>
        </div>

        {/* Connection Line */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-warning/50 to-success/50 relative">
          <div className="absolute inset-0 bg-warning/30 animate-pulse" />
        </div>

        {/* Database */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-lg bg-success/20 border border-success/40 flex items-center justify-center glow-success">
            <Database className="w-7 h-7 text-success" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">InfluxDB</span>
          <span className="text-xs text-success font-mono">●连接</span>
        </div>

        {/* Connection Line */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-success/50 to-primary/50 relative">
          <div className="absolute inset-0 bg-success/30 animate-pulse" />
        </div>

        {/* Web Client */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Monitor className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs text-muted-foreground mt-2">Web监控</span>
          <span className="text-xs text-success font-mono">●运行</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground">协议: </span>
          <span className="text-foreground font-mono">OPC UA</span>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground">端口: </span>
          <span className="text-foreground font-mono">4840</span>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground">采样率: </span>
          <span className="text-foreground font-mono">1000ms</span>
        </div>
        <div className="bg-muted/50 rounded p-2">
          <span className="text-muted-foreground">节点数: </span>
          <span className="text-foreground font-mono">128</span>
        </div>
      </div>
    </div>
  );
}

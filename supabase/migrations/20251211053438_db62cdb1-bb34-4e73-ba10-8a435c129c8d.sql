-- 设备表
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('conveyor', 'robot', 'sensor', 'motor', 'compressor')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('running', 'idle', 'warning', 'error', 'offline')),
  power REAL NOT NULL DEFAULT 0,
  energy REAL NOT NULL DEFAULT 0,
  efficiency REAL NOT NULL DEFAULT 0,
  temperature REAL NOT NULL DEFAULT 0,
  runtime REAL NOT NULL DEFAULT 0,
  opcua_node TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 能耗历史记录表
CREATE TABLE public.energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  power REAL NOT NULL,
  energy REAL NOT NULL,
  temperature REAL,
  efficiency REAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 告警表
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('power_spike', 'efficiency_drop', 'temperature_high', 'device_fault')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OEE 指标表
CREATE TABLE public.oee_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability REAL NOT NULL DEFAULT 0,
  performance REAL NOT NULL DEFAULT 0,
  quality REAL NOT NULL DEFAULT 0,
  oee REAL NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 启用 RLS (公开访问用于演示)
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oee_metrics ENABLE ROW LEVEL SECURITY;

-- 创建公开读取策略
CREATE POLICY "Allow public read devices" ON public.devices FOR SELECT USING (true);
CREATE POLICY "Allow public insert devices" ON public.devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update devices" ON public.devices FOR UPDATE USING (true);

CREATE POLICY "Allow public read energy_readings" ON public.energy_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert energy_readings" ON public.energy_readings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert alerts" ON public.alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update alerts" ON public.alerts FOR UPDATE USING (true);

CREATE POLICY "Allow public read oee_metrics" ON public.oee_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public insert oee_metrics" ON public.oee_metrics FOR INSERT WITH CHECK (true);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON public.devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;

-- 插入初始设备数据
INSERT INTO public.devices (name, type, status, power, energy, efficiency, temperature, runtime, opcua_node) VALUES
  ('输送带-01', 'conveyor', 'running', 2.5, 156.8, 92, 45, 1250, 'ns=2;s=Conveyor_01'),
  ('机械臂-01', 'robot', 'running', 5.2, 312.4, 88, 52, 980, 'ns=2;s=Robot_01'),
  ('温度传感器-01', 'sensor', 'running', 0.1, 8.2, 99, 25, 2100, 'ns=2;s=Sensor_01'),
  ('电机-01', 'motor', 'idle', 0, 245.6, 85, 38, 1560, 'ns=2;s=Motor_01'),
  ('压缩机-01', 'compressor', 'running', 8.5, 524.3, 78, 68, 890, 'ns=2;s=Compressor_01');
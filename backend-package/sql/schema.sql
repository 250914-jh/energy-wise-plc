-- 能源管理系统数据库结构
-- 用于 MySQL/PostgreSQL

-- 设备表
CREATE TABLE devices (
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
CREATE TABLE energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  power REAL NOT NULL,
  energy REAL NOT NULL,
  temperature REAL,
  efficiency REAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 告警表
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('power_spike', 'efficiency_drop', 'temperature_high', 'device_fault')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OEE 指标表
CREATE TABLE oee_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability REAL NOT NULL DEFAULT 0,
  performance REAL NOT NULL DEFAULT 0,
  quality REAL NOT NULL DEFAULT 0,
  oee REAL NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 初始设备数据
INSERT INTO devices (name, type, status, power, energy, efficiency, temperature, runtime, opcua_node) VALUES
  ('输送带-01', 'conveyor', 'running', 2.5, 156.8, 92, 45, 1250, 'ns=2;s=Conveyor_01'),
  ('机械臂-01', 'robot', 'running', 5.2, 312.4, 88, 52, 980, 'ns=2;s=Robot_01'),
  ('温度传感器-01', 'sensor', 'running', 0.1, 8.2, 99, 25, 2100, 'ns=2;s=Sensor_01'),
  ('电机-01', 'motor', 'idle', 0, 245.6, 85, 38, 1560, 'ns=2;s=Motor_01'),
  ('压缩机-01', 'compressor', 'running', 8.5, 524.3, 78, 68, 890, 'ns=2;s=Compressor_01');

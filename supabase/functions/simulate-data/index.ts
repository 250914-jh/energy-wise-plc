import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 模拟数据生成（用于测试，实际使用时由 Python OPC UA 客户端调用 update-devices）
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取当前设备
    const { data: devices } = await supabase.from('devices').select('*');
    
    if (!devices || devices.length === 0) {
      return new Response(JSON.stringify({ error: 'No devices found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 模拟更新每个设备
    for (const device of devices) {
      const isRunning = device.status === 'running';
      const powerMap: Record<string, number> = {
        conveyor: 2.5,
        robot: 5.2,
        sensor: 0.1,
        motor: 3.8,
        compressor: 8.5,
      };
      const basePower = powerMap[device.type as string] || 1;

      const newPower = isRunning ? basePower * (0.85 + Math.random() * 0.3) : 0;
      const newEnergy = device.energy + (newPower / 3600); // 每秒累加
      const newTemp = device.temperature + (Math.random() - 0.5) * 2;
      const newEfficiency = Math.max(60, Math.min(100, device.efficiency + (Math.random() - 0.5) * 2));

      await supabase
        .from('devices')
        .update({
          power: Math.round(newPower * 100) / 100,
          energy: Math.round(newEnergy * 100) / 100,
          temperature: Math.round(newTemp * 10) / 10,
          efficiency: Math.round(newEfficiency * 10) / 10,
          runtime: device.runtime + (isRunning ? 1/3600 : 0),
        })
        .eq('id', device.id);

      // 记录能耗数据
      await supabase.from('energy_readings').insert({
        device_id: device.id,
        power: newPower,
        energy: newEnergy,
        temperature: newTemp,
        efficiency: newEfficiency,
      });

      // 随机生成告警
      if (Math.random() < 0.05) {
        const alertTypes = ['power_spike', 'efficiency_drop', 'temperature_high', 'device_fault'] as const;
        const severities = ['low', 'medium', 'high', 'critical'] as const;
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];

        const messages = {
          power_spike: `${device.name} 功率异常升高`,
          efficiency_drop: `${device.name} 效率下降`,
          temperature_high: `${device.name} 温度过高`,
          device_fault: `${device.name} 设备故障`,
        };

        await supabase.from('alerts').insert({
          device_id: device.id,
          device_name: device.name,
          type,
          severity,
          message: messages[type],
        });
      }
    }

    // 更新 OEE 指标
    const runningDevices = devices.filter(d => d.status === 'running').length;
    const availability = (runningDevices / devices.length) * 100;
    const avgEfficiency = devices.reduce((sum, d) => sum + d.efficiency, 0) / devices.length;
    const performance = avgEfficiency * (0.95 + Math.random() * 0.1);
    const quality = 95 + Math.random() * 5;
    const oee = (availability * performance * quality) / 10000;

    await supabase.from('oee_metrics').insert({
      availability: Math.round(availability * 10) / 10,
      performance: Math.round(performance * 10) / 10,
      quality: Math.round(quality * 10) / 10,
      oee: Math.round(oee * 10) / 10,
    });

    return new Response(JSON.stringify({ success: true, updated: devices.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

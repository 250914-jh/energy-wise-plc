import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { devices, alerts, oee } = await req.json();
    console.log('Received data:', { devices: devices?.length, alerts: alerts?.length, oee });

    // 更新设备数据
    if (devices && Array.isArray(devices)) {
      for (const device of devices) {
        const { error: deviceError } = await supabase
          .from('devices')
          .update({
            status: device.status,
            power: device.power,
            energy: device.energy,
            efficiency: device.efficiency,
            temperature: device.temperature,
            runtime: device.runtime,
          })
          .eq('opcua_node', device.opcua_node);

        if (deviceError) {
          console.error('Error updating device:', deviceError);
        }

        // 记录能耗历史
        const { data: deviceData } = await supabase
          .from('devices')
          .select('id')
          .eq('opcua_node', device.opcua_node)
          .single();

        if (deviceData) {
          await supabase.from('energy_readings').insert({
            device_id: deviceData.id,
            power: device.power,
            energy: device.energy,
            temperature: device.temperature,
            efficiency: device.efficiency,
          });
        }
      }
    }

    // 插入告警
    if (alerts && Array.isArray(alerts)) {
      for (const alert of alerts) {
        const { data: deviceData } = await supabase
          .from('devices')
          .select('id')
          .eq('opcua_node', alert.opcua_node)
          .single();

        await supabase.from('alerts').insert({
          device_id: deviceData?.id,
          device_name: alert.device_name,
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
        });
      }
    }

    // 更新 OEE 指标
    if (oee) {
      await supabase.from('oee_metrics').insert({
        availability: oee.availability,
        performance: oee.performance,
        quality: oee.quality,
        oee: oee.oee,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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

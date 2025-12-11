"""
Python OPC UA Client for Energy Management System
连接 KepServer 并将数据推送到 Lovable Cloud 后端

安装依赖:
pip install opcua requests

使用方法:
1. 确保 KepServer OPC UA 服务器运行中
2. 修改 KEPSERVER_URL 和 SUPABASE_URL
3. 运行: python opcua_client.py
"""

import time
import requests
from opcua import Client
from datetime import datetime

# 配置
KEPSERVER_URL = "opc.tcp://localhost:49320"  # KepServer OPC UA 端点
SUPABASE_URL = "https://ftynbkxqqrigbbwhkult.supabase.co/functions/v1/update-devices"

# OPC UA 节点映射 (根据你的 KepServer 配置修改)
DEVICE_NODES = [
    {
        "name": "输送带-01",
        "opcua_node": "ns=2;s=Conveyor_01",
        "nodes": {
            "power": "ns=2;s=EnergyPLC.EnergyData.Conveyor_Power",
            "energy": "ns=2;s=EnergyPLC.EnergyData.Conveyor_Energy", 
            "status": "ns=2;s=EnergyPLC.EnergyData.Conveyor_Running",
            "speed": "ns=2;s=EnergyPLC.EnergyData.Conveyor_Speed",
        }
    },
    {
        "name": "工位-01", 
        "opcua_node": "ns=2;s=Station_01",
        "nodes": {
            "power": "ns=2;s=EnergyPLC.EnergyData.Station_Power",
            "energy": "ns=2;s=EnergyPLC.EnergyData.Station_Energy",
            "status": "ns=2;s=EnergyPLC.EnergyData.Station_Running",
            "temperature": "ns=2;s=EnergyPLC.EnergyData.Station_Temp",
        }
    },
    {
        "name": "机械臂-01",
        "opcua_node": "ns=2;s=Robot_01", 
        "nodes": {
            "power": "ns=2;s=EnergyPLC.EnergyData.Robot_Power",
            "energy": "ns=2;s=EnergyPLC.EnergyData.Robot_Energy",
            "status": "ns=2;s=EnergyPLC.EnergyData.Robot_Running",
            "efficiency": "ns=2;s=EnergyPLC.EnergyData.Robot_Efficiency",
        }
    },
]

# 告警阈值
THRESHOLDS = {
    "temperature_high": 70,
    "power_spike": 10,
    "efficiency_low": 70,
}


def read_opc_value(client, node_id):
    """读取 OPC UA 节点值"""
    try:
        node = client.get_node(node_id)
        return node.get_value()
    except Exception as e:
        print(f"Error reading {node_id}: {e}")
        return None


def collect_device_data(client, device_config):
    """采集单个设备数据"""
    nodes = device_config["nodes"]
    
    power = read_opc_value(client, nodes.get("power", "")) or 0
    energy = read_opc_value(client, nodes.get("energy", "")) or 0
    status_raw = read_opc_value(client, nodes.get("status", ""))
    temperature = read_opc_value(client, nodes.get("temperature", "")) or 25
    efficiency = read_opc_value(client, nodes.get("efficiency", "")) or 85
    
    # 状态转换
    if status_raw is True or status_raw == 1:
        status = "running"
    elif status_raw is False or status_raw == 0:
        status = "idle"
    else:
        status = "offline"
    
    return {
        "name": device_config["name"],
        "opcua_node": device_config["opcua_node"],
        "power": round(power, 2),
        "energy": round(energy, 2),
        "status": status,
        "temperature": round(temperature, 1),
        "efficiency": round(efficiency, 1),
        "runtime": 0,  # 由后端计算
    }


def check_alerts(device_data):
    """检查告警条件"""
    alerts = []
    
    if device_data.get("temperature", 0) > THRESHOLDS["temperature_high"]:
        alerts.append({
            "device_name": device_data["name"],
            "opcua_node": device_data["opcua_node"],
            "type": "temperature_high",
            "severity": "high",
            "message": f"{device_data['name']} 温度过高: {device_data['temperature']}°C"
        })
    
    if device_data.get("power", 0) > THRESHOLDS["power_spike"]:
        alerts.append({
            "device_name": device_data["name"],
            "opcua_node": device_data["opcua_node"],
            "type": "power_spike", 
            "severity": "medium",
            "message": f"{device_data['name']} 功率异常: {device_data['power']} kW"
        })
    
    if device_data.get("efficiency", 100) < THRESHOLDS["efficiency_low"]:
        alerts.append({
            "device_name": device_data["name"],
            "opcua_node": device_data["opcua_node"],
            "type": "efficiency_drop",
            "severity": "low", 
            "message": f"{device_data['name']} 效率下降: {device_data['efficiency']}%"
        })
    
    return alerts


def calculate_oee(devices_data):
    """计算 OEE 指标"""
    running = sum(1 for d in devices_data if d["status"] == "running")
    total = len(devices_data)
    
    availability = (running / total * 100) if total > 0 else 0
    performance = sum(d["efficiency"] for d in devices_data) / total if total > 0 else 0
    quality = 97 + (3 * (performance / 100))  # 模拟质量指标
    oee = (availability * performance * quality) / 10000
    
    return {
        "availability": round(availability, 1),
        "performance": round(performance, 1),
        "quality": round(quality, 1),
        "oee": round(oee, 1),
    }


def push_to_backend(devices_data, alerts, oee):
    """推送数据到后端 API"""
    payload = {
        "devices": devices_data,
        "alerts": alerts,
        "oee": oee,
    }
    
    try:
        response = requests.post(
            SUPABASE_URL,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Data pushed successfully")
        else:
            print(f"Error pushing data: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error connecting to backend: {e}")


def main():
    """主循环"""
    print("=" * 50)
    print("Energy Management System - OPC UA Client")
    print(f"KepServer: {KEPSERVER_URL}")
    print(f"Backend: {SUPABASE_URL}")
    print("=" * 50)
    
    client = Client(KEPSERVER_URL)
    
    try:
        print("Connecting to KepServer...")
        client.connect()
        print("Connected!")
        
        while True:
            devices_data = []
            all_alerts = []
            
            # 采集所有设备数据
            for device_config in DEVICE_NODES:
                data = collect_device_data(client, device_config)
                devices_data.append(data)
                
                # 检查告警
                alerts = check_alerts(data)
                all_alerts.extend(alerts)
            
            # 计算 OEE
            oee = calculate_oee(devices_data)
            
            # 推送到后端
            push_to_backend(devices_data, all_alerts, oee)
            
            # 打印状态
            total_power = sum(d["power"] for d in devices_data)
            print(f"  Total Power: {total_power:.2f} kW | Devices: {len(devices_data)} | Alerts: {len(all_alerts)}")
            
            # 等待下一次采集
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nStopping...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.disconnect()
        print("Disconnected from KepServer")


if __name__ == "__main__":
    main()

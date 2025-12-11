# 能源管理系统后端

## 文件说明

```
backend-package/
├── python/
│   ├── opcua_client.py      # OPC UA 客户端 (连接 KepServer)
│   └── requirements.txt     # Python 依赖
├── sql/
│   └── schema.sql           # 数据库表结构
└── README.md
```

## 安装步骤

### 1. Python 环境
```bash
cd python
pip install -r requirements.txt
```

### 2. 配置 KepServer 地址
编辑 `opcua_client.py`:
```python
KEPSERVER_URL = "opc.tcp://localhost:49320"  # 修改为你的 KepServer 地址
```

### 3. 运行
```bash
python opcua_client.py
```

## API 接口

### 推送设备数据
- **URL**: `https://ftynbkxqqrigbbwhkult.supabase.co/functions/v1/update-devices`
- **Method**: POST
- **Body**:
```json
{
  "devices": [
    {
      "opcua_node": "ns=2;s=Conveyor_01",
      "status": "running",
      "power": 2.5,
      "energy": 156.8,
      "efficiency": 92,
      "temperature": 45
    }
  ],
  "alerts": [],
  "oee": {
    "availability": 92.5,
    "performance": 88.3,
    "quality": 97.8,
    "oee": 79.9
  }
}
```

### 模拟数据 (测试用)
- **URL**: `https://ftynbkxqqrigbbwhkult.supabase.co/functions/v1/simulate-data`
- **Method**: POST

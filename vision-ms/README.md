# Camera Ingest Service (multi-cámara, RabbitMQ)

Servicio de ingestión de video que soporta **N cámaras RTSP** en paralelo,
leyendo frames con OpenCV y publicando cada frame en **RabbitMQ** usando un
exchange tipo `topic`.

- Exchange: `camera.frames`
- Routing key por cámara: `camera.<cameraId>`
- Ej: `camera.cam01`, `camera.camLobby`

Cada mensaje enviado a RabbitMQ tiene la forma:

```json
{
  "cameraId": "cam01",
  "timestamp": 1734567890.123,
  "frame": "<JPEG_BASE64>",
  "fps": 10,
  "metadata": {}
}
```

# Instalación
```sh
cd camera-ingest-service
python3.11 -m venv .venv
source .venv/bin/activate
pip3.11 install --upgrade pip setuptools wheel
#pip3.11 install -e . # Instala el pyproject.toml
pip3.11 install -r requirements.txt
python3.11 -m src.main
deactivate # sale del env
```

# Ejecución
```sh
python3.11 -m src.main
```

# Elimina todas las carpertas __pycache__
find . -name "*.pyc" -delete
find . -type d -name "__pycache__" -exec rm -rf {} +

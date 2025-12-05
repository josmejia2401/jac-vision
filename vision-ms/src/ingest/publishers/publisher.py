from __future__ import annotations
import json
import logging
from typing import Any, Dict, Optional
import pika
#import ssl
#import certifi

logger = logging.getLogger(__name__)

class RabbitPublisher:

    def __init__(self, amqp_url: str, exchange: str) -> None:
        self._amqp_url = amqp_url
        self._exchange = exchange
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[pika.adapters.blocking_connection.BlockingChannel] = None

    def connect(self) -> None:
        if self._connection and self._connection.is_open:
            return
        logger.info("Connecting to RabbitMQ at %s", self._amqp_url)
        # SSL
        #ssl_context = ssl.create_default_context(cafile=certifi.where())
        #ssl_context.verify_mode = ssl.CERT_REQUIRED
        #ssl_context.check_hostname = True
        # RabbitMQ
        params = pika.URLParameters(self._amqp_url)
        params.heartbeat = 30
        # Si la conexión se bloquea (por slow consumer), cerrar después de X segundos
        params.blocked_connection_timeout = 30
        params.socket_timeout = 30
        params.connection_attempts = 5
        params.retry_delay = 5
        #SSL
        #params.ssl_options = pika.SSLOptions(ssl_context)
        #params.port = 5672
                
        self._connection = pika.BlockingConnection(params)
        self._channel = self._connection.channel()
        self._channel.confirm_delivery()
        self._channel.exchange_declare(
            exchange=self._exchange,
            exchange_type="topic",
            durable=True
        )
        logger.info("Connected to RabbitMQ at %s", self._amqp_url)

    def publish(self, routing_key: str, payload: Dict[str, Any]) -> None:
        if self._channel is None or self._channel.is_closed:
            self.connect()
        body = json.dumps(payload).encode("utf-8")
        assert self._channel is not None
        self._channel.basic_publish(
            exchange=self._exchange,
            routing_key=routing_key,
            body=body,
            properties=pika.BasicProperties(delivery_mode=1),  # mensajes NO  persistentes.  2 si es persistente
            mandatory=False
        )

    def close(self) -> None:
        try:
            if self._channel and self._channel.is_open:
                self._channel.close()
            if self._connection and self._connection.is_open:
                self._connection.close()
        except Exception as ex:
            logger.warning("Error closing RabbitMQ connection: %s", ex)

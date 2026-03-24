"""
MQTT Service for Real-Time Seat Updates (Mock Implementation)

In production, this would use paho-mqtt or aiomqtt to connect to an MQTT broker.
For now, this is a mock implementation that simulates MQTT behavior.

TODO: Replace with actual MQTT broker integration when deploying IoT sensors.
"""

import asyncio
import json
from typing import Dict, List, Optional, Callable
from datetime import datetime
from app.models.seat_layout import SeatStatus


class MockMQTTService:
    """
    Mock MQTT Service for testing and development.

    Simulates MQTT pub/sub behavior without requiring actual MQTT broker.
    Can be replaced with real MQTT client for production.
    """

    def __init__(self):
        self.connected = False
        self.subscribers: Dict[str, List[Callable]] = {}
        self.mock_broker_data: Dict[str, any] = {}

    async def connect(self, broker: str = "localhost", port: int = 1883):
        """Mock connect to MQTT broker"""
        print(f"[MQTT] [MOCK MQTT] Connecting to broker {broker}:{port}...")
        await asyncio.sleep(0.1)  # Simulate connection delay
        self.connected = True
        print(f"[OK] [MOCK MQTT] Connected successfully (MOCK MODE)")
        return True

    async def disconnect(self):
        """Mock disconnect from MQTT broker"""
        print(f"[MQTT] [MOCK MQTT] Disconnecting...")
        self.connected = False
        self.subscribers.clear()
        print(f"[OK] [MOCK MQTT] Disconnected")

    async def publish(self, topic: str, payload: dict):
        """
        Mock publish message to MQTT topic.

        In production, this would publish to actual MQTT broker.
        In mock mode, we just store the data and notify subscribers.
        """
        if not self.connected:
            print(f"[WARNING] [MOCK MQTT] Not connected, skipping publish to {topic}")
            return False

        # Store in mock broker
        self.mock_broker_data[topic] = {
            "payload": payload,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Notify subscribers
        if topic in self.subscribers:
            for callback in self.subscribers[topic]:
                try:
                    await callback(topic, payload)
                except Exception as e:
                    print(f"[ERROR] [MOCK MQTT] Error in subscriber callback: {e}")

        print(f"[PUBLISH] [MOCK MQTT] Published to {topic}: {json.dumps(payload)[:100]}...")
        return True

    async def subscribe(self, topic: str, callback: Callable):
        """
        Mock subscribe to MQTT topic.

        Args:
            topic: MQTT topic pattern (supports wildcards like event/+/seats)
            callback: Async function to call when message arrives
        """
        if topic not in self.subscribers:
            self.subscribers[topic] = []

        self.subscribers[topic].append(callback)
        print(f"[SUBSCRIBE] [MOCK MQTT] Subscribed to {topic}")
        return True

    async def publish_seat_update(self, event_id: str, seat_updates: List[dict]):
        """
        Publish seat status updates for an event.

        Args:
            event_id: Event ID
            seat_updates: List of seat updates [{seat_id, status, booking_id}, ...]
        """
        topic = f"event/{event_id}/seats/update"
        payload = {
            "event_id": event_id,
            "updates": seat_updates,
            "timestamp": datetime.utcnow().isoformat()
        }
        return await self.publish(topic, payload)

    async def publish_booking_confirmation(self, event_id: str, booking_data: dict):
        """
        Publish booking confirmation event.

        Args:
            event_id: Event ID
            booking_data: Booking details
        """
        topic = f"event/{event_id}/bookings/confirmed"
        payload = {
            "event_id": event_id,
            "booking": booking_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        return await self.publish(topic, payload)

    async def publish_capacity_alert(self, event_id: str, capacity_data: dict):
        """
        Publish capacity alert when event reaches threshold.

        Args:
            event_id: Event ID
            capacity_data: {total, sold, available, percentage_sold}
        """
        topic = f"event/{event_id}/capacity/alert"
        payload = {
            "event_id": event_id,
            "capacity": capacity_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        return await self.publish(topic, payload)

    def get_last_message(self, topic: str) -> Optional[dict]:
        """Get last message published to topic (mock data)"""
        data = self.mock_broker_data.get(topic)
        return data["payload"] if data else None


# Singleton instance
mqtt_service = MockMQTTService()


# Usage Example:
"""
# Connect to MQTT (mock)
await mqtt_service.connect()

# Subscribe to seat updates
async def on_seat_update(topic, payload):
    print(f"Seat updated: {payload}")

await mqtt_service.subscribe("event/+/seats/update", on_seat_update)

# Publish seat update
await mqtt_service.publish_seat_update(
    event_id="123",
    seat_updates=[
        {"seat_id": "A-12", "status": "booked", "booking_id": "BK-001"}
    ]
)

# Disconnect
await mqtt_service.disconnect()
"""

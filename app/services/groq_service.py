"""
Groq AI Service - FASTEST INFERENCE (FREE)
Get API key: https://console.groq.com/keys
Speed: 500-1000+ tokens/sec (5-10x faster than GPU inference!)
"""
from groq import Groq
from app.core.config import settings
from typing import List, Optional
import json


class GroqService:
    """Service for interacting with Groq AI - Fastest LLM Inference"""

    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.text_model = settings.GROQ_TEXT_MODEL

    async def generate_text(self, prompt: str, context: Optional[List[dict]] = None) -> str:
        """
        Generate text response using Groq (FASTEST!)

        Args:
            prompt: User message
            context: Previous conversation history [{"role": "user", "content": "..."}]

        Returns:
            AI response text
        """
        try:
            # Build messages array
            messages = []

            if context:
                # Add conversation history
                for msg in context:
                    role = "user" if msg["role"] == "user" else "assistant"
                    messages.append({
                        "role": role,
                        "content": msg["content"]
                    })

            # Add current prompt
            messages.append({
                "role": "user",
                "content": prompt
            })

            # Generate with Groq (BLAZING FAST!)
            completion = self.client.chat.completions.create(
                model=self.text_model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False
            )

            return completion.choices[0].message.content

        except Exception as e:
            print(f"Groq API Error: {e}")
            return "I apologize, I'm having trouble processing that. Could you rephrase?"

    async def extract_event_data(self, conversation_text: str) -> dict:
        """
        Extract structured event data from conversation using Groq

        Args:
            conversation_text: Full conversation history as text

        Returns:
            Extracted event data as dict
        """
        prompt = f"""
        Extract event details from this conversation and return as JSON:

        {conversation_text}

        Extract and return ONLY valid JSON with these fields (use null if not found):
        {{
            "title": "event name",
            "category": "concert/conference/workshop/sports/etc",
            "capacity": number,
            "start_datetime": "YYYY-MM-DD HH:MM:SS or null",
            "description": "brief description",
            "ticket_tiers": [],
            "tags": []
        }}

        Return ONLY the JSON object, no other text.
        """

        try:
            response = await self.generate_text(prompt)

            # Parse JSON from response
            # Clean response (remove markdown code blocks if present)
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            cleaned = cleaned.strip()

            data = json.loads(cleaned)
            return data

        except Exception as e:
            print(f"Data extraction error: {e}")
            return {}


# Singleton instance
groq_service = GroqService()

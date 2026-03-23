"""
Google Gemini AI Service (FREE)
Get API key: https://makersuite.google.com/app/apikey
"""
import google.generativeai as genai
from app.core.config import settings
from typing import List, Optional
import base64

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    """Service for interacting with Google Gemini AI"""

    def __init__(self):
        # Gemini 2.x models are multimodal - they support both text and vision!
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    async def generate_text(self, prompt: str, context: Optional[List[dict]] = None) -> str:
        """
        Generate text response using Gemini Pro (FREE)

        Args:
            prompt: User message
            context: Previous conversation history [{"role": "user", "content": "..."}]

        Returns:
            AI response text
        """
        try:
            # Build conversation history
            if context:
                # Format context for Gemini
                conversation = []
                for msg in context:
                    role = "user" if msg["role"] == "user" else "model"
                    conversation.append({
                        "role": role,
                        "parts": [msg["content"]]
                    })

                # Add current prompt
                conversation.append({
                    "role": "user",
                    "parts": [prompt]
                })

                # Generate with history
                chat = self.model.start_chat(history=conversation[:-1])
                response = chat.send_message(prompt)
            else:
                # Simple generation without context
                response = self.model.generate_content(prompt)

            return response.text

        except Exception as e:
            print(f"Gemini API Error: {e}")
            return "I apologize, I'm having trouble processing that. Could you rephrase?"

    async def analyze_image(self, image_path: str, prompt: str) -> dict:
        """
        Analyze image using Gemini Vision (FREE)

        Args:
            image_path: Path to image file
            prompt: Question about the image

        Returns:
            Dict with analysis results
        """
        try:
            # Read image
            with open(image_path, 'rb') as img_file:
                image_data = img_file.read()

            # Analyze with Gemini (multimodal - supports vision natively)
            response = self.model.generate_content([
                prompt,
                {"mime_type": "image/jpeg", "data": base64.b64encode(image_data).decode()}
            ])

            # Extract capacity estimate if mentioned
            text = response.text
            capacity_estimate = None

            # Simple parsing for capacity (can be improved)
            import re
            numbers = re.findall(r'\d+', text)
            if numbers:
                # Take first significant number as capacity estimate
                for num in numbers:
                    if int(num) > 10:  # Ignore small numbers
                        capacity_estimate = int(num)
                        break

            return {
                "message": text,
                "capacity_estimate": capacity_estimate,
                "venue_description": text[:200]  # First 200 chars as description
            }

        except Exception as e:
            print(f"Gemini Vision Error: {e}")
            return {
                "message": "I had trouble analyzing the image. The venue looks suitable for events.",
                "capacity_estimate": None,
                "venue_description": "Unable to analyze image at this time"
            }

    async def extract_event_data(self, conversation_text: str) -> dict:
        """
        Extract structured event data from conversation using Gemini

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
            import json
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
gemini_service = GeminiService()

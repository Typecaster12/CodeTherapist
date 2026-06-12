import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai

logger = logging.getLogger("code_therapist")

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    logger.info("Gemini API configured successfully.")
else:
    logger.warning("GEMINI_API_KEY environment variable is missing!")

def build_prompt(issue_text: str, category: str, confidence: float, emotion: str, tech: str) -> str:
    """
    Constructs a highly structured clinical prompt for the Gemini model.
    """
    return f"""
You are a "Code Therapist" — an empathetic, expert programming tutor.
Your patient is a developer who is stuck and experiencing struggle.
Our semantic diagnostic engine has analyzed their struggle and classified it:
- Diagnosed Struggle Category: {category} (Similarity Match Confidence: {confidence * 100:.1f}%)
- User's Emotional State: {emotion}
- Tech Stack/Framework: {tech}

Here is the issue context containing their error details and code snippet:
\"\"\"
{issue_text}
\"\"\"

Your task is to generate a structured 4-part clinical prescription:
1. "whyStuck": Explain the root cause of why they are stuck. Be educational, clear, and empathetic, helping them understand what they misunderstood or missed.
2. "immediateStep": Provide a concrete, small, actionable fix they can try right now to resolve the issue. Avoid writing massive code dumps. Explain the correction.
3. "studyNext": Detail one specific programming topic, framework mechanism, or debugging concept they should study to plug this knowledge gap and improve.
4. "prevention": Offer long-term advice (such as a debugging habit, design rule, or mindset shift) to prevent encountering similar struggles.

Tone Directives:
- Be empathetic, patient, and highly educational.
- Do NOT generate long raw code blocks unless absolutely essential. The goal is learning and understanding, not copy-pasting code.
- Return the output strictly in valid JSON format matching this schema:
{{
  "whyStuck": "Explanation...",
  "immediateStep": "Actionable fix...",
  "studyNext": "Concept outline...",
  "prevention": "Mindset/debugging advice..."
}}
Do NOT wrap the JSON in markdown code blocks (e.g. ```json or similar). Return ONLY the raw JSON text.
"""

def generate_prescription(issue_text: str, category: str, confidence: float, emotion: str, tech: str) -> dict:
    """
    Calls Gemini 2.5 Flash to generate a clinical prescription structure.
    """
    if not api_key:
        logger.error("Cannot call Gemini API: GEMINI_API_KEY is not configured.")
        return get_fallback_prescription(category)

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = build_prompt(issue_text, category, confidence, emotion, tech)
        
        # Enforce JSON output mode in Gemini API
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        text = response.text.strip()
        
        # Fallback cleaning in case model outputs markdown wrappers despite settings
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        prescription = json.loads(text)
        
        # Verify required keys exist
        required_keys = ["whyStuck", "immediateStep", "studyNext", "prevention"]
        for key in required_keys:
            if key not in prescription:
                prescription[key] = f"Information under {key} could not be parsed."
                
        return prescription

    except Exception as e:
        logger.error(f"Error calling Gemini or parsing response: {e}", exc_info=True)
        return get_fallback_prescription(category)

def get_fallback_prescription(category: str) -> dict:
    """
    Returns a robust fallback prescription matching the category if the API fails.
    """
    return {
        "whyStuck": f"We have classified your struggle as a '{category}'. Unfortunately, the AI prescription engine could not be reached to generate a personalized explanation.",
        "immediateStep": "Review the compiler traceback and verify that all dependencies and parameters are fully initialized.",
        "studyNext": f"Deep dive study materials related to '{category}' debugging and best practices.",
        "prevention": "Establish detailed logging parameters to catch state transitions before errors happen."
    }

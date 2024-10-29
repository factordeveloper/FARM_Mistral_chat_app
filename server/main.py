from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime
import requests
import os

# Configuración de la aplicación
app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión a MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["mistral_chatbot_db"]
collection = db["prompts"]

# Modelo para solicitud de prompt
class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/prompt")
async def send_prompt(request: PromptRequest):
    api_key = "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"
    prompt_text = request.prompt
    #api_key = os.getenv("HF_API_KEY")

    # Llamada a la API de Hugging Face
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistralai/Mistral-Nemo-Instruct-2407",
        "messages": [{"role": "user", "content": prompt_text}],
        "max_tokens": 500,
        "stream": False
    }
    url = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407/v1/chat/completions"
    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error in API request")

    data = response.json()
    response_text = data.get("choices", [{}])[0].get("message", {}).get("content", "No response available")

    # Guardar el prompt y la respuesta en MongoDB
    collection.insert_one({
        "prompt": prompt_text,
        "response": response_text,
        "timestamp": datetime.utcnow()
    })

    return {"response": response_text}

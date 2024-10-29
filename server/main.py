from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from database import collection
from models import Message
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Permitir peticiones desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite solo tu frontend React
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)

API_KEY = os.getenv("API_KEY", "your-huggingface-api-key")
MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407/v1/chat/completions"

class Prompt(BaseModel):
    prompt: str

@app.post("/ask", response_model=Message)
async def ask(prompt_data: Prompt):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    request_body = {
        "model": "mistralai/Mistral-Nemo-Instruct-2407",
        "messages": [{"role": "user", "content": prompt_data.prompt}],
        "max_tokens": 500,
        "stream": False
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(MODEL_URL, headers=headers, json=request_body)
        response_data = response.json()
        
        if "error" in response_data:
            raise HTTPException(status_code=400, detail=response_data["error"]["message"])

        response_text = response_data["choices"][0]["message"]["content"]
        
        message = Message(prompt=prompt_data.prompt, response=response_text)
        await collection.insert_one(message.dict(by_alias=True))
        
        return message

@app.get("/history", response_model=List[Message])
async def get_history():
    messages = await collection.find().to_list(100)
    return messages

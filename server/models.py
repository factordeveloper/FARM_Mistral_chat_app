from pydantic import BaseModel, Field
from typing import Optional

class Message(BaseModel):
    prompt: str
    response: str
    id: Optional[str] = Field(alias="_id")
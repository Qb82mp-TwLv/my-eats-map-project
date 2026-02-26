from fastapi import *
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from dbusing import db
from pydantic import BaseModel
from typing import Optional

router = APIRouter()
oauth2 = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

@router.get("/api/follow")
async def get_follow_info(user_id: int, token: Optional[str]=Depends(oauth2)):
    
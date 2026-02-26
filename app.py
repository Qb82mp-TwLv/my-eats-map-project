from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from controller.index import router as index_router
from controller.user import router as user_router
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

app=FastAPI()
app.include_router(index_router)
app.include_router(user_router)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(SessionMiddleware,
                   secret_key=os.getenv("API_SECRET_KEY"),
                   max_age=1800,
                   https_only=True)

# 避免其他人直接偷換殼
app.add_middleware(CORSMiddleware,
                   allow_origins=["http://127.0.0.1"],
                   allow_credentials=True,
                   allow_methods=[
                       "GET",
                       "POST",
                       "PUT",
                       "PATCH"
                   ],
                   allow_headers=["Authorization", "Content-Type"])

@app.get("/eatsmap", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")

@app.get("/member", include_in_schema=False)
async def member_center(request: Request):
    return FileResponse("./static/member.html", media_type="text/html")

@app.get("/setting", include_in_schema=False)
async def member_setting(request: Request):
    return FileResponse("./static/membersetting.html", media_type="text/html")

@app.get("/postcomment", include_in_schema=False)
async def post_comment(request: Request):
    return FileResponse("./static/postcomment.html", media_type="text/html")

@app.get("/login", include_in_schema=False)
async def login_ui(request: Request):
    return FileResponse("./static/login.html", media_type="text/html")

@app.get("/api/mapvalue")
async def map_value():
    try:
        load_dotenv()
        _result = os.getenv("API_GOOGEL_MAP_KEY")
        return JSONResponse({"data": _result})
    except Exception:
        return JSONResponse({"error": "根據執行結果發生錯誤。"})
    
@app.get("/api/mapid")
async def map_value():
    try:
        load_dotenv()
        _result = os.getenv("API_GOOGLE_MAPID")
        return JSONResponse({"data": _result})
    except Exception:
        return JSONResponse({"error": "根據執行結果發生錯誤。"})
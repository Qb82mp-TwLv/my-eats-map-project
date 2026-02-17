from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from controller.index import router as index_router
from dotenv import load_dotenv
import os

app=FastAPI()
app.include_router(index_router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/eatsmap", include_in_schema=False)
async def index(request: Request):
    return FileResponse("./static/index.html", media_type="text/html")

@app.get("/member", include_in_schema=False)
async def member_center(request: Request):
    return FileResponse("./static/member.html", media_type="text/html")

@app.get("/setting", include_in_schema=False)
async def member_setting(request: Request):
    return FileResponse("./static/membersetting.html", media_type="text/html")

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
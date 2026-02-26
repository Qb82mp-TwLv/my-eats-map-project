from fastapi import *
from fastapi.responses import JSONResponse
from dbusing import db
from view.indexV import country_info, city_info, types_info

router = APIRouter()

@router.get("/api/countryname")
async def get_country_name():
    get_dt = await db.query_country_name()
    if isinstance(get_dt, list):
        dt_json = country_info(get_dt)
        return JSONResponse(dt_json)
    
    return JSONResponse({"error": "根據執行結果發生錯誤。"})

@router.get("/api/cityname")
async def get_city_name(country: str = None):
    if (country != None):
        get_dt = await db.query_city_name(country)
        if isinstance(get_dt, list):
            dt_json = city_info(get_dt)
            return JSONResponse(dt_json)
        
    return JSONResponse({"error": "根據執行結果發生錯誤。"})

@router.get("/api/typesname")
async def get_city_name():
    get_dt = await db.query_types_name()
    if isinstance(get_dt, list):
        dt_json = types_info(get_dt)
        return JSONResponse(dt_json)
        
    return JSONResponse({"error": "根據執行結果發生錯誤。"})